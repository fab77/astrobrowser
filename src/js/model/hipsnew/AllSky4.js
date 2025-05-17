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
		this._hipsRefOrder = global.HIPS_REF_ORDER; // used for geometry and texture mapping
		this._hipsTextureOrder = 3; // AllSky is a map of order 3 tiles

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

	/**
	 * 
	 * |10|11|14|15|
	 * |8 |9 |12|13|
	 * |2 |3 |6 |7 |
	 * |0 |1 |4 |5 |
	 * 
	 */
	initModelBuffer() {
		const tgtOrder = 6
		const allskyOrder = 3
		const orderJump = tgtOrder - allskyOrder
		// const steps = 2 ** orderJump
		const allskyHpx = global.getHealpix(allskyOrder)
		const tgtHpx = global.getHealpix(tgtOrder)
		// const allskyMaxTiles = allskyHpx.getNPix()
		const tgtMaxTiles = tgtHpx.getNPix()

		const tgtTilesXBaseEdge = 2 ** orderJump

		const s_texture_step = parseFloat(1 / (27 * tgtTilesXBaseEdge) ) // increment on columns
		const t_texture_step = parseFloat(1 / (29 * tgtTilesXBaseEdge) ) // increment on rows
		
		



		// this._numFacesXTile = 4 ** orderJump // used in gl.draw
		// this._numFaces = this._numFacesXTile * tgtMaxTiles
		// this.vertexPosition = new Float32Array(20 * this._numFaces)
		this.vertexPosition = new Float32Array(20 * tgtMaxTiles)
		

		let it = 0
		let COLS = 1 
		let ROW = 0
		let tileEdgeSNo = 0
		let tileEdgeTNo = 0
		
		const base_s = 0
		const base_t = 1 - tgtTilesXBaseEdge * t_texture_step
		let s = base_s
		let t = base_t
		let vidx = 0

		console.log("%s , %s", s, t)
		for (let tileno = 0; tileno < tgtMaxTiles; tileno++) {
			// if (ROWS == 30) break

			const tgtXyf = tgtHpx.nest2xyf(tileno);
			const facesVec3Array = tgtHpx.getPointsForXyfNoStep(tgtXyf.ix, tgtXyf.iy, tgtXyf.face);

			if ( it == 0) {
				tileEdgeSNo++
				// vertex here
				this.setupBuffer(facesVec3Array, s, t, s_texture_step, t_texture_step, vidx)
				vidx++
				
			} else if (it == 1) {
				tileEdgeSNo++
				s = base_s + s_texture_step
				// vertex here
				this.setupBuffer(facesVec3Array, s, t, s_texture_step, t_texture_step, vidx)
				vidx++

			} else if (it == 2) {
				tileEdgeTNo++
				s -= s_texture_step
				t += t_texture_step
				// vertex here
				this.setupBuffer(facesVec3Array, s, t, s_texture_step, t_texture_step, vidx)
				vidx++

			} else if (it == 3) {
				tileEdgeTNo++
				s += s_texture_step
				// vertex here
				this.setupBuffer(facesVec3Array, s, t, s_texture_step, t_texture_step, vidx)
				vidx++

			}
			
			it++

			if (it == 4) {
				it = 0
				
				if (tileEdgeTNo == 2 * tgtTilesXBaseEdge) {
					tileEdgeTNo = 0
					s += s_texture_step
					t -= t_texture_step * (tgtTilesXBaseEdge - 1)
					COLS++
			 	} else if (tileEdgeSNo == tgtTilesXBaseEdge) { // reached s boundary of order 3 tile
					tileEdgeSNo = 0
					t += t_texture_step
					s -= s_texture_step * (tgtTilesXBaseEdge - 1)
				} else if (tileEdgeSNo < tgtTilesXBaseEdge){
					s += s_texture_step
					t -= t_texture_step
				}
			}

			if (COLS == 27) {
				ROW++
				s = base_s
				t -= tgtTilesXBaseEdge * t_texture_step
				console.log("ROW: %s: %s, %s", ROW, s, t)
				if (t < 0) break
				
			}

		}
		// console.log(this.vertexPosition)

		// let vertexIndices = new Uint16Array(6 * this._numFaces);
		let vertexIndices = new Uint16Array(6 * tgtMaxTiles);
		let baseFaceIndex = 0;
		// for (let i = 0; i < this._numFaces; i++) {
		for (let i = 0; i < tgtMaxTiles; i++) {
			vertexIndices[6 * i] = baseFaceIndex;
			vertexIndices[6 * i + 1] = baseFaceIndex + 1;
			vertexIndices[6 * i + 2] = baseFaceIndex + 3;

			vertexIndices[6 * i + 3] = baseFaceIndex + 1;
			vertexIndices[6 * i + 4] = baseFaceIndex + 2;
			vertexIndices[6 * i + 5] = baseFaceIndex + 3;

			baseFaceIndex = baseFaceIndex + 4;
		}

		// console.log(vertexIndices)

		this.vertexPositionBuffer = global.gl.createBuffer();
		global.gl.bindBuffer(global.gl.ARRAY_BUFFER, this.vertexPositionBuffer);
		global.gl.bufferData(global.gl.ARRAY_BUFFER, this.vertexPosition, global.gl.STATIC_DRAW);

		this.vertexIndexBuffer = global.gl.createBuffer();
		global.gl.bindBuffer(global.gl.ELEMENT_ARRAY_BUFFER, this.vertexIndexBuffer);
		global.gl.bufferData(global.gl.ELEMENT_ARRAY_BUFFER, vertexIndices, global.gl.STATIC_DRAW);
		
	}

	setupBuffer(facesVec3Array, s, t, s_step, t_step, vidx) {

		this.vertexPosition[20 * vidx] = facesVec3Array[0].x;
		this.vertexPosition[20 * vidx + 1] = facesVec3Array[0].y;
		this.vertexPosition[20 * vidx + 2] = facesVec3Array[0].z;
		//bottom right
		this.vertexPosition[20 * vidx + 3] = s + s_step;
		this.vertexPosition[20 * vidx + 4] = t;

		this.vertexPosition[20 * vidx + 5] = facesVec3Array[1].x;
		this.vertexPosition[20 * vidx + 6] = facesVec3Array[1].y;
		this.vertexPosition[20 * vidx + 7] = facesVec3Array[1].z;
		//top right
		this.vertexPosition[20 * vidx + 8] = s + s_step;
		this.vertexPosition[20 * vidx + 9] = t + t_step;

		this.vertexPosition[20 * vidx + 10] = facesVec3Array[2].x;
		this.vertexPosition[20 * vidx + 11] = facesVec3Array[2].y;
		this.vertexPosition[20 * vidx + 12] = facesVec3Array[2].z;
		//top left
		this.vertexPosition[20 * vidx + 13] = s ;
		this.vertexPosition[20 * vidx + 14] = t + t_step;
		
		this.vertexPosition[20 * vidx + 15] = facesVec3Array[3].x;
		this.vertexPosition[20 * vidx + 16] = facesVec3Array[3].y;
		this.vertexPosition[20 * vidx + 17] = facesVec3Array[3].z;
		//bottom left
		this.vertexPosition[20 * vidx + 18] = s;
		this.vertexPosition[20 * vidx + 19] = t;

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