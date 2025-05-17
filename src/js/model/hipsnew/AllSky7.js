"use strict";

import { hipsShaderProgram } from '../../shaders/HiPSShaderProgram.js';
import global from '../../Global.js';
import { newTileBuffer } from './TileBuffer.js';
// import { Xyf } from 'healpixjs';
import pkg from 'canvas';
const { createCanvas } = pkg;
import AllSkyTile from './AllSkyTile.js';

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
		// this._hipsRefOrder = global.HIPS_REF_ORDER; // used for geometry and texture mapping
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

		this.texturesArray = this.splitImage()
		
		this.allSkyTiles = new Array(768)

		for (let p=0; p<768; p++){
			let tile = new AllSkyTile(p, 3, this._hips, this.texturesArray[p])
			this.allSkyTiles[p] = tile
			
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
				
				// const imgData = ctx.getImageData(col * 64 , row * 64, 64, 64).data
				// textures.push(new ImageData(imgData, 64, 64))
				const imgData = ctx.getImageData(col * tilePxSize , row * tilePxSize, tilePxSize, tilePxSize).data
				textures.push(new ImageData(imgData, tilePxSize, tilePxSize))
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

	



	draw(visibleOrder, visibleTilesMap, pMatrix, vMatrix, mMatrix, colorMapIdx) {
		if (!this._ready) {
			return false;
		}
		let allSkyTiles2Skip = []
		if (visibleOrder >= this._hipsTextureOrder) {
			allSkyTiles2Skip = this.drawChildren(visibleOrder, visibleTilesMap, pMatrix, vMatrix, mMatrix, colorMapIdx)
		} 
		// else {
			hipsShaderProgram.enableShaders(pMatrix, vMatrix, mMatrix, colorMapIdx);
			// TODO check if the enable below can be moved into hipsShaderProgram.enableShaders
			global.gl.enableVertexAttribArray(hipsShaderProgram.locations.vertexPositionAttribute);
			global.gl.enableVertexAttribArray(hipsShaderProgram.locations.textureCoordAttribute);
			for (let t = 0; t < 768; t++) {
				if (!allSkyTiles2Skip.includes(t)) {
					this.allSkyTiles[t].draw(visibleOrder, visibleTilesMap, pMatrix, vMatrix, mMatrix, colorMapIdx)
				}
					
			}
			global.gl.disableVertexAttribArray(hipsShaderProgram.locations.vertexPositionAttribute);
        	global.gl.disableVertexAttribArray(hipsShaderProgram.locations.textureCoordAttribute);
		// }

		
	}


	drawChildren(visibleOrder, visibleTilesMap, pMatrix, vMatrix, mMatrix, colorMapIdx) {

		let childrenOrder = this._hipsTextureOrder;
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