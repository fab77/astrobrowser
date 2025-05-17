"use strict";
/**
 * @author Fabrizio Giordano (Fab77)
 * @param in_radius - number
 * @param in_gl - GL context
 * @param in_position - array of double e.g. [0.0, 0.0, -7]
 */

// import { Healpix, Pointing, Vec3 } from "healpixjs";

import AbstractSkyEntity from '../AbstractSkyEntity.js';
import global from '../../Global.js';
import { fovHelper } from './FoVHelper.js';
// import RayPickingUtils from '../../utils/RayPickingUtils.js';
import { newTileBuffer } from './TileBuffer.js';
import ColorMaps from '../../modules/dataexplorer/model/ColorMaps.js';
import { hipsShaderProgram } from '../../shaders/HiPSShaderProgram.js';
import AncestorTile from "./AncestorTile.js";
import { newVisibleTilesManager } from './VisibleTilesManager.js';
// import AllSky from './AllSky3.js';
// import AllSky from './AllSky3-pseudo.js';
// import AllSky from './AllSky4.js';
// import AllSky from './AllSky5.js';
// import AllSky from './AllSky6.js';
import AllSky from './AllSky7.js';

/**
 * HiPS always has pixels geometry in Norder3 ( => 768 tiles). 
 * Texture are always in Norder0 (12 in total). Texture generation is managed by Tile.js
 * Tile.js is in charge to merge all the images of displayed norder into a single Norder0 texture
 * The Norder0 texture will be split in 768 textures and assigned the the corrext pixel
 */
class HiPS extends AbstractSkyEntity {

	_ancestorTiles;

	constructor(radius, position, xrad, yrad, name, baseurl, format, opacity, isgalactic, descriptor) {

		super(radius, position, xrad, yrad, name, descriptor.isGalactic);
		// super(radius, position, xrad, yrad, name, false);

		newTileBuffer.addHiPS(this);
		console.log("HiPS frame " + descriptor._hipsFrame)
		console.log("HiPS minOrder " + descriptor.minOrder)
		this._allSky = (descriptor.minOrder >= 3) ? true : false;




		this.samplerIdx = 0;

		this._descriptor = descriptor;

		this._format = format;

		this._baseurl = descriptor.url;
		this._maxorder = descriptor.maxOrder;
		this._minorder = descriptor.minOrder;

		this._viewmatrix = undefined;

		this.colorMapIdx = 0;

		this.initShaders();

		let fov = 180; // <== TODO this must be a constructor parameter

		let order = fovHelper.getHiPSNorder(fov);
		// this._tileBuffer = new TilesBuffer(this._descriptor, this._format, this.shaderProgram, this.samplerIdx, order, this);
		this._visibleorder = order;


		if (order > this._maxorder) {
			order = this._maxorder
		}


		this.visiblePixelByOrder = {
			"pixels": [],
			"order": order
		}

		//  TODO just use one tiles array. It will containes only on tile when allsky
		this._ancestorTiles = [];
		this._allSkyTile = null;
		
		// TODO check if Allsky HiPS.
		this._allSky = true
		if (this._allSky) {
			this._allSkyTile = new AllSky(this)
		} else {
			for (let t = 0; t < 12; t++) {
				this._ancestorTiles.push(new AncestorTile(t, 0, this));
			}
		}

	}

	get maxOrder() {
		return this._maxorder;
	}

	get minOrder() {
		return this._minorder;
	}

	get baseURL() {
		return this._baseurl;
	}

	get format() {
		return this._format;
	}

	changeFormat(format) {
		this._format = format;
		this._tileBuffer.clearAll();
		this._tileBuffer._format = this._format;
		let pixelByOrder = newVisibleTilesManager.visibleTilesByOrder;
		this.updateTiles(pixelByOrder.pixels, pixelByOrder.order);
	}

	/**
	defined in the shader
	0 -> native
	1 -> planck
	2 -> cmb
	3 -> grayscale
	4 -> rainbow
	5 -> eosb
	6 -> cubehelix
	 * @param {ColorMaps} colorMap 
	 */
	changeColorMap(colorMap) {



		switch (colorMap.name) {
			case 'grayscale':
				// console.warn('Grayscale no t implemented yet');
				this.colorMapIdx = 1;
				hipsShaderProgram.setGrayscaleShader();
				break;
			case 'planck':
				this.colorMapIdx = 2;
				hipsShaderProgram.setColorMapShader(colorMap);
				break;
			case 'cmb':
				this.colorMapIdx = 3;
				hipsShaderProgram.setColorMapShader(colorMap);
				break;

			case 'rainbow':
				this.colorMapIdx = 4;
				hipsShaderProgram.setColorMapShader(colorMap);
				break;
			case 'eosb':
				this.colorMapIdx = 5;
				hipsShaderProgram.setColorMapShader(colorMap);
				break;
			case 'cubehelix':
				this.colorMapIdx = 6;
				hipsShaderProgram.setColorMapShader(colorMap);
				break;
			default:
				this.colorMapIdx = 0;
				hipsShaderProgram.setNativeShader();
		}
	}

	addHiPS() {

	}

	initShaders() {
		hipsShaderProgram.enableProgram();
		this.shaderProgram = hipsShaderProgram.shaderProgram;
	}




	updateTiles(caller) {
		caller.visiblePixelByOrder = newVisibleTilesManager.visibleTilesByOrder;
		const pixels = caller.visiblePixelByOrder.pixels;
		const order = caller.visiblePixelByOrder.order;
		caller._tileBuffer.updateTiles(pixels, order);

	}



	getCurrentHealpixOrder() {
		return this._visibleorder;
	}

	refresh() {

		this.refreshFoV(false);

		let fov = this.getMinFoV();
		this._visibleorder = fovHelper.getHiPSNorder(fov);
		if (this._visibleorder > this._maxorder) {
			this._visibleorder = this._maxorder
		}

	}

	/**
	 * 
	 * @param {*} pMatrix 
	 * @param {*} vMatrix 
	 * @param {boolean} cameraRotated 
	 */
	draw(pMatrix, vMatrix, cameraRotated) {
		this.refresh();

		if (this._allSky) {
			// TODO handle galactic
			if (this.isGalacticHips) {
				this._allSkyTile.draw(newVisibleTilesManager.galVisibleTilesByOrder.order, newVisibleTilesManager.galAncestorsMap, pMatrix, vMatrix, this.modelMatrix, this.colorMapIdx)
			} else {
				this._allSkyTile.draw(newVisibleTilesManager.visibleTilesByOrder.order, newVisibleTilesManager.ancestorsMap, pMatrix, vMatrix, this.modelMatrix, this.colorMapIdx)
			}
			
		} else {
			if (this.isGalacticHips) {
				this._ancestorTiles.forEach((ancestor) => {
					ancestor.draw(newVisibleTilesManager.galVisibleTilesByOrder.order, newVisibleTilesManager.galAncestorsMap, pMatrix, vMatrix, this.modelMatrix, this.colorMapIdx);
				})
			} else {
				this._ancestorTiles.forEach((ancestor) => {
					ancestor.draw(newVisibleTilesManager.visibleTilesByOrder.order, newVisibleTilesManager.ancestorsMap, pMatrix, vMatrix, this.modelMatrix, this.colorMapIdx);
				})
			}

		}




	}

}

export default HiPS;