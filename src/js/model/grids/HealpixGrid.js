"use strict";

import { Healpix, Pointing, Vec3 } from 'healpixjs';
import {vec3, vec4, mat3, mat4} from 'gl-matrix';

import AbstractSkyEntity from '../AbstractSkyEntity.js';
import global from '../../Global.js';
import { fovHelper } from '../hipsnew/FoVHelper.js';
import FoVUtils from '../../utils/FoVUtils.js';
import CoordsType from '../../utils/CoordsType.js';
import RayPickingUtils from '../../utils/RayPickingUtils.js';
import Point from '../../utils/Point.js';

import GridShaderManager from '../../shaders/GridShaderManager.js';
import GeomUtils from '../../utils/GeomUtils.js';
import { gridTextHelper } from './GridTextHelper.js';
// import { visibleTilesManager } from './VisibleTilesManager.js';
import { newVisibleTilesManager } from '../hipsnew/VisibleTilesManager.js';



class HealpixGrid extends AbstractSkyEntity{

	static ELEM_SIZE;
	static BYTES_X_ELEM;
	_refreshingBuffers;

    constructor(radius, position, xrad, yrad, fov) {

		super(radius, position, xrad, yrad, "healpix-grid", false);

		HealpixGrid.ELEM_SIZE = 3;
		HealpixGrid.BYTES_X_ELEM = new Float32Array().BYTES_PER_ELEMENT;

		this._viewmatrix = undefined;

		
		this._shaderProgram = global.gl.createProgram();
		this.initShaders();
		// this._tileBuffer = new GridTilesBuffer(this._descriptor, this._format, this.shaderProgram, this.samplerIdx, this);
		// let fov = 180; // <== TODO this must be a constructor parameter

		let order = fovHelper.getHiPSNorder(fov);
		this._visibleorder = order;
		this._oldorder = order;

		// if (order > this._maxorder) {
		// 	order = this._maxorder
		// }

		// this._visiblePixels = this.computeVisiblePixels(order);


		this._attribLocations = {};
		this._nPrimitiveFlags = 0;
		this._totPoints = 0;
		
		this._refreshingBuffers = false
		
		this._vertexCataloguePositionBuffer = global.gl.createBuffer();
		this._indexBuffer = global.gl.createBuffer();
		
		this._vertexCataloguePosition = [];
		
		this._oldMouseCoords = null;
		
		this._attribLocations = {
				position: 0,
				selected: 1,
				pointSize: 2,
				color: [0.0, 1.0, 0.0, 1.0]
		};

		// this.initBuffers();
		// this.updateTiles(pixelByOrder.pixels, pixelByOrder.order);

	}



	initShaders() {

		let fragmentShaderStr = GridShaderManager.healpixGridFS();
		this.fragmentShader = global.gl.createShader(global.gl.FRAGMENT_SHADER);
		global.gl.shaderSource(this.fragmentShader, fragmentShaderStr);
		global.gl.compileShader(this.fragmentShader);
		if (!global.gl.getShaderParameter(this.fragmentShader, global.gl.COMPILE_STATUS)) {
			alert(global.gl.getShaderInfoLog(this.fragmentShader));
			return null;
		}

		let vertexShaderStr = GridShaderManager.healpixGridVS();
		this.vertexShader = global.gl.createShader(global.gl.VERTEX_SHADER);
		global.gl.shaderSource(this.vertexShader, vertexShaderStr);
		global.gl.compileShader(this.vertexShader);
		if (!global.gl.getShaderParameter(this.vertexShader, global.gl.COMPILE_STATUS)) {
			alert(global.gl.getShaderInfoLog(this.vertexShader));
			return null;
		}

		global.gl.attachShader(this._shaderProgram, this.vertexShader);
		global.gl.attachShader(this._shaderProgram, this.fragmentShader);
		global.gl.linkProgram(this._shaderProgram);

		if (!global.gl.getProgramParameter(this._shaderProgram, global.gl.LINK_STATUS)) {
			alert("Could not initialise shaders");
		}
		global.gl.useProgram(this._shaderProgram);

	}

	initBuffersBK () {
		this._nPrimitiveFlags = 0;
		this._refreshingBuffers = true;
		let pixels = this._visiblePixels.pixels;
		let order = this._visiblePixels.order;
		// let healpix = new Healpix(Math.pow(2, order));

		let positionIndex = 0;
		let vIdx = 0;
		let R = 1.0;
		
		let MAX_UNSIGNED_SHORT = 0xFFFFFFFF;

		
		/**
		 * https://stackoverflow.com/questions/33442043/projecting-an-arc-through-two-points-about-a-sphere
		float d;
		Vector3 P0, P1;

		float r = norm(P0);
		float angle = d / r;
		Vector3 axis = crossProduct(P0, P1);
		Matrix3 rotationMatrix = RotationMatrix(angle, axis);
		Vector3 endPoint = rotationMatrix * P0;
		*/


		// TODO remove common points between pixels
		let d = 0.1;
		let angle;
		let nSegs = 12;
		this._pointsXseg = nSegs - 1;
		let pointsXpix = this._pointsXseg * 4;

		this._indexes = new Uint32Array( (3 * 4 * pointsXpix + 1) * pixels.length );
		this._vertexCataloguePosition = new Float32Array( 3 * 4 * pointsXpix * pixels.length);
		
		for (let p = 0; p < pixels.length; p++) {
			let vecs = this._healpix.getBoundaries(pixels[p]);

			for (let v = 0; v < vecs.length; v++) {

				let p0 = vecs[v];
				let v0 = vec3.fromValues(p0.x, p0.y, p0.z);
				let p1, v1;

				if (v == vecs.length - 1) {
					p1 = vecs[0];
					v1 = vec3.fromValues(p1.x, p1.y, p1.z);	
				} else {
					p1 = vecs[v+1];
					v1 = vec3.fromValues(p1.x, p1.y, p1.z);
				}

				let cross = vec3.create();
				vec3.cross(cross, v0, v1);
				
				let normcross_tmp = vec3.create();
				vec3.normalize(normcross_tmp, cross);
				let normcross = new Vec3(normcross_tmp[0], normcross_tmp[1], normcross_tmp[2]);

				let rot = mat3.create();
				


				let distP0P1 = Math.sqrt( (p0.x-p1.x)**2 + (p0.y-p1.y)**2 + (p0.z-p1.z)**2 );
				

				
				let step = distP0P1/nSegs;

				this._vertexCataloguePosition[positionIndex] = R * p0.x;
				this._vertexCataloguePosition[positionIndex+1] = R * p0.y;
				this._vertexCataloguePosition[positionIndex+2] = R * p0.z;
				
				this._indexes[vIdx] = Math.floor(positionIndex/3);

				vIdx += 1;
				positionIndex += 3;

				for (let s = nSegs - 1; s > 0; s--){
				// for (let s = 1; s < nSegs; s++){
					angle = (s*step)/this.radius;
					rot[0] = Math.cos(angle) + normcross.x**2 * (1 - Math.cos(angle));
					rot[1] = normcross.x * normcross.y * (1 - Math.cos(angle)) - normcross.z * Math.sin(angle);
					rot[2] = normcross.x * normcross.z * (1 - Math.cos(angle)) + normcross.y * Math.sin(angle);

					rot[3] = normcross.x * normcross.y * (1 - Math.cos(angle)) + normcross.z * Math.sin(angle);
					rot[4] = Math.cos(angle) + normcross.y**2 * (1 - Math.cos(angle));
					rot[5] = normcross.y * normcross.z * (1 - Math.cos(angle)) - normcross.x * Math.sin(angle);

					rot[6] = normcross.x * normcross.z * (1 - Math.cos(angle)) - normcross.y * Math.sin(angle);
					rot[7] = normcross.y * normcross.z * (1 - Math.cos(angle)) + normcross.x * Math.sin(angle);
					rot[8] = Math.cos(angle) + normcross.z**2 * (1 - Math.cos(angle));
					
					let endPoint = vec3.create();
					vec3.transformMat3(endPoint, v1, rot);

					this._vertexCataloguePosition[positionIndex] = R * endPoint[0];
					this._vertexCataloguePosition[positionIndex+1] = R * endPoint[1];
					this._vertexCataloguePosition[positionIndex+2] = R * endPoint[2];

					this._indexes[vIdx] = Math.floor(positionIndex/3);
				
					vIdx += 1;
					positionIndex += 3;
				}

				this._vertexCataloguePosition[positionIndex] = R * p1.x;
				this._vertexCataloguePosition[positionIndex+1] = R * p1.y;
				this._vertexCataloguePosition[positionIndex+2] = R * p1.z;

				this._indexes[vIdx] = Math.floor(positionIndex/3);

				vIdx += 1;
				positionIndex += 3;

			}

			this._indexes[vIdx] = MAX_UNSIGNED_SHORT;
			this._nPrimitiveFlags += 1;
			vIdx += 1;

		}
			

		// this._indexes = new Uint32Array( 5*pixels.length );
		// this._vertexCataloguePosition = new Float32Array( 3 * 4 * pixels.length);
		
		// for (let p = 0; p < pixels.length; p++) {
		// 	let vecs = healpix.getBoundaries(pixels[p]);

		// 	for (let v = 0; v < vecs.length; v++) {

		// 		this._vertexCataloguePosition[positionIndex] = R * vecs[v].x;
		// 		this._vertexCataloguePosition[positionIndex+1] = R * vecs[v].y;
		// 		this._vertexCataloguePosition[positionIndex+2] = R * vecs[v].z;
								
		// 		this._indexes[vIdx] = Math.floor(positionIndex/3);
				
		// 		vIdx += 1;
		// 		positionIndex += 3;

		// 	}
		// 	this._indexes[vIdx] = MAX_UNSIGNED_SHORT;
		// 	this._nPrimitiveFlags += 1;
		// 	vIdx += 1;

		// }

		this._refreshingBuffers = false;
		
	}

	initBuffers (pixels, order) {
		this._nPrimitiveFlags = 0;
		this._refreshingBuffers = true;
		// let pixels = this._visiblePixels.pixels;
		// let order = this._visiblePixels.order;

		// let healpix = new Healpix(Math.pow(2, order));
		let healpix = global.getHealpix(order);

		let positionIndex = 0;
		let vIdx = 0;
		let R = 1.0;
		
		let MAX_UNSIGNED_SHORT = 0xFFFFFFFF;

		
		/**
		 * https://stackoverflow.com/questions/33442043/projecting-an-arc-through-two-points-about-a-sphere
		float d;
		Vector3 P0, P1;

		float r = norm(P0);
		float angle = d / r;
		Vector3 axis = crossProduct(P0, P1);
		Matrix3 rotationMatrix = RotationMatrix(angle, axis);
		Vector3 endPoint = rotationMatrix * P0;
		*/


		// TODO remove common points between pixels
		this._indexes = new Uint32Array( 17*pixels.length );
		this._vertexCataloguePosition = new Float32Array( 3 * 16 * pixels.length);
		
		// let subhpx = new Healpix(Math.pow(2, order+1));
		// let subsubhpx = new Healpix(Math.pow(2, order+2));
		let subhpx = global.getHealpix(order+1);
		let subsubhpx = global.getHealpix(order+2);
		

		for (let p = 0; p < pixels.length; p++) {
			let vecs = healpix.getBoundaries(pixels[p]);

			let cpix0 = pixels[p] << 2;
			let cpix1 = cpix0 + 1;
			let cpix2 = cpix0 + 2;
			let cpix3 = cpix0 + 3;
			let cp0vecs = subhpx.getBoundaries(cpix0);
			// let cp1vecs = subhpx.getBoundaries(cpix1);
			// let cp2vecs = subhpx.getBoundaries(cpix2);
			let cp3vecs = subhpx.getBoundaries(cpix3);

		
			// v0(3/0)
			this._vertexCataloguePosition[positionIndex] = R * vecs[0].x;
			this._vertexCataloguePosition[positionIndex+1] = R * vecs[0].y;
			this._vertexCataloguePosition[positionIndex+2] = R * vecs[0].z;				
			this._indexes[vIdx] = Math.floor(positionIndex/3);
			vIdx += 1;
			positionIndex += 3;

			
			// v1(15/2)
			let subcpix3 = cpix3 << 2;
			let subcpix3_3 = subcpix3 + 3;
			let tmp  = subsubhpx.getBoundaries(subcpix3_3);
			this._vertexCataloguePosition[positionIndex] = R * tmp[1].x;
			this._vertexCataloguePosition[positionIndex+1] = R * tmp[1].y;
			this._vertexCataloguePosition[positionIndex+2] = R * tmp[1].z;				
			this._indexes[vIdx] = Math.floor(positionIndex/3);
			vIdx += 1;
			positionIndex += 3;

			
			// v1(3/1)
			this._vertexCataloguePosition[positionIndex] = R * cp3vecs[1].x;
			this._vertexCataloguePosition[positionIndex+1] = R * cp3vecs[1].y;
			this._vertexCataloguePosition[positionIndex+2] = R * cp3vecs[1].z;				
			this._indexes[vIdx] = Math.floor(positionIndex/3);
			vIdx += 1;
			positionIndex += 3;


			// v0(2/2)
			let subcpix2 = cpix2 << 2;
			let subcpix2_2 = subcpix2 + 2;
			tmp  = subsubhpx.getBoundaries(subcpix2_2);
			this._vertexCataloguePosition[positionIndex] = R * tmp[0].x;
			this._vertexCataloguePosition[positionIndex+1] = R * tmp[0].y;
			this._vertexCataloguePosition[positionIndex+2] = R * tmp[0].z;				
			this._indexes[vIdx] = Math.floor(positionIndex/3);
			vIdx += 1;
			positionIndex += 3;

			// v1(0/0)
			this._vertexCataloguePosition[positionIndex] = R * vecs[1].x;
			this._vertexCataloguePosition[positionIndex+1] = R * vecs[1].y;
			this._vertexCataloguePosition[positionIndex+2] = R * vecs[1].z;				
			this._indexes[vIdx] = Math.floor(positionIndex/3);
			vIdx += 1;
			positionIndex += 3;


			// v2(2/2)
			this._vertexCataloguePosition[positionIndex] = R * tmp[2].x;
			this._vertexCataloguePosition[positionIndex+1] = R * tmp[2].y;
			this._vertexCataloguePosition[positionIndex+2] = R * tmp[2].z;				
			this._indexes[vIdx] = Math.floor(positionIndex/3);
			vIdx += 1;
			positionIndex += 3;

			// v1(0/1)
			this._vertexCataloguePosition[positionIndex] = R * cp0vecs[1].x;
			this._vertexCataloguePosition[positionIndex+1] = R * cp0vecs[1].y;
			this._vertexCataloguePosition[positionIndex+2] = R * cp0vecs[1].z;				
			this._indexes[vIdx] = Math.floor(positionIndex/3);
			vIdx += 1;
			positionIndex += 3;

			// v1(0/2)
			let subcpix0 = cpix0 << 2;
			let subcpix0_2 = subcpix0;
			tmp  = subsubhpx.getBoundaries(subcpix0_2);
			this._vertexCataloguePosition[positionIndex] = R * tmp[1].x;
			this._vertexCataloguePosition[positionIndex+1] = R * tmp[1].y;
			this._vertexCataloguePosition[positionIndex+2] = R * tmp[1].z;				
			this._indexes[vIdx] = Math.floor(positionIndex/3);
			vIdx += 1;
			positionIndex += 3;

			// v2(0/0)
			this._vertexCataloguePosition[positionIndex] = R * vecs[2].x;
			this._vertexCataloguePosition[positionIndex+1] = R * vecs[2].y;
			this._vertexCataloguePosition[positionIndex+2] = R * vecs[2].z;				
			this._indexes[vIdx] = Math.floor(positionIndex/3);
			vIdx += 1;
			positionIndex += 3;

			// v3(0/2)
			this._vertexCataloguePosition[positionIndex] = R * tmp[3].x;
			this._vertexCataloguePosition[positionIndex+1] = R * tmp[3].y;
			this._vertexCataloguePosition[positionIndex+2] = R * tmp[3].z;				
			this._indexes[vIdx] = Math.floor(positionIndex/3);
			vIdx += 1;
			positionIndex += 3;


			// v3(0/1)
			this._vertexCataloguePosition[positionIndex] = R * cp0vecs[3].x;
			this._vertexCataloguePosition[positionIndex+1] = R * cp0vecs[3].y;
			this._vertexCataloguePosition[positionIndex+2] = R * cp0vecs[3].z;				
			this._indexes[vIdx] = Math.floor(positionIndex/3);
			vIdx += 1;
			positionIndex += 3;


			// v2(5/2)
			let subcpix1 = cpix1 << 2;
			let subcpix1_1 = subcpix1 + 1; 
			tmp  = subsubhpx.getBoundaries(subcpix1_1);
			this._vertexCataloguePosition[positionIndex] = R * tmp[2].x;
			this._vertexCataloguePosition[positionIndex+1] = R * tmp[2].y;
			this._vertexCataloguePosition[positionIndex+2] = R * tmp[2].z;				
			this._indexes[vIdx] = Math.floor(positionIndex/3);
			vIdx += 1;
			positionIndex += 3;

			// v3(0/0)
			this._vertexCataloguePosition[positionIndex] = R * vecs[3].x;
			this._vertexCataloguePosition[positionIndex+1] = R * vecs[3].y;
			this._vertexCataloguePosition[positionIndex+2] = R * vecs[3].z;				
			this._indexes[vIdx] = Math.floor(positionIndex/3);
			vIdx += 1;
			positionIndex += 3;

			// v0(5/2)
			this._vertexCataloguePosition[positionIndex] = R * tmp[0].x;
			this._vertexCataloguePosition[positionIndex+1] = R * tmp[0].y;
			this._vertexCataloguePosition[positionIndex+2] = R * tmp[0].z;				
			this._indexes[vIdx] = Math.floor(positionIndex/3);
			vIdx += 1;
			positionIndex += 3;


			// v3(3/1)
			this._vertexCataloguePosition[positionIndex] = R * cp3vecs[3].x;
			this._vertexCataloguePosition[positionIndex+1] = R * cp3vecs[3].y;
			this._vertexCataloguePosition[positionIndex+2] = R * cp3vecs[3].z;				
			this._indexes[vIdx] = Math.floor(positionIndex/3);
			vIdx += 1;
			positionIndex += 3;


			tmp  = subsubhpx.getBoundaries(subcpix3_3);
			this._vertexCataloguePosition[positionIndex] = R * tmp[3].x;
			this._vertexCataloguePosition[positionIndex+1] = R * tmp[3].y;
			this._vertexCataloguePosition[positionIndex+2] = R * tmp[3].z;				
			this._indexes[vIdx] = Math.floor(positionIndex/3);
			vIdx += 1;
			positionIndex += 3;



			this._indexes[vIdx] = MAX_UNSIGNED_SHORT;
			this._nPrimitiveFlags += 1;
			vIdx += 1;

		}

		this._refreshingBuffers = false;
		
	}

	// TODO this is in common with HiPS4.js. to be moved elsewhere
	computeVisiblePixels(order, fov) {

		// this._healpix = new Healpix(Math.pow(2, order));
		this._healpix = global.getHealpix(order);
		let pixels = [];
		
		if (order == 0) {
			let npix = this._healpix.getNPix();
			pixels = [npix];
			pixels.splice(0, npix);
			for (let i = 0; i < npix; i++) {
				pixels.push(i);
			}
		} else {



			let maxX = global.gl.canvas.width;
			let maxY = global.gl.canvas.height;

			let xy = [];
			let neighbours = [];
			let intersectionWithModel;
			let intersectionPoint = null;
			let currP, currPixNo;

			// TODO probably it would be better to use query_disc_inclusive from HEALPix 
			// against a polygon. Check my FHIPSWebGL2 project (BufferManager.js -> updateVisiblePixels)
			// intersectionWithModel = RayPickingUtils.getIntersectionPointWithSingleModel(maxX/2, maxY/2, this);
			// let vec3 = new Vec3(intersectionWithModel.intersectionPoint[0], intersectionWithModel.intersectionPoint[1], intersectionWithModel.intersectionPoint[2]);
			// let ptg = new Pointing(vec3);
			// let pxs = geomhealpix.queryDiscInclusive(ptg, fov * Math.PI/180, 4);
			// for (let p =0; p < pxs.r.length; p++) {
			//     if (pixels.indexOf(pxs.r[p]) == -1){
			//         if(pxs.r[p] >= 0){
			//             pixels.push(pxs.r[p]);	
			//         }
			//     }
			// }

			var i = 0;
			for (i = 0; i <= maxX; i += maxX / 10) {
				var j = 0;
				for (j = 0; j <= maxY; j += maxY / 10) {

					intersectionWithModel = {
						"intersectionPoint": null,
						"pickedObject": null
					};

					xy = [i, j];


					intersectionWithModel = RayPickingUtils.getIntersectionPointWithSingleModel(xy[0], xy[1], this);
					intersectionPoint = intersectionWithModel.intersectionPoint;

					if (intersectionPoint.length > 0) {
						currP = new Pointing(new Vec3(intersectionPoint[0], intersectionPoint[1], intersectionPoint[2]));


						
						currPixNo = this._healpix.ang2pix(currP);
						if (currPixNo >= 0) {
							neighbours = this._healpix.neighbours(currPixNo);
							if (pixels.indexOf(currPixNo) == -1) {
								pixels.push(currPixNo);
							}
							var k = 0;
							for (k = 0; k < neighbours.length; k++) {
								if (pixels.indexOf(neighbours[k]) == -1) {
									if (neighbours[k] >= 0) {
										pixels.push(neighbours[k]);
									}
								}
							}
						}
					}
				}
			}
		}


		return {
			"pixels": pixels,
			"order": order
		};

	}

	updateTiles(pixels, order) {
		let tiles = this._tileBuffer.updateTiles(pixels, order);
		return tiles;
	}


	refresh(pMatrix) {

		this._oldorder = this._visibleorder;

		this.refreshFoV(false, pMatrix);

		let fov = this.getMinFoV();

		// UPDATING GLOBAL FoV USED BY VISIBLETILEMANAGER. Move it into a method in GLOBAL
		global.hipsFoV = fov;
		global.order = fovHelper.getHiPSNorder(fov);
		
		this._visibleorder = global.order;
		// if (this._visibleorder > this._maxorder) {
		// 	this._visibleorder = this._maxorder
		// }
		// if (this._oldorder != this._visibleorder || cameraRotated) {
			
		// 	this._visiblePixels = this.computeVisiblePixels(this._visibleorder);
		// 	this.initBuffers();
			
		// }

	}

	

	enableShader(in_mMatrix){

		global.gl.useProgram(this._shaderProgram);
		this._shaderProgram.catUniformMVMatrixLoc = global.gl.getUniformLocation(this._shaderProgram, "uMVMatrix");
		this._shaderProgram.catUniformProjMatrixLoc = global.gl.getUniformLocation(this._shaderProgram, "uPMatrix");
		this._attribLocations.position  = global.gl.getAttribLocation(this._shaderProgram, 'aCatPosition');
		let mvMatrix = mat4.create();
		mvMatrix = mat4.multiply(mvMatrix, global.camera.getCameraMatrix(), in_mMatrix);
		global.gl.uniformMatrix4fv(this._shaderProgram.catUniformMVMatrixLoc, false, mvMatrix);
		global.gl.uniformMatrix4fv(this._shaderProgram.catUniformProjMatrixLoc, false, global.pMatrix);

		
		
	}
	

	 draw(mMatrix, cameraRotated, showHPXGrid, pMatrix) {
				
		// if (this._vertexCataloguePosition == undefined || this._vertexCataloguePosition.length == 0) {
		// 	return;
		// }
		// if (this._refreshingBuffers || this._vertexCataloguePosition == undefined || this._vertexCataloguePosition.length == 0) {
		// 	return;
		// }
		
		this.refresh(pMatrix);
		if (!showHPXGrid){
			return;
		}
		const visibleTiles = newVisibleTilesManager.visibleTilesByOrder;
		let pixels = visibleTiles.pixels;
		let order = visibleTiles.order;
		this.initBuffers(pixels, order);

		this.enableShader(mMatrix);
		
		// TODO move this out of the draw method <- ?
		global.gl.bindBuffer(global.gl.ARRAY_BUFFER, this._vertexCataloguePositionBuffer);
		global.gl.bufferData(global.gl.ARRAY_BUFFER, this._vertexCataloguePosition, global.gl.STATIC_DRAW);
		
		// setting footprint position
		global.gl.vertexAttribPointer(this._attribLocations.position, HealpixGrid.ELEM_SIZE, global.gl.FLOAT, false, HealpixGrid.BYTES_X_ELEM * HealpixGrid.ELEM_SIZE, 0);
		global.gl.enableVertexAttribArray(this._attribLocations.position);
		
		global.gl.bindBuffer(global.gl.ELEMENT_ARRAY_BUFFER, this._indexBuffer);
		global.gl.bufferData(global.gl.ELEMENT_ARRAY_BUFFER, this._indexes, global.gl.STATIC_DRAW);
		
		// var ext = global.gl.getExtension('OES_element_index_uint'); // <-- moved into FVPresenter.draw
		global.gl.drawElements (global.gl.LINE_LOOP, this._vertexCataloguePosition.length / 3 + this._nPrimitiveFlags, global.gl.UNSIGNED_INT, 0);
		// global.gl.drawElements (global.gl.POINT, this._vertexCataloguePosition.length / 3 + 1, global.gl.UNSIGNED_SHORT, 0);
		
		global.gl.bindBuffer(global.gl.ARRAY_BUFFER, null);
		global.gl.bindBuffer(global.gl.ELEMENT_ARRAY_BUFFER, null);
		
        let mvMatrix = mat4.create();
        mvMatrix = mat4.multiply(mvMatrix, global.camera.getCameraMatrix(), mMatrix);
        let mvpMatrix = mat4.create();
        mvpMatrix = mat4.multiply(mvpMatrix, global.pMatrix, mvMatrix);

		let center = FoVUtils.getCenterJ2000(global.gl.canvas);

		
		// let pixels = this._visiblePixels.pixels;
		// let order = this._visiblePixels.order;
		let fovMin = ((this.getMinFoV() * (Math.PI/180.0) ) / 2 );

		for (let p = 0; p < pixels.length; p++) {
			let pixCenter = global.getHealpix(global.order).pix2vec(pixels[p]);

			let point = new Point({"x": pixCenter.x, "y": pixCenter.y, "z": pixCenter.z}, CoordsType.CARTESIAN);

			let distance = GeomUtils.orthodromicDistance(center, point);
			if (distance < fovMin){
				let vertex = [pixCenter.x, pixCenter.y, pixCenter.z, 1];
				let clipspace = vec4.create();
				vec4.transformMat4(clipspace, vertex, mvpMatrix);
	
				// divide X and Y by W just like the GPU does.
				clipspace[0] /= clipspace[3];
				clipspace[1] /= clipspace[3];
	
				// convert from clipspace to pixels
				let pixelX = (clipspace[0] *  0.5 + 0.5) * global.gl.canvas.width;
				let pixelY = (clipspace[1] * -0.5 + 0.5) * global.gl.canvas.height;
	
				
				gridTextHelper.addHPXDivSet(this._visibleorder+"/"+pixels[p], pixelX, pixelY);
			}


			
		}
		


		gridTextHelper.resetDivSets();
		
	}

}

export default HealpixGrid;