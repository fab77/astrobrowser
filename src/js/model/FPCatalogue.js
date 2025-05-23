"use strict";

import {cartesianToSpherical, sphericalToCartesian, colorHex2RGB} from '../utils/Utils.js';
import {mat4} from 'gl-matrix';
import global from '../Global.js';
import Point from '../utils/Point.js';
import CoordsType from '../utils/CoordsType.js';
import Footprint from './Footprint.js';
import { shaderUtility } from '../utils/ShaderUtility.js';
import MouseHelper from '../utils/MouseHelper.js';
import GeomUtils from '../utils/GeomUtils.js';


class FPCatalogue{
	
	static ELEM_SIZE;
	static BYTES_X_ELEM;
	
	_datasetName;
	_metadata;
	_raIdx;
	_decIdx;
	_nameIdx;
	_stcsIdx;
	_uidIdx;
	_shaderProgram;
	_gl;
	_vertexCataloguePositionBuffer;
	_indexes;
	_indexBuffer;
	_vertexSelectionCataloguePositionBuffer;
	_footprints;
	_oldMouseCoords;
	_vertexCataloguePosition;
	_attribLocations;
	_selectionIndexes;
	_descriptor;
	_totPoints;	// Used to compute item size in the GL buffer
	_indexes;
	_footprintsInPix256;
	_nPrimitiveFlags;
	
	_footprintsPointsOrder; // 1 -> clockwise, -1 -> counter clockwise
	
	_totConvexPoints;
	_convexIndexes;
	_convexIndexBuffer;
	_vertexConvexPolyPosition;
	_vertexConvexPolyPositionBuffer;
	
	constructor(in_datasetName, in_metadata, in_raIdx, in_decIdx, in_uidIdx, in_stcsIdx, in_descriptor, footprintsPointsOrder){

		this._TYPE = "FOOTPRINT_CATALOGUE";
		FPCatalogue.ELEM_SIZE = 3;
		FPCatalogue.BYTES_X_ELEM = new Float32Array().BYTES_PER_ELEMENT;
		
		this._footprintsPointsOrder = footprintsPointsOrder;
		
		this._datasetName = in_datasetName;
		this._metadata = in_metadata;
		this._raIdx = in_raIdx;
		this._decIdx = in_decIdx;
		this._uidIdx = in_uidIdx;
		this._stcsIdx = in_stcsIdx;
		
		this._descriptor = in_descriptor;
		
		this._footprints = [];
		this._attribLocations = {};
		this._nPrimitiveFlags = 0;
		this._totPoints = 0;
		
		this._gl = global.gl;
		this._shaderProgram = this._gl.createProgram();
		this._vertexCataloguePositionBuffer = this._gl.createBuffer();
		this._indexBuffer = this._gl.createBuffer();
		this._vertexSelectionCataloguePositionBuffer = this._gl.createBuffer();
		
		this._vertexCataloguePosition = [];
		
		this._selectionIndexes = [];
		
		this._oldMouseCoords = null;
		
		this._attribLocations = {
				position: 0,
				selected: 1,
				pointSize: 2,
				color: [0.0, 1.0, 0.0, 1.0]
		};
		
		this._footprintsInPix256 = new Map();
		
		this.showConvexPolygons = global.showConvexPolygons;
		if (this.showConvexPolygons){
			this._totConvexPoints = 0;
			this._convexIndexBuffer = this._gl.createBuffer();
			this._vertexConvexPolyPosition = [];
			this._vertexConvexPolyPositionBuffer = this._gl.createBuffer();
		}
		
		
		
		this.initShaders();
		
	}
	
	
	
	
	initShaders(){
		
		var _self = this;
		var gl = this._gl;
		
		var fragmentShader = this.loadShaderFromDOM("fpcat-shader-fs");
		var vertexShader = this.loadShaderFromDOM("fpcat-shader-vs");
		
		gl.attachShader(this._shaderProgram, vertexShader);
		gl.attachShader(this._shaderProgram, fragmentShader);
		gl.linkProgram(this._shaderProgram);

		if (!gl.getProgramParameter(this._shaderProgram, gl.LINK_STATUS)) {
			alert("Could not initialise shaders");
		}

		shaderUtility.useProgram(this._shaderProgram);

		// TODO USELESS
		this.setUniformLocation();
		
	}
	
	
	loadShaderFromDOM(shaderId) {
		var gl = this._gl;
		
	    var shaderScript = document.getElementById(shaderId);
	    
	    // If we don't find an element with the specified id
	    // we do an early exit
	    if (!shaderScript) {
	    	return null;
	    }
	    
	    // Loop through the children for the found DOM element and
	    // build up the shader source code as a string
	    var shaderSource = "";
	    var currentChild = shaderScript.firstChild;
	    while (currentChild) {
	        if (currentChild.nodeType == 3) { // 3 corresponds to TEXT_NODE
	      		shaderSource += currentChild.textContent;
	        }
	        currentChild = currentChild.nextSibling;
	    }
	    
	    var shader;
	    if (shaderScript.type == "x-shader/x-fragment") {
	    	shader = gl.createShader(gl.FRAGMENT_SHADER);
	    } else if (shaderScript.type == "x-shader/x-vertex") {
	    	shader = gl.createShader(gl.VERTEX_SHADER);
	    } else {
	    	return null;
	    }
	    
	    gl.shaderSource(shader, shaderSource);
	    gl.compileShader(shader);
	    
	    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
	    	alert(gl.getShaderInfoLog(shader));
	    	return null;
	    } 
	    return shader;
	}
	
	
	// TODO USELESS
	setUniformLocation(){
		
		var gl = this._gl;

		this._shaderProgram.pMatrixUniform = gl.getUniformLocation(this._shaderProgram, "uPMatrix");
		this._shaderProgram.mvMatrixUniform = gl.getUniformLocation(this._shaderProgram, "uMVMatrix");

	}
	
	
	get datasetName(){
		return this._datasetName;
	}
	
	get footprints(){
		return this._footprints;
	}
	
	addFootprint(in_footprint){
		this._footprints.push(in_footprint);
	}
	
	addFootprints(in_data){
		let j,
		point,
		footprint;
		
		for ( j = 0; j < in_data.length; j++){
			
			point = new Point({
				"raDeg": in_data[j][this._raIdx],
				"decDeg": in_data[j][this._decIdx]
			}, CoordsType.ASTRO);
			
			footprint = new Footprint(point,in_data[j][this._uidIdx], in_data[j][this._stcsIdx], in_data[j], this._footprintsPointsOrder);
			this.addFootprint(footprint);
			this._totPoints += footprint.totPoints;
			this._totConvexPoints += footprint.totConvexPoints;
		}
		this.initBuffer();
		
	}
	
	
	initBuffer () {

		
		let nFootprints = this._footprints.length;

		this._indexes = new Uint16Array(this._totPoints + nFootprints);
//		this._indexes = [];
		
		let MAX_UNSIGNED_SHORT = 65535; // this is used to enable and disable
										// GL_PRIMITIVE_RESTART_FIXED_INDEX
		
		let gl = this._gl;
			
		gl.bindBuffer(gl.ARRAY_BUFFER, this._vertexCataloguePositionBuffer);
		
		this._vertexCataloguePosition = new Float32Array( 3 * this._totPoints);
		let positionIndex = 0;
		let vIdx = 0;

		let R = 1.0;
		
		var footprintsInPix256 = this._footprintsInPix256;
		for(let j = 0; j < nFootprints; j++){
			
			let footprint = this._footprints[j];
			let footprintPoly = this._footprints[j].polygons;
			var identifier = this._footprints[j].identifier;
			
			
			if (global.healpix4footprints){
				this._footprints[j].pixels.forEach(function(pix){
					
					if (footprintsInPix256.has(pix)){
						
						let currFootprints = footprintsInPix256.get(pix);
						if (!currFootprints.includes(identifier)){
							currFootprints.push(footprint);
						}
						
					}else{
						footprintsInPix256.set(pix, [footprint]);
					}
				});	
			}
						
			for (let polyIdx in footprintPoly){
				for (let pointIdx in footprintPoly[polyIdx]){
					this._vertexCataloguePosition[positionIndex] = R * footprintPoly[polyIdx][pointIdx].x;
					this._vertexCataloguePosition[positionIndex+1] = R * footprintPoly[polyIdx][pointIdx].y;
					this._vertexCataloguePosition[positionIndex+2] = R * footprintPoly[polyIdx][pointIdx].z;
					
					this._indexes[vIdx] = Math.floor(positionIndex/3);
					
					vIdx += 1;
					positionIndex += 3;
				}

				this._indexes[vIdx] = MAX_UNSIGNED_SHORT;
				this._nPrimitiveFlags += 1;
				vIdx += 1;

			}
		}
		
		this._footprintsInPix256 = footprintsInPix256;
		console.log("Buffer initialized");

		if (this.showConvexPolygons){
			this.initConvexPolyBuffer();
		}
		
// glEnable ( GL_PRIMITIVE_RESTART_FIXED_INDEX ); // 65535
		
	}
	
	
	
	initConvexPolyBuffer(){
		let nFootprints = this._footprints.length;

		this._convexIndexes = new Uint16Array(this._totConvexPoints + nFootprints);
//		this._indexes = [];
		
		let MAX_UNSIGNED_SHORT = 65535; // this is used to enable and disable
										// GL_PRIMITIVE_RESTART_FIXED_INDEX
		
		let gl = this._gl;
			
		gl.bindBuffer(gl.ARRAY_BUFFER, this._vertexConvexPolyPositionBuffer);
		
		this._vertexConvexPolyPosition = new Float32Array( 3 * this._totConvexPoints);
		let positionIndex = 0;
		let vIdx = 0;

		let R = 1.0;
		
		for(let j = 0; j < nFootprints; j++){
			
			let footprint = this._footprints[j];
			let footprintPoly = this._footprints[j].convexPolygons;
			var identifier = this._footprints[j].identifier;
			
						
			for (let polyIdx in footprintPoly){
				for (let pointIdx in footprintPoly[polyIdx]){
					this._vertexConvexPolyPosition[positionIndex] = R * footprintPoly[polyIdx][pointIdx].x;
					this._vertexConvexPolyPosition[positionIndex+1] = R * footprintPoly[polyIdx][pointIdx].y;
					this._vertexConvexPolyPosition[positionIndex+2] = R * footprintPoly[polyIdx][pointIdx].z;
					
					this._convexIndexes[vIdx] = Math.floor(positionIndex/3);
					
					vIdx += 1;
					positionIndex += 3;
				}

				this._convexIndexes[vIdx] = MAX_UNSIGNED_SHORT;
				vIdx += 1;

			}
		}
		
		console.log("Buffer for convex polygons initialized");
	}
	
	/**
	 * @param in_mouseHelper
	 *            MouseHelper
	 */
	checkSelection (in_mouseHelper) {
		
		let mousePix = in_mouseHelper.computeNpix256();

		let mousePoint = new Point({x: in_mouseHelper.x, y: in_mouseHelper.y, z: in_mouseHelper.z}, CoordsType.CARTESIAN);
		
		if (mousePix != null){
			if (global.healpix4footprints){
				if (this._footprintsInPix256.has(mousePix)){
					// console.log("mouse pixel (n=8): "+mousePix+ "
					// "+this._footprintsInPix256.get(mousePix).length+" possible x-matches");
	
					for (let i =0; i < this._footprintsInPix256.get(mousePix).length; i++){
							
						let footprint = this._footprintsInPix256.get(mousePix)[i];
						// console.log(footprint.identifier+" pixels (n=8): "+ footprint.pixels ) ;
						
						if (GeomUtils.pointInsidePolygons2(footprint.convexPolygons, mousePoint) ){
							console.log("INSIDE "+footprint.identifier+ " pixel "+mousePix);
						}
	
					}
	
				}	
	
			} else {
				for (let i =0; i < this._footprints.length; i++){
					
					let footprint = this._footprints[i];

					if (GeomUtils.pointInsidePolygons2(footprint.convexPolygons, mousePoint, this._footprintsPointsOrder) ){
						console.log("INSIDE "+footprint.identifier+ " pixel "+mousePix);
					}
					
//					if (GeomUtils.pointInsidePolygons(footprint.polygons, mousePoint, this._footprintsPointsOrder) ){
//						console.log("INSIDE "+footprint.identifier+ " pixel "+mousePix);
//					}
					
				}
	
			}
		}
		
		
		
	}
	
	enableShader(in_mMatrix){

		this._shaderProgram.catUniformMVMatrixLoc = this._gl.getUniformLocation(this._shaderProgram, "uMVMatrix");
		this._shaderProgram.catUniformProjMatrixLoc = this._gl.getUniformLocation(this._shaderProgram, "uPMatrix");
		
		this._attribLocations.position  = this._gl.getAttribLocation(this._shaderProgram, 'aCatPosition');

		this._attribLocations.color = this._gl.getUniformLocation(this._shaderProgram,'u_fragcolor');
		
		var mvMatrix = mat4.create();
		mvMatrix = mat4.multiply(mvMatrix, global.camera.getCameraMatrix(), in_mMatrix);
		this._gl.uniformMatrix4fv(this._shaderProgram.catUniformMVMatrixLoc, false, mvMatrix);
		this._gl.uniformMatrix4fv(this._shaderProgram.catUniformProjMatrixLoc, false, global.pMatrix);

	}
	
	/**
	 * @param in_Matrix:
	 *            model matrix the current catalogue is associated to (e.g. HiPS
	 *            matrix)
	 */
	draw(in_mMatrix, in_mouseHelper){
		
		
		

		shaderUtility.useProgram(this._shaderProgram);
		
		this.enableShader(in_mMatrix);
		
		
		// TODO move this out of the draw method
		this._gl.bindBuffer(this._gl.ARRAY_BUFFER, this._vertexCataloguePositionBuffer);
		this._gl.bufferData(this._gl.ARRAY_BUFFER, this._vertexCataloguePosition, this._gl.STATIC_DRAW);
		
		
		// setting source position
		this._gl.vertexAttribPointer(this._attribLocations.position, FPCatalogue.ELEM_SIZE, this._gl.FLOAT, false, FPCatalogue.BYTES_X_ELEM * FPCatalogue.ELEM_SIZE, 0);
		this._gl.enableVertexAttribArray(this._attribLocations.position);

		
		this._gl.bindBuffer(this._gl.ELEMENT_ARRAY_BUFFER, this._indexBuffer);
		this._gl.bufferData(this._gl.ELEMENT_ARRAY_BUFFER, this._indexes, this._gl.STATIC_DRAW);
		
		
		// setting source shape color
		var rgb = colorHex2RGB(this._descriptor.shapeColor);
		var alpha = 1.0;
		rgb[3] = alpha;
		this._gl.uniform4f(this._attribLocations.color, rgb[0], rgb[1], rgb[2], rgb[3]);
		
		
		
		// MOUSE selection
		if (in_mouseHelper != null && in_mouseHelper.xyz != this._oldMouseCoords){
			
			this.checkSelection(in_mouseHelper);
			
		}
		
		/**
		 * OPENGL code sample * polygons = [ * 0,0, 10,0, 10,5, 5,10, // polygon
		 * 1 * 20,20, 30,20, 30,30 // polygon 2 * ] *
		 * glEnable(GL_PRIMITIVE_RESTART); * glPrimitiveRestartIndex(65535); *
		 * index = [0,1,2,3,65535,4,5,6,65535,...] * //bind and fill
		 * GL_ELEMENT_ARRAY_BUFFER * glDrawElements(GL_LINE_LOOP, index.size,
		 * GL_UNSIGNED_INT, 0); * //will draw lines `0,1 1,2 2,3 3,0 4,5 5,6
		 * 6,4`
		 */
		
		
		 
		/*
		 * this is not needed in WebGL since it's enabled by default
		 * this._gl.glEnable ( GL_PRIMITIVE_RESTART_FIXED_INDEX ); // 65535
		 * https://www.khronos.org/registry/webgl/specs/latest/2.0/#4.1.4
		 * https://github.com/KhronosGroup/glTF/issues/1142
		 */
		this._gl.drawElements (this._gl.LINE_LOOP, this._vertexCataloguePosition.length / 3 + 1,this._gl.UNSIGNED_SHORT, 0);
		this._gl.drawElements (this._gl.POINT, this._vertexCataloguePosition.length / 3 + 1,this._gl.UNSIGNED_SHORT, 0);
//		this._gl.drawElements (this._gl.POINT, 1,this._gl.UNSIGNED_SHORT, 0);
		
		// if (this.showConvexPolygons){
			
		// 	rgb = colorHex2RGB(this._descriptor.shapeColor);
		// 	var alpha = 0.3;
		// 	rgb[3] = alpha;
		// 	this._gl.uniform4f(this._attribLocations.color, 1., 0., 0., rgb[3]);
			
		// 	this._gl.bindBuffer(this._gl.ARRAY_BUFFER, this._vertexConvexPolyPositionBuffer);
		// 	this._gl.bufferData(this._gl.ARRAY_BUFFER, this._vertexConvexPolyPosition, this._gl.STATIC_DRAW);
		// 	this._gl.vertexAttribPointer(this._attribLocations.position, FPCatalogue.ELEM_SIZE, this._gl.FLOAT, false, FPCatalogue.BYTES_X_ELEM * FPCatalogue.ELEM_SIZE, 0);
		// 	this._gl.enableVertexAttribArray(this._attribLocations.position);			
		// 	this._gl.bindBuffer(this._gl.ELEMENT_ARRAY_BUFFER, this._convexIndexBuffer);
		// 	this._gl.bufferData(this._gl.ELEMENT_ARRAY_BUFFER, this._convexIndexes, this._gl.STATIC_DRAW);
		// 	this._gl.drawElements (this._gl.LINE_LOOP, this._vertexConvexPolyPosition.length / 3 + 1,this._gl.UNSIGNED_SHORT, 0);
			
		// }
		
		
		
// this._gl.bindBuffer(this._gl.ARRAY_BUFFER, null);
		this._gl.bindBuffer(this._gl.ELEMENT_ARRAY_BUFFER, null);
		this._oldMouseCoords = in_mouseHelper.xyz;
		
	}

	
}


export default FPCatalogue;