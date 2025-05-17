"use strict";

import { hipsShaderProgram } from '../../shaders/HiPSShaderProgram.js';
import global from '../../Global.js';
import { newTileBuffer } from './TileBuffer.js';

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
		global.gl.activeTexture(global.gl.TEXTURE0 + this._hipsShaderIndex);
		global.gl.bindTexture(global.gl.TEXTURE_2D, this._texture);
		global.gl.texImage2D(global.gl.TEXTURE_2D, 0, global.gl.RGBA, global.gl.RGBA, global.gl.UNSIGNED_BYTE, this._image);

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
		global.gl.texParameteri(global.gl.TEXTURE_2D, global.gl.TEXTURE_WRAP_S, global.gl.CLAMP_TO_EDGE);
		global.gl.texParameteri(global.gl.TEXTURE_2D, global.gl.TEXTURE_WRAP_T, global.gl.CLAMP_TO_EDGE);

		global.gl.texParameteri(global.gl.TEXTURE_2D, global.gl.TEXTURE_MIN_FILTER, global.gl.LINEAR);
		global.gl.texParameteri(global.gl.TEXTURE_2D, global.gl.TEXTURE_MAG_FILTER, global.gl.LINEAR);

		global.gl.uniform1i(hipsShaderProgram.shaderProgram.samplerUniform, this._hipsShaderIndex);

		if (!global.gl.isTexture(this._texture)) {
			console.log("error in texture");
		}

	}


	initModelBuffer() {

		let factor = 2 ** (this._order - 3)
		let hpx = global.getHealpix(this._order);
		this._maxTiles = hpx.getNPix();
		// this._maxTiles = 54;
		//0.037037037
		let s_step = 1 / (27 * factor);
		//0.034482759
		let t_step = 1 / (29 * factor);

		let facesVec3Array = [];
		let vertexPosition = new Float32Array(20 * this._maxTiles);
		let sindex = 0;
		let tindex = 0;

		for (let t = 0; t < this._maxTiles; t++) {
			facesVec3Array = hpx.getBoundaries(t);

			// hpx.getPointsForXyfNoStep( ,t)

			vertexPosition[20 * t] = facesVec3Array[0].x;
			vertexPosition[20 * t + 1] = facesVec3Array[0].y;
			vertexPosition[20 * t + 2] = facesVec3Array[0].z;
			vertexPosition[20 * t + 3] = (s_step + (s_step * sindex));
			vertexPosition[20 * t + 4] = (1 - (t_step + t_step * tindex));

			vertexPosition[20 * t + 5] = facesVec3Array[1].x;
			vertexPosition[20 * t + 6] = facesVec3Array[1].y;
			vertexPosition[20 * t + 7] = facesVec3Array[1].z;
			vertexPosition[20 * t + 8] = (s_step + (s_step * sindex));
			vertexPosition[20 * t + 9] = (1 - (t_step * tindex));

			vertexPosition[20 * t + 10] = facesVec3Array[2].x;
			vertexPosition[20 * t + 11] = facesVec3Array[2].y;
			vertexPosition[20 * t + 12] = facesVec3Array[2].z;
			vertexPosition[20 * t + 13] = (s_step * sindex);
			vertexPosition[20 * t + 14] = (1 - (t_step * tindex));

			vertexPosition[20 * t + 15] = facesVec3Array[3].x;
			vertexPosition[20 * t + 16] = facesVec3Array[3].y;
			vertexPosition[20 * t + 17] = facesVec3Array[3].z;
			vertexPosition[20 * t + 18] = (s_step * sindex);
			vertexPosition[20 * t + 19] = (1 - (t_step + t_step * tindex));

			sindex++;
			if (sindex == (27 * factor)) {
				tindex++;
				sindex = 0;
			}
		}

		let vertexIndices = new Uint16Array(6 * this._maxTiles);
		let baseFaceIndex = 0;
		for (let i = 0; i < this._maxTiles; i++) {
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
		global.gl.bufferData(global.gl.ARRAY_BUFFER, vertexPosition, global.gl.STATIC_DRAW);

		this.vertexIndexBuffer = global.gl.createBuffer();
		global.gl.bindBuffer(global.gl.ELEMENT_ARRAY_BUFFER, this.vertexIndexBuffer);
		global.gl.bufferData(global.gl.ELEMENT_ARRAY_BUFFER, vertexIndices, global.gl.STATIC_DRAW);
	};




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
			if (!allSkyTiles2Skip.includes(t))
				global.gl.drawElements(global.gl.TRIANGLES, 6, global.gl.UNSIGNED_SHORT, 12 * t);
		}

		global.gl.disableVertexAttribArray(hipsShaderProgram.locations.vertexPositionAttribute);
		global.gl.disableVertexAttribArray(hipsShaderProgram.locations.textureCoordAttribute);
	}


	drawChildren(visibleOrder, visibleTilesMap, pMatrix, vMatrix, mMatrix, colorMapIdx) {

		// let childrenOrder = this._order + 1;
		let childrenOrder = this._order;
		if (!visibleTilesMap.has(childrenOrder)) {
			return;
		}
		// for (let c = 0; c < 4; c++) {
		// 	let childTileNo = (this._tileno << 2) + c;
		// 	if (visibleTilesMap.get(childrenOrder).includes(childTileNo)) {
		// 		let childTile = newTileBuffer.getTile(childTileNo, childrenOrder, this._hips);
		// 		childTile.draw(visibleOrder, visibleTilesMap, pMatrix, vMatrix, mMatrix, colorMapIdx);
		// 		if (childTile._ready) {
		// 			// quadrantsToDraw.delete(childTile._tileno - (this._tileno << 2));
		// 		}

		// 	}
		// }

		let visibleTiles = visibleTilesMap.get(childrenOrder);
		let allSkyTiles2Skip = []
		for (let t = 0; t < visibleTiles.length; t++) {
			let childTile = undefined
			if (this._isGalacticHips){
				childTile = newTileBuffer.getGalTile(visibleTiles[t], childrenOrder, this._hips);
			}else{
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