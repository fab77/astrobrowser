"use strict";

import { hipsShaderProgram } from '../../shaders/HiPSShaderProgram.js';
import global from '../../Global.js';
import { newTileBuffer } from './TileBuffer.js';
import { Xyf } from 'healpixjs';

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
		this._order = 3;

		this.opacity = 1.00;

		this._hipsShaderIndex = 0;
		this._pixels = [];

		this._texture = undefined;

		this.initImage();

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

		this.textureLoaded();
		this.initModelBuffer();
		// global.gl.activeTexture(global.gl.TEXTURE0 + this._hipsShaderIndex);
		// global.gl.bindTexture(global.gl.TEXTURE_2D, this._texture);
		// global.gl.texImage2D(global.gl.TEXTURE_2D, 0, global.gl.RGBA, global.gl.RGBA, global.gl.UNSIGNED_BYTE, this._image);
		// global.gl.generateMipmap(global.gl.TEXTURE_2D);
		// global.gl.texParameteri(global.gl.TEXTURE_2D, global.gl.TEXTURE_MIN_FILTER, global.gl.LINEAR_MIPMAP_LINEAR);

		this._textureLoaded = true;
		this._ready = true;

	}

	textureLoaded() {

		hipsShaderProgram.enableProgram();

		this._texture = global.gl.createTexture();
		global.gl.activeTexture(global.gl.TEXTURE0 + this._hipsShaderIndex);
		global.gl.pixelStorei(global.gl.UNPACK_FLIP_Y_WEBGL, true);
		global.gl.bindTexture(global.gl.TEXTURE_2D, this._texture);

		
		// global.gl.texParameteri(global.gl.TEXTURE_2D, global.gl.TEXTURE_MIN_FILTER, global.gl.LINEAR_MIPMAP_LINEAR);

		// from WW
		// global.gl.texParameteri(global.gl.TEXTURE_2D, global.gl.TEXTURE_WRAP_S, global.gl.CLAMP_TO_EDGE);
		// global.gl.texParameteri(global.gl.TEXTURE_2D, global.gl.TEXTURE_WRAP_T, global.gl.CLAMP_TO_EDGE);

		// global.gl.texParameteri(global.gl.TEXTURE_2D, global.gl.TEXTURE_MIN_FILTER, global.gl.LINEAR);
		// global.gl.texParameteri(global.gl.TEXTURE_2D, global.gl.TEXTURE_MAG_FILTER, global.gl.LINEAR);

		global.gl.uniform1i(hipsShaderProgram.shaderProgram.samplerUniform, this._hipsShaderIndex);

		if (!global.gl.isTexture(this._texture)) {
			console.log("error in texture");
		}
		global.gl.activeTexture(global.gl.TEXTURE0 + this._hipsShaderIndex);
		global.gl.bindTexture(global.gl.TEXTURE_2D, this._texture);
		global.gl.texImage2D(global.gl.TEXTURE_2D, 0, global.gl.RGBA, global.gl.RGBA, global.gl.UNSIGNED_BYTE, this._image);
		global.gl.generateMipmap(global.gl.TEXTURE_2D);
		global.gl.texParameteri(global.gl.TEXTURE_2D, global.gl.TEXTURE_MIN_FILTER, global.gl.LINEAR_MIPMAP_LINEAR);
		global.gl.texParameteri(global.gl.TEXTURE_2D, global.gl.TEXTURE_WRAP_S, global.gl.CLAMP_TO_EDGE);
		global.gl.texParameteri(global.gl.TEXTURE_2D, global.gl.TEXTURE_WRAP_T, global.gl.CLAMP_TO_EDGE);
	}


	initModelBuffer() {		
		let hpx = global.getHealpix(this._order);
		this._maxTiles = hpx.getNPix();

		// const tgtHpxOrder = this._order + 1;
		// const healpix = global.getHealpix(this._order)
		// const orderjump = tgtHpxOrder - this._order;
		// const tgtHealpix = global.getHealpix(tgtHpxOrder)
		
		const orderjump = 1;
		const tgtHpxOrder = this._order + orderjump;
		const healpix = global.getHealpix(this._order)
		const tgtHealpix = global.getHealpix(tgtHpxOrder)
	
		this._numFacesXTile = 4 ** orderjump; // used in gl.draw
		this._numFaces = this._numFacesXTile * this._maxTiles
		this.vertexPosition = new Float32Array(20 * this._numFaces);

		let sindex = 0;
		let tindex = 0;
		this.vidx = 0;
		for (let t = 0; t < this._maxTiles; t++) {

			const xyf = healpix.nest2xyf(t);
			const dxmin = xyf.ix << orderjump;
			const dxmax = (xyf.ix << orderjump) + (1 << orderjump);
			const dymin = xyf.iy << orderjump;
			const dymax = (xyf.iy << orderjump) + (1 << orderjump);
			this.setupPositionAndTexture4Quadrant(sindex, tindex, dxmin, dxmin + (dxmax - dxmin) / 2, dymin, dymin + (dymax - dymin) / 2, tgtHealpix, xyf, 0, 0);
			this.setupPositionAndTexture4Quadrant(sindex, tindex, dxmin + (dxmax - dxmin) / 2, dxmax, dymin, dymin + (dymax - dymin) / 2, tgtHealpix, xyf, 0, 1);
			this.setupPositionAndTexture4Quadrant(sindex, tindex, dxmin, dxmin + (dxmax - dxmin) / 2, dymin + (dymax - dymin) / 2, dymax, tgtHealpix, xyf, 1, 0);
			this.setupPositionAndTexture4Quadrant(sindex, tindex, dxmin + (dxmax - dxmin) / 2, dxmax, dymin + (dymax - dymin) / 2, dymax, tgtHealpix, xyf, 1, 1);
			
			// const dxmin = xyf.ix << (orderjump);
			// const dxmax = (xyf.ix << (orderjump)) + (1 << (2*orderjump));
			// const dymin = xyf.iy << (orderjump);
			// const dymax = (xyf.iy << (orderjump)) + (1 << (2*orderjump));
			// this.setupPositionAndTexture4Quadrant2(sindex, tindex, orderjump, tgtHealpix, xyf, 0, 0);
			// this.setupPositionAndTexture4Quadrant2(sindex, tindex, orderjump, tgtHealpix, xyf, 0, 1);
			// this.setupPositionAndTexture4Quadrant2(sindex, tindex, orderjump, tgtHealpix, xyf, 1, 0);
			// this.setupPositionAndTexture4Quadrant2(sindex, tindex, orderjump, tgtHealpix, xyf, 1, 1);
			

			
			sindex++;
			if (sindex == 27 ) {
				tindex++;
				sindex = 0;
			}

		}

		
		let vertexIndices = new Uint16Array(6 * this._numFaces);
		let baseFaceIndex = 0;
		for (let i = 0; i < this._numFaces; i++) {
			vertexIndices[6 * i] = baseFaceIndex;
			vertexIndices[6 * i + 1] = baseFaceIndex + 1;
			vertexIndices[6 * i + 2] = baseFaceIndex + 3;

			vertexIndices[6 * i + 3] = baseFaceIndex + 1;
			vertexIndices[6 * i + 4] = baseFaceIndex + 2;
			vertexIndices[6 * i + 5] = baseFaceIndex + 3;

			baseFaceIndex = baseFaceIndex + 4;
		}

		this.vertexPositionBuffer = global.gl.createBuffer();
		global.gl.bindBuffer(global.gl.ARRAY_BUFFER, this.vertexPositionBuffer);
		global.gl.bufferData(global.gl.ARRAY_BUFFER, this.vertexPosition, global.gl.STATIC_DRAW);

		this.vertexIndexBuffer = global.gl.createBuffer();
		global.gl.bindBuffer(global.gl.ELEMENT_ARRAY_BUFFER, this.vertexIndexBuffer);
		global.gl.bufferData(global.gl.ELEMENT_ARRAY_BUFFER, vertexIndices, global.gl.STATIC_DRAW);
	};


	setupPositionAndTexture4Quadrant2(sindex, tindex, orderjump, tgthealpix, xyf, qx, qy) {

		let facesVec3Array = new Array();
		
		// const factor = 2 ** (tgthealpix.order - 3)
		const factor = 2 ** (orderjump)
		
		// 64x64 pixel into the AllSky image
		const s_order3_step = 1 / 27 
		const t_order3_step = 1 / 29 

		const s_image_step = s_order3_step / factor;
		const t_image_step = t_order3_step / factor;
		

		// let s_pxXtile = 1728 / (27 * factor)
		// const s_pixel_size = s_image_step / s_pxXtile
		
		// let t_pxXtile = 1856 / (29 * factor)
		// const t_pixel_size = t_image_step / t_pxXtile

		const base_image_s = s_order3_step * sindex + (2**(orderjump-1)) * s_image_step * qx
		const base_image_t = 1 - t_order3_step * tindex + (2**(orderjump-1)) * t_image_step * qy

		const points_in_quadrant_edge = 2**orderjump / 2
		
		for (let dx = 0; dx <= points_in_quadrant_edge; dx++) {
			for (let dy = 0; dy <= points_in_quadrant_edge; dy++) {

				facesVec3Array = tgthealpix.getPointsForXyfNoStep(dx, dy, xyf.face);
				// let tileno = tgthealpix.xyf2nest(dx, dy, xyf.face)
				// uindex = dy - (xyf.iy << orderjump);
				// vindex = dx - (xyf.ix << orderjump);

				// bottom left 
				this.vertexPosition[20 * this.vidx] = facesVec3Array[0].x;
				this.vertexPosition[20 * this.vidx + 1] = facesVec3Array[0].y;
				this.vertexPosition[20 * this.vidx + 2] = facesVec3Array[0].z;
				// this.vertexPosition[20 * this.vidx + 3] = s_step + base_s - s_pixel_size;
				// this.vertexPosition[20 * this.vidx + 4] = 1 - (t_step + base_t);
				//bottom right
				this.vertexPosition[20 * this.vidx + 3] = base_image_s + (s_image_step * dx);
				this.vertexPosition[20 * this.vidx + 4] = base_image_t + (t_image_step * dy) ;

				// top left 
				this.vertexPosition[20 * this.vidx + 5] = facesVec3Array[1].x;
				this.vertexPosition[20 * this.vidx + 6] = facesVec3Array[1].y;
				this.vertexPosition[20 * this.vidx + 7] = facesVec3Array[1].z;
				// this.vertexPosition[20 * this.vidx + 8] = s_step + base_s - s_pixel_size;
				// this.vertexPosition[20 * this.vidx + 9] = 1 - base_t - t_pixel_size;
				//top right
				this.vertexPosition[20 * this.vidx + 8] = base_image_s + (s_image_step * dx) + s_image_step;
				this.vertexPosition[20 * this.vidx + 9] = base_image_t + (t_image_step * dy) + t_image_step;

				// top right
				this.vertexPosition[20 * this.vidx + 10] = facesVec3Array[2].x;
				this.vertexPosition[20 * this.vidx + 11] = facesVec3Array[2].y;
				this.vertexPosition[20 * this.vidx + 12] = facesVec3Array[2].z;
				// this.vertexPosition[20 * this.vidx + 13] = base_s;
				// this.vertexPosition[20 * this.vidx + 14] = 1 - base_t -	 t_pixel_size;
				//top left
				this.vertexPosition[20 * this.vidx + 13] = base_image_s ;
				this.vertexPosition[20 * this.vidx + 14] = 1 - base_image_t;
				
				// bottom right
				this.vertexPosition[20 * this.vidx + 15] = facesVec3Array[3].x;
				this.vertexPosition[20 * this.vidx + 16] = facesVec3Array[3].y;
				this.vertexPosition[20 * this.vidx + 17] = facesVec3Array[3].z;
				// this.vertexPosition[20 * this.vidx + 18] = base_s + s_pixel_size;
				// this.vertexPosition[20 * this.vidx + 19] = 1 - (t_step + base_t);
				//bottom left
				this.vertexPosition[20 * this.vidx + 18] = base_image_s;
				this.vertexPosition[20 * this.vidx + 19] = 1 - base_image_t - (t_image_step * dy) ;
				
				
				this.vidx++;
			}
		}

	}

	setupPositionAndTexture4Quadrant(sindex, tindex, dxmin, dxmax, dymin, dymax, tgthealpix, xyf, qx, qy) {

		let facesVec3Array = new Array();
		
		// const factor = 2 ** (tgthealpix.order - 3)
		const factor = 2 * (tgthealpix.order - 3)
		// const factor = this._numFacesXTile / 2
		
		// const uindex = sindex; 
		// const vindex = tindex;
		
		// 64x64 pixel into the AllSky image

		//0.037037037
		const s_step = 1 / (27 * factor);
		//0.034482759
		const t_step = 1 / (29 * factor);
		

		let s_pxXtile = 1728 / (27 * factor)
		const s_pixel_size = s_step / s_pxXtile
		// const epsilon_s = 0

		
		let t_pxXtile = 1856 / (29 * factor)
		const t_pixel_size = t_step / t_pxXtile
		// const epsilon_t = 0

		const base_s = factor * s_step * sindex + s_step * qx
		const base_t = factor * t_step * tindex + t_step * qy
		for (let dx = dxmin; dx < dxmax; dx++) {
			for (let dy = dymin; dy < dymax; dy++) {

				facesVec3Array = tgthealpix.getPointsForXyfNoStep(dx, dy, xyf.face);
				// let tileno = tgthealpix.xyf2nest(dx, dy, xyf.face)
				// uindex = dy - (xyf.iy << orderjump);
				// vindex = dx - (xyf.ix << orderjump);

				// bottom left 
				this.vertexPosition[20 * this.vidx] = facesVec3Array[0].x;
				this.vertexPosition[20 * this.vidx + 1] = facesVec3Array[0].y;
				this.vertexPosition[20 * this.vidx + 2] = facesVec3Array[0].z;
				this.vertexPosition[20 * this.vidx + 3] = s_step + base_s - s_pixel_size;
				this.vertexPosition[20 * this.vidx + 4] = 1 - (t_step + base_t);
				//bottom right
				// this.vertexPosition[20 * this.vidx + 3] = (s_step*dy) + s_step + base_s - s_pixel_size;
				// this.vertexPosition[20 * this.vidx + 4] = (t_step*dx) + 1 - t_step - base_t;

				// top left 
				this.vertexPosition[20 * this.vidx + 5] = facesVec3Array[1].x;
				this.vertexPosition[20 * this.vidx + 6] = facesVec3Array[1].y;
				this.vertexPosition[20 * this.vidx + 7] = facesVec3Array[1].z;
				this.vertexPosition[20 * this.vidx + 8] = s_step + base_s - s_pixel_size;
				this.vertexPosition[20 * this.vidx + 9] = 1 - base_t - t_pixel_size;
				//top right
				// this.vertexPosition[20 * this.vidx + 8] = (s_step*dy) + s_step + base_s - s_pixel_size;
				// this.vertexPosition[20 * this.vidx + 9] = (t_step*dx) + 1 - base_t - t_pixel_size;

				// top right
				this.vertexPosition[20 * this.vidx + 10] = facesVec3Array[2].x;
				this.vertexPosition[20 * this.vidx + 11] = facesVec3Array[2].y;
				this.vertexPosition[20 * this.vidx + 12] = facesVec3Array[2].z;
				this.vertexPosition[20 * this.vidx + 13] = base_s;
				this.vertexPosition[20 * this.vidx + 14] = 1 - base_t -	 t_pixel_size;
				//top left
				// this.vertexPosition[20 * this.vidx + 13] = (s_step*dy) + base_s;
				// this.vertexPosition[20 * this.vidx + 14] = (t_step*dx) + 1 - base_t -	t_pixel_size;
				
				// bottom right
				this.vertexPosition[20 * this.vidx + 15] = facesVec3Array[3].x;
				this.vertexPosition[20 * this.vidx + 16] = facesVec3Array[3].y;
				this.vertexPosition[20 * this.vidx + 17] = facesVec3Array[3].z;
				this.vertexPosition[20 * this.vidx + 18] = base_s + s_pixel_size;
				this.vertexPosition[20 * this.vidx + 19] = 1 - (t_step + base_t);
				//bottom left
				// this.vertexPosition[20 * this.vidx + 18] = (s_step*dy) + base_s;
				// this.vertexPosition[20 * this.vidx + 19] = (t_step*dx) + 1 - t_step - base_t;
				
				
				this.vidx++;
			}
		}

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

		global.gl.activeTexture(global.gl.TEXTURE0 + this._hipsShaderIndex);
		global.gl.bindTexture(global.gl.TEXTURE_2D, this._texture);
		global.gl.uniform1f(hipsShaderProgram.locations.textureAlpha, this.opacity);


		global.gl.bindBuffer(global.gl.ARRAY_BUFFER, this.vertexPositionBuffer);
		global.gl.bindBuffer(global.gl.ELEMENT_ARRAY_BUFFER, this.vertexIndexBuffer);

		global.gl.vertexAttribPointer(hipsShaderProgram.locations.vertexPositionAttribute, 3, global.gl.FLOAT, false, 5 * 4, 0);
		global.gl.vertexAttribPointer(hipsShaderProgram.locations.textureCoordAttribute, 2, global.gl.FLOAT, false, 5 * 4, 3 * 4);

		for (let t = 0; t < this._maxTiles; t++) {
			if (!allSkyTiles2Skip.includes(t)) {
				// if (t == 0 || t == 1)
				global.gl.drawElements(global.gl.TRIANGLES, 6 * this._numFacesXTile, global.gl.UNSIGNED_SHORT, 12 * t * this._numFacesXTile);
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