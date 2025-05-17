
// "use strict";
// /**
//  * @author Fabrizio Giordano (Fab77)
//  * @param in_radius - number
//  * @param in_gl - GL context
//  * @param in_position - array of double e.g. [0.0, 0.0, -7]
//  */
// import { mat4 } from 'gl-matrix';
// import { Healpix, Pointing, Vec3 } from "healpixjs";

// import AbstractSkyEntity from '../AbstractSkyEntity.js';
// import global from '../../Global.js';
// import { fovHelper } from './FoVHelper.js';
// import RayPickingUtils from '../../utils/RayPickingUtils.js';
// import TilesBuffer from './TileBuffer.js';
// import { glSamplerManager } from './GLSamplerManager.js';


// class HiPSHelper {


// 	constructor(fov) {

// 		let order = fovHelper.getHiPSNorder(fov);
// 		this._healpix = new Healpix(Math.pow(2, order));
// 		this._hipsLoaded = [];
// 		this.initShaders();

// 	}

// 	initShaders() {


// 		var fragmentShader = getShader("hips-shader-fs");
// 		var vertexShader = getShader("hips-shader-vs");

// 		this._shaderprogram = global.gl.createProgram();
// 		global.gl.attachShader(this._shaderprogram, vertexShader);
// 		global.gl.attachShader(this._shaderprogram, fragmentShader);
// 		global.gl.linkProgram(this._shaderprogram);

// 		if (!global.gl.getProgramParameter(this._shaderprogram, global.gl.LINK_STATUS)) {
// 			alert("Could not initialise shaders");
// 		}

// 		global.gl.useProgram(this._shaderprogram);

// 		function getShader(id) {
// 			var shaderScript = document.getElementById(id);
// 			if (!shaderScript) {
// 				return null;
// 			}

// 			var str = "";
// 			var k = shaderScript.firstChild;
// 			while (k) {
// 				if (k.nodeType == 3) {
// 					str += k.textContent;
// 				}
// 				k = k.nextSibling;
// 			}

// 			var shader;
// 			if (shaderScript.type == "x-shader/x-fragment") {
// 				shader = global.gl.createShader(global.gl.FRAGMENT_SHADER);
// 			} else if (shaderScript.type == "x-shader/x-vertex") {
// 				shader = global.gl.createShader(global.gl.VERTEX_SHADER);
// 			} else {
// 				return null;
// 			}

// 			global.gl.shaderSource(shader, str);
// 			global.gl.compileShader(shader);

// 			if (!global.gl.getShaderParameter(shader, global.gl.COMPILE_STATUS)) {
// 				alert(global.gl.getShaderInfoLog(shader));
// 				return null;
// 			}

// 			return shader;
// 		}

// 	}

// 	enableShader(pMatrix, vMatrix, mMatrix) {

// 		global.gl.useProgram(this._shaderprogram);

// 		this._shaderprogram.pMatrixUniform = global.gl.getUniformLocation(this._shaderprogram, "uPMatrix");
// 		this._shaderprogram.mMatrixUniform = global.gl.getUniformLocation(this._shaderprogram, "uMMatrix");
// 		this._shaderprogram.vMatrixUniform = global.gl.getUniformLocation(this._shaderprogram, "uVMatrix");

// 		this._shaderprogram.vertexPositionAttribute = global.gl.getAttribLocation(this._shaderprogram, "aVertexPosition");
// 		this._shaderprogram.textureCoordAttribute = global.gl.getAttribLocation(this._shaderprogram, "aTextureCoord");

// 		global.gl.uniformMatrix4fv(this._shaderprogram.mMatrixUniform, false, mMatrix);
// 		global.gl.uniformMatrix4fv(this._shaderprogram.pMatrixUniform, false, pMatrix);
// 		global.gl.uniformMatrix4fv(this._shaderprogram.vMatrixUniform, false, vMatrix);

// 	}


// 	refreshHealpix(fov) {
// 		let order = fovHelper.getHiPSNorder(fov);
// 		this._healpix = new Healpix(Math.pow(2, order));
// 	}

// 	computeVisibleTiles(order) {

// 		let geomhealpix = new Healpix(Math.pow(2, order));
// 		let pixels = [];

// 		if (order == 0) {
// 			let npix = geomhealpix.getNPix();
// 			pixels = [npix];
// 			pixels.splice(0, npix);
// 			for (let i = 0; i < npix; i++) {
// 				pixels.push(i);
// 			}
// 		} else {

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
// 							neighbours = geomhealpix.neighbours(currPixNo);
// 							if (pixels.indexOf(currPixNo) == -1) {
// 								pixels.push(currPixNo);
// 							}
// 							var k = 0;
// 							for (k = 0; k < neighbours.length; k++) {
// 								if (pixels.indexOf(neighbours[k]) == -1) {
// 									if (neighbours[k] >= 0) {
// 										pixels.push(neighbours[k]);
// 									}
// 								}
// 							}
// 						}
// 					}
// 				}
// 			}
// 		}
// 		return {
// 			"pixels": pixels,
// 			"order": order
// 		};
// 	}

// 	draw(pMatrix, vMatrix, cameraRotated) {

// 		global.gl.bindBuffer(global.gl.ARRAY_BUFFER, this.vertexPositionBuffer);
// 		global.gl.vertexAttribPointer(this._shaderprogram.vertexPositionAttribute, this.vertexPositionBuffer.itemSize, global.gl.FLOAT, false, 0, 0);

// 		global.gl.bindBuffer(global.gl.ARRAY_BUFFER, this.vertexTextureCoordBuffer);
// 		global.gl.vertexAttribPointer(this._shaderprogram.textureCoordAttribute, this.vertexTextureCoordBuffer.itemSize, global.gl.FLOAT, false, 0, 0);

// 		global.gl.bindBuffer(global.gl.ELEMENT_ARRAY_BUFFER, this.vertexIndexBuffer);

// 		global.gl.enableVertexAttribArray(this._shaderprogram.vertexPositionAttribute);
// 		global.gl.enableVertexAttribArray(this._shaderprogram.textureCoordAttribute);

// 		for (const [sampler, ships] of glSamplerManager._samplerMap.entries()) {
// 			if (ships === null) {

// 				// let tiles = ships.getTiles();
// 				// tiles.forEach( (tile) => {
// 				//      tile.enableShader()
// 				//      tile.getTextureBuffer;
// 				//      tile.getIndexBuffer;
// 				//      tile.getVertexBuffer
// 				// })

// 				if (this._order < 3) {

// 					global.gl.activeTexture(global.gl.TEXTURE0 + this._hipsShaderIndex);
// 					global.gl.bindTexture(global.gl.TEXTURE_2D, this._texture);
// 					global.gl.uniform1f(this.uniformVertexTextureFactorLoc, this.opacity);

// 					for (let i = 0; i < this._pixels.length; i++) {

// 						global.gl.drawElements(global.gl.TRIANGLES, 6, global.gl.UNSIGNED_SHORT, 12 * i);
// 					}
// 				} else {
// 					for (var i = 0; i < this._pixels.length; i++) {

// 						global.gl.activeTexture(global.gl.TEXTURE0 + this._hipsShaderIndex);
// 						global.gl.bindTexture(global.gl.TEXTURE_2D, this._texture);
// 						global.gl.uniform1f(this.uniformVertexTextureFactorLoc, this.opacity);

// 						global.gl.drawElements(global.gl.TRIANGLES, 6,
// 							global.gl.UNSIGNED_SHORT, 12 * i);
// 					}
// 				}
// 			}
// 		}

// 	}



// }