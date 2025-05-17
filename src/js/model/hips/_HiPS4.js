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
// // import FoVUtils from '../../utils/FoVUtils.js';
// import RayPickingUtils from '../../utils/RayPickingUtils.js';
// // import TilesBuffer2 from './TileBuffer2.js';
// import TilesBuffer3 from './TileBuffer3.js';
// import Tile from './Tile.js';
// import ColorMaps from '../../modules/dataexplorer/model/ColorMaps.js';
// import ShaderManager from '../../shaders/ShaderManager.js';
// import {colorMap} from "./ColorMap.js";
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

// 		this.gl_uniforms = {
// 			"sampler": "uSampler" + this.samplerIdx,
// 			"factor": "uFactor" + this.samplerIdx,
// 			"m_perspective": "uPMatrix",
// 			"m_model": "uMMatrix",
// 			"m_view": "uVMatrix",
// 			"colormapIdx": "cmapIdx",
// 			"colormap_red": "r",
// 			"colormap_green": "g",
// 			"colormap_blue": "b"
// 		}

// 		this.colorMapValues = {
// 			"r": [],
// 			"g": [],
// 			"b": []
// 		}

// 		this.gl_attributes = {
// 			"vertex_pos": "aVertexPosition",
// 			"text_coords": "aTextureCoord"
// 		}
		
// 		this.uboVariableInfo = {};
// 		// this._allsky = (descriptor.minOrder >= 3);
// 		// let samplerIdx = glSamplerManager.assocSampler(this);

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
// 		this.computeVisiblePixels(order);
		
// 		this.updateTiles(this);

// 		setInterval(this.updateTiles, 3000, this);

// 	}

// 	get maxOrder() {
// 		return this._maxorder;
// 	}

// 	changeFormat(format) {
// 		this._format = format;
// 		this._tileBuffer.clearAll();
// 		this._tileBuffer._format = this._format;
// 		let pixelByOrder = this.computeVisiblePixels(this._visibleorder);
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

// 		let fragmentShaderStr;
// 		if (['planck', 'cmb', 'rainbow', 'eosb', 'cubehelix'].includes(colorMap.name)){
// 			global.gl.detachShader(this.shaderProgram, this.fragmentShader);
// 			fragmentShaderStr = ShaderManager.hipsColorMapFS();
// 			this.changeFSShader(fragmentShaderStr);

// 			// Get the index of the Uniform Block from any program
// 			const blockIndex = global.gl.getUniformBlockIndex(this.shaderProgram, "colormap");
// 			// Get the size of the Uniform Block in bytes
// 			const blockSize = global.gl.getActiveUniformBlockParameter(
// 				this.shaderProgram,
// 				blockIndex,
// 				global.gl.UNIFORM_BLOCK_DATA_SIZE
// 			);
// 			const uboVariableNames = ["r_palette", "g_palette", "b_palette"];
// 			// Get the respective index of the member variables inside our Uniform Block
// 			const uboVariableIndices = global.gl.getUniformIndices(
// 				this.shaderProgram,
// 				uboVariableNames
// 			);
// 			// Get the offset of the member variables inside our Uniform Block in bytes
// 			const uboVariableOffsets = global.gl.getActiveUniforms(
// 				this.shaderProgram,
// 				uboVariableIndices,
// 				global.gl.UNIFORM_OFFSET
// 			);
// 			// const uboVariableOffsets = [0, 1024, 2048]

// 			this.uboBuffer = global.gl.createBuffer();
// 			// Create Uniform Buffer to store our data
// 			// this.uboBuffer = global.gl.createBuffer(); // moved into the constructor
// 			// Bind it to tell WebGL we are working on this buffer
// 			global.gl.bindBuffer(global.gl.UNIFORM_BUFFER, this.uboBuffer);
// 			// Allocate memory for our buffer equal to the size of our Uniform Block
// 			// We use dynamic draw because we expect to respecify the contents of the buffer frequently
			
// 			// global.gl.bufferData(global.gl.UNIFORM_BUFFER, blockSize, global.gl.DYNAMIC_DRAW);
// 			global.gl.bufferData(global.gl.UNIFORM_BUFFER, 12288, global.gl.STATIC_DRAW);
			
// 			// Unbind buffer when we're done using it for now
// 			// Good practice to avoid unintentionally working on it
// 			global.gl.bindBuffer(global.gl.UNIFORM_BUFFER, null);
// 			// Bind the buffer to a binding point
// 			// Think of it as storing the buffer into a special UBO ArrayList
// 			// The second argument is the index you want to store your Uniform Buffer in
// 			// Let's say you have 2 unique UBO, you'll store the first one in index 0 and the second one in index 1
// 			global.gl.bindBufferBase(global.gl.UNIFORM_BUFFER, 0, this.uboBuffer);
// 			// Name of the member variables inside of our Uniform Block

// 			// Create an object to map each variable name to its respective index and offset
// 			// const uboVariableInfo = {}; // moved into the constructor

// 			let self = this;
// 			uboVariableNames.forEach((name, index) => {
// 				self.uboVariableInfo[name] = {
// 					index: uboVariableIndices[index],
// 					offset: uboVariableOffsets[index],
// 				};
// 			});
// 		}
// 		switch (colorMap.name) {
// 			case 'grayscale':
// 				// console.warn('Grayscale no t implemented yet');
// 				this.colorMapIdx = 1;
// 				global.gl.detachShader(this.shaderProgram, this.fragmentShader);
// 				fragmentShaderStr = ShaderManager.hipsGrayscaleFS();
// 				this.changeFSShader(fragmentShaderStr);
// 				break;
// 			case 'planck':
// 				this.colorMapIdx = 2;
// 				break;
// 			case 'cmb':
// 				this.colorMapIdx = 3;
// 				break;
			
// 			case 'rainbow':
// 				this.colorMapIdx = 4;
// 				break;
// 			case 'eosb':
// 				this.colorMapIdx = 5;
// 				break;
// 			case 'cubehelix':
// 				this.colorMapIdx = 6;
// 				break;
// 			default:
// 				this.colorMapIdx = 0;
// 				global.gl.detachShader(this.shaderProgram, this.fragmentShader);
// 				fragmentShaderStr = ShaderManager.hipsNativeFS();
// 				this.changeFSShader(fragmentShaderStr);
// 		}
// 	}

// 	addHiPS() {

// 	}

// 	initShaders() {

// 		let fragmentShaderStr = ShaderManager.hipsNativeFS();
// 		this.fragmentShader = global.gl.createShader(global.gl.FRAGMENT_SHADER);
// 		global.gl.shaderSource(this.fragmentShader, fragmentShaderStr);
// 		global.gl.compileShader(this.fragmentShader);
// 		if (!global.gl.getShaderParameter(this.fragmentShader, global.gl.COMPILE_STATUS)) {
// 			alert(global.gl.getShaderInfoLog(this.fragmentShader));
// 			return null;
// 		}

// 		let vertexShaderStr = ShaderManager.hipsVS();
// 		this.vertexShader = global.gl.createShader(global.gl.VERTEX_SHADER);
// 		global.gl.shaderSource(this.vertexShader, vertexShaderStr);
// 		global.gl.compileShader(this.vertexShader);
// 		if (!global.gl.getShaderParameter(this.vertexShader, global.gl.COMPILE_STATUS)) {
// 			alert(global.gl.getShaderInfoLog(this.vertexShader));
// 			return null;
// 		}

// 		// this.fragmentShader = getShader("hips-shader-fs");
// 		// this.vertexShader = getShader("hips-shader-vs");

// 		global.gl.attachShader(this.shaderProgram, this.vertexShader);
// 		global.gl.attachShader(this.shaderProgram, this.fragmentShader);
// 		global.gl.linkProgram(this.shaderProgram);

// 		if (!global.gl.getProgramParameter(this.shaderProgram, global.gl.LINK_STATUS)) {
// 			alert("Could not initialise shaders");
// 		}
// 		global.gl.useProgram(this.shaderProgram);


// 	}
// 	/**
// 	 * 
// 	 * @param {String} fragmentShaderStr 
// 	 */
// 	changeFSShader(fragmentShaderStr) {
// 		this.fragmentShader = global.gl.createShader(global.gl.FRAGMENT_SHADER);
// 		global.gl.shaderSource(this.fragmentShader, fragmentShaderStr);
// 		global.gl.compileShader(this.fragmentShader);
// 		if (!global.gl.getShaderParameter(this.fragmentShader, global.gl.COMPILE_STATUS)) {
// 			alert(global.gl.getShaderInfoLog(this.fragmentShader));
// 			return null;
// 		}
// 		global.gl.attachShader(this.shaderProgram, this.fragmentShader);
// 		global.gl.linkProgram(this.shaderProgram);
// 		if (!global.gl.getProgramParameter(this.shaderProgram, global.gl.LINK_STATUS)) {
// 			alert("Could not initialise shaders");
// 		}
// 		global.gl.useProgram(this.shaderProgram);
// 	}



// 	computeVisiblePixels(order, fov) {


// 		// let geomhealpix = new Healpix(Math.pow(2, order));

// 		let testing = false;
// 		// let testPixno = 0;

// 		let pixels = [];



// 		if (order == 0) {
// 			let geomhealpix = new Healpix(Math.pow(2, 0));
// 			let npix = geomhealpix.getNPix();
// 			pixels = [npix];
// 			pixels.splice(0, npix);
// 			for (let i = 0; i < npix; i++) {
// 				pixels.push(i);
// 			}
// 			if (testing) {
// 				pixels = [testPixno];
// 			}

// 		} else {

// 			let geomhealpix = new Healpix(Math.pow(2, order - 1));


// 			// TESTTING queryDiscInclusive (buggy)
// 			// let center = FoVUtils.getCenterJ2000(global.gl.canvas);
// 			// let ptg = new Pointing(center);
// 			// let minFov = (this.getMinFoV() * Math.PI/180.0);
// 			// let geomhealpix2 = new Healpix(Math.pow(2, order));
// 			// let testpix = geomhealpix2.queryDiscInclusive(ptg, minFov/2.0 , 0);
// 			// console.log (testpix.r);


// 			let maxX = global.gl.canvas.width;
// 			let maxY = global.gl.canvas.height;

// 			let xy = [];
// 			let neighbours = [];
// 			let intersectionWithModel;
// 			let intersectionPoint = null;
// 			let currP, currPixNo;

// 			// TODO probably it would be better to use query_disc_inclusive from HEALPix 
// 			// against a polygon. Check my FHIPSWebGL2 project (BufferManager.js -> updateVisiblePixels)
// 			// intersectionWithModel = RayPickingUtils.getIntersectionPointWithSingleModel(maxX/2, maxY/2, this);
// 			// let vec3 = new Vec3(intersectionWithModel.intersectionPoint[0], intersectionWithModel.intersectionPoint[1], intersectionWithModel.intersectionPoint[2]);
// 			// let ptg = new Pointing(vec3);
// 			// let pxs = geomhealpix.queryDiscInclusive(ptg, fov * Math.PI/180, 4);
// 			// for (let p =0; p < pxs.r.length; p++) {
// 			//     if (pixels.indexOf(pxs.r[p]) == -1){
// 			//         if(pxs.r[p] >= 0){
// 			//             pixels.push(pxs.r[p]);	
// 			//         }
// 			//     }
// 			// }

// 			var i = 0;
// 			for (i = 0; i <= maxX; i += maxX / 10) {
// 				var j = 0;
// 				for (j = 0; j <= maxY; j += maxY / 10) {

// 					intersectionWithModel = {
// 						"intersectionPoint": null,
// 						"pickedObject": null
// 					};

// 					xy = [i, j];


// 					intersectionWithModel = RayPickingUtils.getIntersectionPointWithSingleModel(xy[0], xy[1], this);
// 					intersectionPoint = intersectionWithModel.intersectionPoint;

// 					if (intersectionPoint.length > 0) {
// 						currP = new Pointing(new Vec3(intersectionPoint[0], intersectionPoint[1], intersectionPoint[2]));

// 						currPixNo = geomhealpix.ang2pix(currP);




// 						if (currPixNo >= 0) {

// 							if (pixels.indexOf(currPixNo << 2) == -1) {
// 								// if (pixels.indexOf(currPixNo) == -1) {

// 								if (testing) {
// 									if ((currPixNo >> (2 ** (order - 1))) == testPixno) {
// 										let pixchild = currPixNo << 2;
// 										pixels.push(pixchild);
// 										pixels.push(pixchild + 1);
// 										pixels.push(pixchild + 2);
// 										pixels.push(pixchild + 3);
// 									}
// 								} else {
// 									let pixchild = currPixNo << 2;
// 									pixels.push(pixchild);
// 									pixels.push(pixchild + 1);
// 									pixels.push(pixchild + 2);
// 									pixels.push(pixchild + 3);
// 								}



// 								// pixels.push(currPixNo);
// 							}
// 							var k = 0;
// 							// neighbours = geomhealpix.neighbours(currPixNo);
// 							// for (k = 0; k < neighbours.length; k++) {
// 							// 	if (pixels.indexOf(neighbours[k]<<2) == -1) {
// 							// 	// if (pixels.indexOf(neighbours[k]) == -1) {
// 							// 		if (neighbours[k] >= 0) {
// 							// 			// pixels.push(neighbours[k]);
// 							// 			let pixchild = neighbours[k] << 2;
// 							// 			pixels.push(pixchild);
// 							// 			pixels.push(pixchild+1);
// 							// 			pixels.push(pixchild+2);
// 							// 			pixels.push(pixchild+3);
// 							// 		}
// 							// 	}
// 							// }
// 						}
// 					}
// 				}
// 			}
// 		}

// 		this.visiblePixelByOrder = {
// 			"pixels": pixels,
// 			"order": order
// 		};
// 		return this.visiblePixelByOrder;

// 	}

// 	updateTiles(caller) {

// 		const pixels = caller.visiblePixelByOrder.pixels; 
// 		const order = caller.visiblePixelByOrder.order; 
// 		let tiles = caller._tileBuffer.updateTiles(pixels, order);
// 		// return tiles;
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
// 			this.visiblePixelByOrder = this.computeVisiblePixels(this._visibleorder, fov);
// 			// this.updateTiles(visiblePixelByOrder.pixels, visiblePixelByOrder.order);

// 		}

// 	}

// 	// getTiles() {
// 	// 	let tiles = this._tileBuffer.getTiles();
// 	// 	return tiles;
// 	// }

// 	enableShader(pMatrix, vMatrix, mMatrix) {

// 		global.gl.useProgram(this.shaderProgram);


// 		this.shaderProgram.pMatrixUniform = global.gl.getUniformLocation(this.shaderProgram, this.gl_uniforms.m_perspective);
// 		this.shaderProgram.mMatrixUniform = global.gl.getUniformLocation(this.shaderProgram, this.gl_uniforms.m_model);
// 		this.shaderProgram.vMatrixUniform = global.gl.getUniformLocation(this.shaderProgram, this.gl_uniforms.m_view);
// 		this.shaderProgram.samplerUniform = global.gl.getUniformLocation(this.shaderProgram, this.gl_uniforms.sampler);
// 		this.uniformVertexTextureFactorLoc = global.gl.getUniformLocation(this.shaderProgram, this.gl_uniforms.factor);
// 		this.uniformColorMapIdx = global.gl.getUniformLocation(this.shaderProgram, this.gl_uniforms.colormapIdx);

// 		if (this.colorMapIdx >= 2) {
			
// 			const index = global.gl.getUniformBlockIndex(this.shaderProgram, "colormap");
// 			global.gl.uniformBlockBinding(this.shaderProgram, index, 0);
// 			global.gl.bindBuffer(global.gl.UNIFORM_BUFFER, this.uboBuffer);

// 			let curentColorMap;
// 			if (this.colorMapIdx == 2) {
// 				curentColorMap = colorMap.PLANCK;
// 			} else if (this.colorMapIdx == 3) {
// 				curentColorMap = colorMap.CMB;
// 			} else if (this.colorMapIdx == 4) {
// 				curentColorMap = colorMap.RAINBOW;
// 			} else if (this.colorMapIdx == 5) {
// 				curentColorMap = colorMap.EOSB;
// 			} else if (this.colorMapIdx == 6) {
// 				curentColorMap = colorMap.CUBEHELIX;
// 			}

// 			global.gl.bufferSubData(
// 				global.gl.UNIFORM_BUFFER,
// 				0,
// 				curentColorMap.r,
// 				0
// 			);
// 			global.gl.bufferSubData(
// 				global.gl.UNIFORM_BUFFER,
// 				4096,
// 				curentColorMap.g,
// 				0
// 			);
// 			global.gl.bufferSubData(
// 				global.gl.UNIFORM_BUFFER,
// 				8192,
// 				curentColorMap.b,
// 				0
// 			);
// 			global.gl.bindBuffer(global.gl.UNIFORM_BUFFER, null);
// 		}

// 		this.shaderProgram.vertexPositionAttribute = global.gl.getAttribLocation(this.shaderProgram, this.gl_attributes.vertex_pos);
// 		this.shaderProgram.textureCoordAttribute = global.gl.getAttribLocation(this.shaderProgram, this.gl_attributes.text_coords);


// 		global.gl.uniformMatrix4fv(this.shaderProgram.mMatrixUniform, false, mMatrix);
// 		global.gl.uniformMatrix4fv(this.shaderProgram.pMatrixUniform, false, pMatrix);
// 		global.gl.uniformMatrix4fv(this.shaderProgram.vMatrixUniform, false, vMatrix);

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

// 		this.enableShader(pMatrix, vMatrix, this.modelMatrix);
// 		// global.gl.uniform1f(this.uniformVertexTextureFactor7Loc, 0.0);


// 		for (let [tileidx, tile] of tiles) {
// 			// tile.draw(pMatrix, vMatrix, this.modelMatrix);

// 			if (tile !== undefined && tile.isLoaded == true) {


// 				// tile.draw();

// 				global.gl.bindBuffer(global.gl.ARRAY_BUFFER, tile.vertexPositionBuffer);
				
// 				global.gl.vertexAttribPointer(this.shaderProgram.vertexPositionAttribute, 3, global.gl.FLOAT, false, 5 * 4, 0);
				
// 				global.gl.vertexAttribPointer(this.shaderProgram.textureCoordAttribute, 2, global.gl.FLOAT, false, 5 * 4, 3 * 4);


// 				global.gl.bindBuffer(global.gl.ELEMENT_ARRAY_BUFFER, tile.vertexIndexBuffer);

// 				global.gl.enableVertexAttribArray(this.shaderProgram.vertexPositionAttribute);
// 				global.gl.enableVertexAttribArray(this.shaderProgram.textureCoordAttribute);

// 				if (tile._order < Tile.MAX_REFORDER) {

// 					global.gl.activeTexture(global.gl.TEXTURE0 + this.samplerIdx);
// 					global.gl.bindTexture(global.gl.TEXTURE_2D, tile._texture);
// 					global.gl.uniform1f(this.uniformVertexTextureFactorLoc, tile.opacity);
// 					global.gl.uniform1i(this.uniformColorMapIdx, this.colorMapIdx);

// 					let primno = (tile.vertexIndices.length / 6) * 2 * 3;
				
// 					global.gl.drawElements(global.gl.TRIANGLES, primno, global.gl.UNSIGNED_SHORT, 0);

// 				} else {
// 					for (var i = 0; i < tile._pixels.length; i++) {

// 						global.gl.activeTexture(global.gl.TEXTURE0 + this.samplerIdx);
// 						global.gl.bindTexture(global.gl.TEXTURE_2D, tile._texture);
// 						global.gl.uniform1f(this.uniformVertexTextureFactorLoc, tile.opacity);
// 						global.gl.uniform1i(this.uniformColorMapIdx, this.colorMapIdx);

// 						global.gl.drawElements(global.gl.TRIANGLES, 6, global.gl.UNSIGNED_SHORT, 12 * i);
// 					}
// 				}

// 				global.gl.disableVertexAttribArray(this.shaderProgram.vertexPositionAttribute);
// 				global.gl.disableVertexAttribArray(this.shaderProgram.textureCoordAttribute);
// 			}
// 		}

// 	}

// }

// export default HiPS;