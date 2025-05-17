"use strict";

import { hipsShaderProgram } from '../../shaders/HiPSShaderProgram.js';
import global from '../../Global.js';
import { newTileBuffer } from './TileBuffer.js';
// import { Xyf } from 'healpixjs';
import pkg from 'canvas';
const { createCanvas } = pkg;

class AllSky {

	constructor(hips) {

		this._ready = false;
		this._hips = hips;

		this._format = hips.format;
		this._baseurl = hips.baseURL;
		this._maxorder = hips.maxOrder;
		this._minorder = hips.minOrder;
		this._isGalacticHips = hips.isGalacticHips;

		// this._order = order;
		this._hipsRefOrder = global.HIPS_REF_ORDER; // used for geometry and texture mapping
		this._hipsTextureOrder = 3; // AllSky is a map of order 3 tiles

		this.opacity = 1.00;

		this._hipsShaderIndex = 0;
		this._pixels = [];

		this._texture = undefined;

		this.initImage();

		this.pxsizeByOrder = new Map();
		this.pxsizeByOrder.set(3, {s_step: 64/1728, t_step: 64/1856, px_in_edge: 64})
		this.pxsizeByOrder.set(4, {s_step: 32/1728, t_step: 32/1856, px_in_edge: 32})
		this.pxsizeByOrder.set(5, {s_step: 16/1728, t_step: 16/1856, px_in_edge: 16})
		this.pxsizeByOrder.set(6, {s_step: 8/1728, t_step: 8/1856, px_in_edge: 8})
		this.pxsizeByOrder.set(7, {s_step: 4/1728, t_step: 4/1856, px_in_edge: 4})
		this.pxsizeByOrder.set(8, {s_step: 2/1728, t_step: 2/1856, px_in_edge: 2})

	}

	initImage() {

		this._image = new Image();

		this._texurl = this._baseurl + "/Norder3/Allsky." + this._format;

		this._image.onload = () => {
			this.imageLoaded();

		};
		this._image.onerror = () => {
			console.error("File not found? {}", this._texurl)
		};

		this._image.setAttribute('crossorigin', 'anonymous');
		this._image.src = this._texurl;

	}

	imageLoaded() {

		this.texturesArray = this.splitImage()
		
		this.gl_textures = new Array(768)
		this.vertexPositionBuffer = [];
		this.vertexIndexBuffer = [];
		

		for (let p=0; p<768; p++){

			this.textureLoaded(p)
			global.gl.activeTexture(global.gl.TEXTURE0 + this._hipsShaderIndex)
			global.gl.bindTexture(global.gl.TEXTURE_2D, this.gl_textures[p])
			global.gl.texImage2D(global.gl.TEXTURE_2D, 0, global.gl.RGBA, global.gl.RGBA, global.gl.UNSIGNED_BYTE, this.texturesArray[p])

			this.initModelBuffer(p)

			

		}
		this._textureLoaded = true
		this._ready = true

	}

	splitImage() {
		let textures = []
		
		const imgW = this._image.width;
		const imgH = this._image.height;
		let c = createCanvas(imgW, imgH)
		const ctx = c.getContext("2d")
		// ctx.createImageData(c.width, c.height);
		ctx.drawImage(this._image, 0, 0, imgW, imgH);
		
		const tileCountX = 27
		const tileCountY = 29
		
		const tilePxSize = this._image.width / tileCountX
		
		let tileno=0
		for (let row=0; row < tileCountY; row++) {
			for (let col=0; col < tileCountX; col++) {
				
				const imgData = ctx.getImageData(col * 64 , row * 64, 64, 64).data
				textures.push(new ImageData(imgData, 64, 64))
				tileno++
				if (tileno == 768) break
			}
		}
		
		// textures.forEach( t => {
		// 	const ctx2 = c.getContext("2d")
		// 	ctx2.putImageData(t, 0, 0);
		// 	const image = new Image();
		// 	image.src = c.toDataURL();
		// 	// console.log(image.src)
		// })


		return textures
	}

	textureLoaded(p) {

		hipsShaderProgram.enableProgram();

        this.gl_textures[p] = global.gl.createTexture();
        global.gl.activeTexture(global.gl.TEXTURE0 + this._hipsShaderIndex);
        global.gl.pixelStorei(global.gl.UNPACK_FLIP_Y_WEBGL, true);
        global.gl.bindTexture(global.gl.TEXTURE_2D, this.gl_textures[p]);

        global.gl.texParameteri(global.gl.TEXTURE_2D, global.gl.TEXTURE_WRAP_S, global.gl.CLAMP_TO_EDGE);
        global.gl.texParameteri(global.gl.TEXTURE_2D, global.gl.TEXTURE_WRAP_T, global.gl.CLAMP_TO_EDGE);

        global.gl.texParameteri(global.gl.TEXTURE_2D, global.gl.TEXTURE_MIN_FILTER, global.gl.LINEAR);
        global.gl.texParameteri(global.gl.TEXTURE_2D, global.gl.TEXTURE_MAG_FILTER, global.gl.LINEAR);

        global.gl.uniform1i(hipsShaderProgram.shaderProgram.samplerUniform, this._hipsShaderIndex);

        if (!global.gl.isTexture(this.gl_textures[p])) {
            console.log("error in texture");
        }

	}

	/**
	 * 
	 * |10|11|14|15|
	 * |8 |9 |12|13|
	 * |2 |3 |6 |7 |
	 * |0 |1 |4 |5 |
	 * 
	 */
	initModelBuffer(tileno) {

		const tgtOrder = 4
		const origHealpix = global.getHealpix(3)
        const origxyf = origHealpix.nest2xyf(tileno)
        const orderjump = tgtOrder - 3
		this._numFacesXTile = (2**orderjump) * (2**orderjump)

		let vertexPosition = new Float32Array(20 * this._numFacesXTile)
		
		const dxmin = origxyf.ix << orderjump;
        const dxmax = (origxyf.ix << orderjump) + (1 << orderjump);
        const dymin = origxyf.iy << orderjump;
        const dymax = (origxyf.iy << orderjump) + (1 << orderjump);

        const tgtHealpix = global.getHealpix(tgtOrder)

        const q1 = this.setupPositionAndTexture4Quadrant2(dxmin, dxmin + (dxmax - dxmin) / 2, dymin, dymin + (dymax - dymin) / 2, 0, tgtHealpix, orderjump, origxyf)
        const q2 = this.setupPositionAndTexture4Quadrant2(dxmin + (dxmax - dxmin) / 2, dxmax, dymin, dymin + (dymax - dymin) / 2, 1, tgtHealpix, orderjump, origxyf)
        const q3 = this.setupPositionAndTexture4Quadrant2(dxmin, dxmin + (dxmax - dxmin) / 2, dymin + (dymax - dymin) / 2, dymax, 2, tgtHealpix, orderjump, origxyf)
        const q4 = this.setupPositionAndTexture4Quadrant2(dxmin + (dxmax - dxmin) / 2, dxmax, dymin + (dymax - dymin) / 2, dymax, 3, tgtHealpix, orderjump, origxyf)

		vertexPosition.set(q1, 0)
		vertexPosition.set(q2, q1.length)
		vertexPosition.set(q3, q1.length * 2)
		vertexPosition.set(q4, q1.length * 3)
		// console.log(vertexPosition)

        const vertexIndices = this.computeVertexIndices(this._numFacesXTile);
        this.vertexIndexBuffer[tileno] = global.gl.createBuffer()
		// console.log(vertexIndices)

        global.gl.bindBuffer(global.gl.ELEMENT_ARRAY_BUFFER, this.vertexIndexBuffer[tileno]);
        global.gl.bufferData(global.gl.ELEMENT_ARRAY_BUFFER, vertexIndices, global.gl.STATIC_DRAW);

		this.vertexPositionBuffer[tileno] = global.gl.createBuffer();
        global.gl.bindBuffer(global.gl.ARRAY_BUFFER, this.vertexPositionBuffer[tileno]);
        global.gl.bufferData(global.gl.ARRAY_BUFFER, vertexPosition, global.gl.STATIC_DRAW);
		
	}

	float32Concat(first, second) {
		const firstLength = first.length,
			result = new Float32Array(firstLength + second.length);

		result.set(first);
		result.set(second, firstLength);

		return result;
	}
	
	computeVertexIndices(maxSubTiles) {
		let vertexIndices = new Uint16Array(6 * maxSubTiles)
		let baseFaceIndex = 0

		for (let i = 0; i < maxSubTiles; i++) {
			vertexIndices[6 * i] = baseFaceIndex;
			vertexIndices[6 * i + 1] = baseFaceIndex + 1;
			vertexIndices[6 * i + 2] = baseFaceIndex + 3;

			vertexIndices[6 * i + 3] = baseFaceIndex + 1;
			vertexIndices[6 * i + 4] = baseFaceIndex + 2;
			vertexIndices[6 * i + 5] = baseFaceIndex + 3;

			baseFaceIndex = baseFaceIndex + 4;

		}
		return vertexIndices

	}

	
	setupPositionAndTexture4Quadrant2(dxmin, dxmax, dymin, dymax, qidx, healpix, orderjump, origxyf) {

        let facesVec3Array = new Array();
        let vertexPosition = new Float32Array(20 * (dxmax - dxmin) * (dymax - dymin));

        let step = 1 / (1 << orderjump);
        let uindex = 0;
        let vindex = 0;
        let p = 0

        for (let dx = dxmin; dx < dxmax; dx++) {
            for (let dy = dymin; dy < dymax; dy++) {
                
                facesVec3Array = healpix.getPointsForXyfNoStep(dx, dy, origxyf.face);
                
				uindex = dy - (origxyf.iy << orderjump);
                vindex = dx - (origxyf.ix << orderjump);

                vertexPosition[20 * p] = facesVec3Array[0].x;
                vertexPosition[20 * p + 1] = facesVec3Array[0].y;
                vertexPosition[20 * p + 2] = facesVec3Array[0].z;
                vertexPosition[20 * p + 3] = step + (step * uindex);
                vertexPosition[20 * p + 4] = 1 - (step + step * vindex);

                vertexPosition[20 * p + 5] = facesVec3Array[1].x;
                vertexPosition[20 * p + 6] = facesVec3Array[1].y;
                vertexPosition[20 * p + 7] = facesVec3Array[1].z;
                vertexPosition[20 * p + 8] = step + (step * uindex);
                vertexPosition[20 * p + 9] = 1 - (step * vindex);

                vertexPosition[20 * p + 10] = facesVec3Array[2].x;
                vertexPosition[20 * p + 11] = facesVec3Array[2].y;
                vertexPosition[20 * p + 12] = facesVec3Array[2].z;
                vertexPosition[20 * p + 13] = step * uindex;
                vertexPosition[20 * p + 14] = 1 - (step * vindex);

                vertexPosition[20 * p + 15] = facesVec3Array[3].x;
                vertexPosition[20 * p + 16] = facesVec3Array[3].y;
                vertexPosition[20 * p + 17] = facesVec3Array[3].z;
                vertexPosition[20 * p + 18] = step * uindex;
                vertexPosition[20 * p + 19] = 1 - (step + step * vindex);
                p++;
            }
        }

		return vertexPosition
        

    }



	draw(visibleOrder, visibleTilesMap, pMatrix, vMatrix, mMatrix, colorMapIdx) {
		if (!this._ready) {
			return false;
		}
		let allSkyTiles2Skip = []
		if (visibleOrder >= this._order) {
			allSkyTiles2Skip = this.drawChildren(visibleOrder, visibleTilesMap, pMatrix, vMatrix, mMatrix, colorMapIdx);
		}

		hipsShaderProgram.enableShaders(pMatrix, vMatrix, mMatrix, colorMapIdx);
		// TODO check if the enable below can be moved into hipsShaderProgram.enableShaders
		global.gl.enableVertexAttribArray(hipsShaderProgram.locations.vertexPositionAttribute);
		global.gl.enableVertexAttribArray(hipsShaderProgram.locations.textureCoordAttribute);

		

		// global.gl.bindBuffer(global.gl.ARRAY_BUFFER, this.vertexPositionBuffer);
		// global.gl.bindBuffer(global.gl.ELEMENT_ARRAY_BUFFER, this.vertexIndexBuffer);

		global.gl.vertexAttribPointer(hipsShaderProgram.locations.vertexPositionAttribute, 3, global.gl.FLOAT, false, 5 * 4, 0);
		global.gl.vertexAttribPointer(hipsShaderProgram.locations.textureCoordAttribute, 2, global.gl.FLOAT, false, 5 * 4, 3 * 4);

		for (let t = 0; t < 768; t++) {
			if (!allSkyTiles2Skip.includes(t)) {

				global.gl.activeTexture(global.gl.TEXTURE0 + this._hipsShaderIndex);
				global.gl.bindTexture(global.gl.TEXTURE_2D, this.gl_textures[t]);
				global.gl.uniform1f(hipsShaderProgram.locations.textureAlpha, this.opacity);
				// global.gl.texImage2D(global.gl.TEXTURE_2D, 0, global.gl.RGBA, global.gl.RGBA, global.gl.UNSIGNED_BYTE, this.texturesArray[t]);

				global.gl.bindBuffer(global.gl.ELEMENT_ARRAY_BUFFER, this.vertexIndexBuffer[t]);
				global.gl.bindBuffer(global.gl.ARRAY_BUFFER, this.vertexPositionBuffer[t]);
				
				// global.gl.drawElements(global.gl.TRIANGLES, 6 * this._numFacesXTile, global.gl.UNSIGNED_SHORT, 12 * t * this._numFacesXTile);
				global.gl.drawElements(global.gl.TRIANGLES, 6 * this._numFacesXTile, global.gl.UNSIGNED_SHORT, 0);
			}
				
		}

		global.gl.disableVertexAttribArray(hipsShaderProgram.locations.vertexPositionAttribute);
		global.gl.disableVertexAttribArray(hipsShaderProgram.locations.textureCoordAttribute);
	}


	drawChildren(visibleOrder, visibleTilesMap, pMatrix, vMatrix, mMatrix, colorMapIdx) {

		let childrenOrder = this._order;
		if (!visibleTilesMap.has(childrenOrder)) {
			return;
		}
		
		let visibleTiles = visibleTilesMap.get(childrenOrder);
		let allSkyTiles2Skip = []
		for (let t = 0; t < visibleTiles.length; t++) {
			let childTile = undefined
			if (this._isGalacticHips) {
				childTile = newTileBuffer.getGalTile(visibleTiles[t], childrenOrder, this._hips);
			} else {
				childTile = newTileBuffer.getTile(visibleTiles[t], childrenOrder, this._hips);
			}

			childTile.draw(visibleOrder, visibleTilesMap, pMatrix, vMatrix, mMatrix, colorMapIdx);
			if (childTile._ready) {
				allSkyTiles2Skip.push(visibleTiles[t])
			}
		}
		return allSkyTiles2Skip;
	}

}
export default AllSky;