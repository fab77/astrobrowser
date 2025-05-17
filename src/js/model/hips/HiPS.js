// "use strict";
// /**
//  * @author Fabrizio Giordano (Fab77)
//  * @param in_radius - number
//  * @param in_gl - GL context
//  * @param in_position - array of double e.g. [0.0, 0.0, -7]
//  */

// import { Healpix, Pointing, Vec3 } from "healpixjs";

// import AbstractSkyEntity from '../AbstractSkyEntity.js';
// import global from '../../Global.js';
// import { fovHelper } from './FoVHelper.js';
// import RayPickingUtils from '../../utils/RayPickingUtils.js';
// import TilesBuffer3 from './TileBuffer3.js';
// import ColorMaps from '../../modules/dataexplorer/model/ColorMaps.js';
// import { hipsShaderProgram } from '../../shaders/HiPSShaderProgram.js';
// import { visibleTilesManager } from '../grids/VisibleTilesManager.js';
// /**
//  * HiPS always has pixels geometry in Norder3 ( => 768 tiles). 
//  * Texture are always in Norder0 (12 in total). Texture generation is managed by Tile.js
//  * Tile.js is in charge to merge all the images of displayed norder into a single Norder0 texture
//  * The Norder0 texture will be split in 768 textures and assigned the the corrext pixel
//  */
// class HiPS extends AbstractSkyEntity {

// 	constructor(radius, position, xrad, yrad, name, baseurl, format, opacity, isgalactic, descriptor) {

// 		super(radius, position, xrad, yrad, name, isgalactic);

// 		this.samplerIdx = 0;

// 		this._descriptor = descriptor;

// 		this._format = format;
// 		this._maxorder = descriptor.maxOrder;
// 		this._viewmatrix = undefined;

// 		this.colorMapIdx = 0;

// 		this.initShaders();

// 		let fov = 180; // <== TODO this must be a constructor parameter

// 		let order = fovHelper.getHiPSNorder(fov);
// 		this._tileBuffer = new TilesBuffer3(this._descriptor, this._format, this.shaderProgram, this.samplerIdx, order, this);
// 		this._visibleorder = order;
// 		this._oldorder = order;

// 		if (order > this._maxorder) {
// 			order = this._maxorder
// 		}


// 		this.visiblePixelByOrder = {
// 			"pixels": [],
// 			"order": order
// 		}
// 		// this.computeVisiblePixels(order);

// 		this.updateTiles(this);

// 		setInterval(this.updateTiles, 1000, this);

// 	}

// 	get maxOrder() {
// 		return this._maxorder;
// 	}

// 	changeFormat(format) {
// 		this._format = format;
// 		this._tileBuffer.clearAll();
// 		this._tileBuffer._format = this._format;
// 		// let pixelByOrder = this.computeVisiblePixels(this._visibleorder);
// 		let pixelByOrder = visibleTilesManager.visibleTilesByOrder;
// 		this.updateTiles(pixelByOrder.pixels, pixelByOrder.order);
// 	}

// 	/**
// 	defined in the shader
// 	0 -> native
// 	1 -> planck
// 	2 -> cmb
// 	3 -> grayscale
// 	4 -> rainbow
// 	5 -> eosb
// 	6 -> cubehelix
// 	 * @param {ColorMaps} colorMap 
// 	 */
// 	changeColorMap(colorMap) {



// 		switch (colorMap.name) {
// 			case 'grayscale':
// 				// console.warn('Grayscale no t implemented yet');
// 				this.colorMapIdx = 1;
// 				hipsShaderProgram.setGrayscaleShader();
// 				break;
// 			case 'planck':
// 				this.colorMapIdx = 2;
// 				hipsShaderProgram.setColorMapShader(colorMap);
// 				break;
// 			case 'cmb':
// 				this.colorMapIdx = 3;
// 				hipsShaderProgram.setColorMapShader(colorMap);
// 				break;

// 			case 'rainbow':
// 				this.colorMapIdx = 4;
// 				hipsShaderProgram.setColorMapShader(colorMap);
// 				break;
// 			case 'eosb':
// 				this.colorMapIdx = 5;
// 				hipsShaderProgram.setColorMapShader(colorMap);
// 				break;
// 			case 'cubehelix':
// 				this.colorMapIdx = 6;
// 				hipsShaderProgram.setColorMapShader(colorMap);
// 				break;
// 			default:
// 				this.colorMapIdx = 0;
// 				hipsShaderProgram.setNativeShader();
// 		}
// 	}

// 	addHiPS() {

// 	}

// 	initShaders() {
// 		hipsShaderProgram.enableProgram();
// 		this.shaderProgram = hipsShaderProgram.shaderProgram;
// 	}




// 	updateTiles(caller) {
// 		caller.visiblePixelByOrder = visibleTilesManager.visibleTilesByOrder;
// 		const pixels = caller.visiblePixelByOrder.pixels;
// 		const order = caller.visiblePixelByOrder.order;
// 		caller._tileBuffer.updateTiles(pixels, order);
		
// 	}



// 	getCurrentHealpixOrder() {
// 		return this._visibleorder;
// 	}

// 	refresh(cameraRotated) {



// 		this.refreshFoV(false);

// 		let fov = this.getMinFoV();
// 		this._visibleorder = fovHelper.getHiPSNorder(fov);
// 		if (this._visibleorder > this._maxorder) {
// 			this._visibleorder = this._maxorder
// 		}
// 		if (this._oldorder != this._visibleorder || cameraRotated) {

// 			this._oldorder = this._visibleorder;
// 			// this.visiblePixelByOrder = this.computeVisiblePixels(this._visibleorder, fov);
// 			// this.updateTiles(visiblePixelByOrder.pixels, visiblePixelByOrder.order);

// 		}

// 	}

// 	/**
// 	 * 
// 	 * @param {*} pMatrix 
// 	 * @param {*} vMatrix 
// 	 * @param {boolean} cameraRotated 
// 	 */
// 	draw(pMatrix, vMatrix, cameraRotated) {
// 		this.refresh(cameraRotated);

// 		this.opacity = 1.00 * 100.0 / 100.0;

// 		// global.gl.disable(global.gl.DEPTH_TEST);
// 		let tiles = this._tileBuffer.getTiles();

// 		hipsShaderProgram.enableShaders(pMatrix, vMatrix, this.modelMatrix, this.colorMapIdx);


// 		for (let [tileidx, tile] of tiles) {

// 			if (tile !== undefined && tile.isLoaded == true) {
// 				tile.draw();
// 			}

// 		}

// 	}

// }

// export default HiPS;