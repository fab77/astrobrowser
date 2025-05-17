"use strict";

import { colorHex2RGB } from '../../../../utils/Utils.js';
import { mat4 } from 'gl-matrix';
import global from '../../../../Global.js';
import Point from '../../../../utils/Point.js';
import CoordsType from '../../../../utils/CoordsType.js';
import Footprint from './Footprint.js';
import { shaderUtility } from '../../../../utils/ShaderUtility.js';
import GeomUtils from '../../../../utils/GeomUtils.js';
import TapMetadataList from '../../../../repos/tap/TapMetadataList.js';
import { session } from '../../../../utils/Session.js';

class FootprintSet {

	static ELEM_SIZE;
	static BYTES_X_ELEM;

	_shaderProgram;
	_gl;
	_vertexCataloguePositionBuffer;
	_indexes;
	_indexBuffer;
	// _vertexSelectionCataloguePositionBuffer;
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

	_ready;
	/**
	 * 
	 * @param {*} columns 
	 * @param {*} geomColumn 
	 * @param {*} nameColumn 
	 * @param {*} tablename 
	 * @param {*} tabledesc 
	 * @param {*} tablesurl 
	 * @param {*} raColumn 
	 * @param {*} decColumn 
	 * @param {TapMetadataList} tapMetadataList 
	 */
	constructor(columns, geomColumn, nameColumn, tablename, tabledesc, tablesurl, raColumn, decColumn, tapMetadataList) {

		this._ready = false;
		this._TYPE = "FOOTPRINT_CATALOGUE";

		FootprintSet.ELEM_SIZE = 3;

		FootprintSet.CONVEXPOLY_ELEM_SIZE = 3;
		FootprintSet.BYTES_X_ELEM = new Float32Array().BYTES_PER_ELEMENT;
		this._columns = columns;
		this._footprints = [];
		this._attribLocations = {};

		this._name = tablename;

		this._tapMetadataList = tapMetadataList;
		this._geomColumn = undefined;
		this._nameColumn = undefined;
		this._raColumn = undefined;
		this._decColumn = undefined;
		this._pgSphereColumn = undefined;
		this.setPositionColumns(tapMetadataList);
		this.setNameColumn(tapMetadataList);


		if (nameColumn === undefined) {
			this._nameColumn = "NAME NOT SET";
		}
		this._colorColumn = undefined;

		this._tableDescription = tabledesc;
		this._tableUrl = tablesurl;




		this._nPrimitiveFlags = 0;
		this._totPoints = 0;

		this._gl = global.gl;
		this._shaderProgram = this._gl.createProgram();

		this._vertexCataloguePositionBuffer = this._gl.createBuffer();
		this._indexBuffer = this._gl.createBuffer();

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


		this._hoveredFootprints = [];
		this._hoveredVertexPositionBuffer = this._gl.createBuffer();
		this._hoveredIndexBuffer = this._gl.createBuffer();
		this._totHoveredPoints = 0;

		this._selectedFootprints = [];
		this._selectedVertexPositionBuffer = this._gl.createBuffer();
		this._selectedIndexBuffer = this._gl.createBuffer();
		this._totSelectedPoints = 0;


		this._shapeColor = "#8F00FF";

		this.initShaders();

	}

	get raColumn() {
		return this._raColumn;
	}

	get decColumn() {
		return this._decColumn;
	}

	get ready() {
		return this._ready;
	}

	/**
	 * @param {Boolean} bool
	 */
	set ready(bool) {
		this._ready = bool;
	}


	/**
	 * 
	 * @param {TapMetadataList} tapMetadataList 
	 */
	setPositionColumns(tapMetadataList) {

		for (let tapMetadata of tapMetadataList.pgSphereMetaColumns) {
			this._pgSphereColumn = tapMetadata;
		}

		for (let tapMetadata of tapMetadataList.sRegionMetaColumns) {

			if (tapMetadata.ucd !== undefined && tapMetadata.ucd.includes("pos.outline;obs.field")) {
				this._geomColumn = tapMetadata;
				break;
			}

			// getting the first one
			if (this._geomColumn === undefined) {
				this._geomColumn = tapMetadata;
			}
		}





		for (let tapMetadata of tapMetadataList._posEqRAMetaColumns) {
			if (tapMetadata.ucd !== undefined && tapMetadata.ucd.includes("meta.main")) {
				this._raColumn = tapMetadata;
				break;
			}

			// getting the first one
			if (this._raColumn === undefined) {
				this._raColumn = tapMetadata;
			}
		}


		for (let tapMetadata of tapMetadataList._posEqDecMetaColumns) {

			if (tapMetadata.ucd !== undefined && tapMetadata.ucd.includes("meta.main")) {
				this._decColumn = tapMetadata;
				break;
			}

			// getting the first one
			if (this._decColumn === undefined) {
				this._decColumn = tapMetadata;
			}
		}
	}

	/**
	 * 
	 * @param {TapMetadataList} tapMetadataList 
	 */
	setNameColumn(tapMetadataList) {
		for (let tapMetadata of tapMetadataList._metadataList) {
			if (tapMetadata.ucd !== undefined && tapMetadata.ucd.includes("meta.id") && tapMetadata.ucd.includes("meta.main")) {

				this._nameColumn = tapMetadata;

			}
		}
	}


	initShaders() {

		var _self = this;
		var gl = this._gl;
		// var shaderProgram = this._shaderProgram;

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
	setUniformLocation() {

		var gl = this._gl;

		this._shaderProgram.pMatrixUniform = gl.getUniformLocation(this._shaderProgram, "uPMatrix");
		this._shaderProgram.mvMatrixUniform = gl.getUniformLocation(this._shaderProgram, "uMVMatrix");

	}


	get name() {
		return this._name;
	}

	get footprints() {
		return this._footprints;
	}

	addFootprint(in_footprint) {
		this._footprints.push(in_footprint);
	}


	/**
	 * 
	 * @param {Array} in_data 
	 * @param {TapMetadataList} columnsmeta : 
	 */
	addFootprints(in_data, columnsmeta) {
		let j,
			footprint;

		this._columns = columnsmeta;

		for (j = 0; j < in_data.length; j++) {

			if (in_data[j][0] !== null) {
				// footprint = new Footprint(in_data[j][0], in_data[j]);
				footprint = new Footprint(in_data[j][this._geomColumn._index], in_data[j]);
				this.addFootprint(footprint);
				this._totPoints += footprint.totPoints;
				this._totConvexPoints += footprint.totConvexPoints;
			}
		}

		this.initBuffer();

		this._ready = true;
	}


	// TODO Change the above. It should be computed at runtime
	/**
	 * 
	 * @param {*} datasetName 
	 * @deprecated
	 */
	footprintsClockwiseOrder(datasetName) {

		let isCloclWise = GeomUtils.isPolyClockwise(this._footprints[0]._polygons[0]);
		this._footprintsPointsOrder = isCloclWise;

		// let order = 1; // clockwise order
		// if(datasetName == 'observations.mv_akari_irc_fdw' || datasetName == 'observations.mv_v_v_hsa_esasky_photo_fdw_fdw' || 'observations.mv_v_v_hsa_esasky_spectra_fdw_fdw'){
		// 	order = -1;
		// }
		// return order;
	}

	clearFootprints() {

		this._footprints = [];
		this._indexes = [];
		this._vertexCataloguePosition = [];
		this._totPoints = 0;


		this._hoveredFootprints = [];
		this._hoveredIndex = [];
		this._hoveredVertexPosition = [];
		this._totHoveredPoints = 0;

		this._selectedFootprints = [];
		this._selectedIndex = [];
		this._selectedVertexPosition = [];
		this._totsSelectedPoints = 0;

		// this._convexIndexes = [];
		// this._vertexConvexPolyPosition = [];
		// this._totConvexPoints = 0;


	}



	updateColumnMappingByName(geomColName, nameColName, color, hue) {

		let refreshQueryByFov = false;
		if (this._geomColumn._name != geomColName) {
			for (let column of this._columns) {
				if (column._name == geomColName) {
					this._geomColumn = column;
				}
			}
			refreshQueryByFov = true;
		}

		if (this._nameColumn === undefined || this._nameColumn._name != nameColName) {
			for (let column of this._columns) {
				if (column._name == nameColName) {
					this._nameColumn = column;
					break;
				}
			}
		}
		this._shapeColor = color;
		this._hue = hue;

		return refreshQueryByFov;

	}

	initBuffer() {


		let nFootprints = this._footprints.length;

		let npolygons = nFootprints - 1;
		for (let j = 0; j < nFootprints; j++) {
			npolygons += this._footprints[j].polygons.length - 1; // TODO ,-- compute number of subpolygons in the Footprint2.js constructor
		}

		// this._indexes = new Uint16Array(this._totPoints + npolygons + 1);
		// let MAX_UNSIGNED_SHORT = 65535; // this is used to enable and disable GL_PRIMITIVE_RESTART_FIXED_INDEX

		this._indexes = new Uint32Array(this._totPoints + npolygons + 1);
		let MAX_UNSIGNED_SHORT = 0xFFFFFFFF; // this is used to enable and disable GL_PRIMITIVE_RESTART_FIXED_INDEX
		// let MAX_UNSIGNED_SHORT = 2147483647;
		// let MAX_UNSIGNED_SHORT = Number.MAX_SAFE_INTEGER;

		let gl = this._gl;

		gl.bindBuffer(gl.ARRAY_BUFFER, this._vertexCataloguePositionBuffer);

		// this._vertexCataloguePosition = new Float32Array( 3 * this._totPoints);
		this._vertexCataloguePosition = new Float32Array(3 * this._totPoints);
		let positionIndex = 0;
		let vIdx = 0;

		let R = 1.0;
		this._nPrimitiveFlags = 0;

		var footprintsInPix256 = this._footprintsInPix256;
		for (let j = 0; j < nFootprints; j++) {

			let footprint = this._footprints[j];
			let footprintPoly = this._footprints[j].polygons;
			var identifier = this._footprints[j].identifier;


			if (global.healpix4footprints) {
				this._footprints[j].pixels.forEach(function (pix) {

					if (footprintsInPix256.has(pix)) {

						let currFootprints = footprintsInPix256.get(pix);
						if (!currFootprints.includes(identifier)) {
							currFootprints.push(footprint);
						}

					} else {
						footprintsInPix256.set(pix, [footprint]);
					}
				});
			}
			if (j > 0) {
				this._indexes[vIdx] = MAX_UNSIGNED_SHORT;
				this._nPrimitiveFlags += 1;
				vIdx += 1;
			}
			for (let polyIdx in footprintPoly) {
				// 
				if (polyIdx > 0) {
					this._indexes[vIdx] = MAX_UNSIGNED_SHORT;
					this._nPrimitiveFlags += 1;
					vIdx += 1;
				}
				for (let pointIdx in footprintPoly[polyIdx]) {
					this._vertexCataloguePosition[positionIndex] = R * footprintPoly[polyIdx][pointIdx].x;
					this._vertexCataloguePosition[positionIndex + 1] = R * footprintPoly[polyIdx][pointIdx].y;
					this._vertexCataloguePosition[positionIndex + 2] = R * footprintPoly[polyIdx][pointIdx].z;


					this._indexes[vIdx] = Math.floor(positionIndex / 3);



					vIdx += 1;
					positionIndex += 3;

				}

				// this._indexes[vIdx] = MAX_UNSIGNED_SHORT;
				// vIdx += 1;

			}

		}
		this._indexes[this._indexes.length - 1] = MAX_UNSIGNED_SHORT;
		// this._indexes.splice(this._indexes - 1, 1);

		this._footprintsInPix256 = footprintsInPix256;
		console.log("Buffer initialized");

		// if (this.showConvexPolygons){
		// this.initConvexPolyBuffer();
		// }

		// glEnable ( GL_PRIMITIVE_RESTART_FIXED_INDEX ); // 65535

	}



	initConvexPolyBuffer() {
		let nFootprints = this._footprints.length;

		this._convexIndexes = new Uint16Array(this._totConvexPoints + nFootprints);
		//		this._indexes = [];

		let MAX_UNSIGNED_SHORT = 65535; // this is used to enable and disable
		// GL_PRIMITIVE_RESTART_FIXED_INDEX

		let gl = this._gl;

		gl.bindBuffer(gl.ARRAY_BUFFER, this._vertexConvexPolyPositionBuffer);

		this._vertexConvexPolyPosition = new Float32Array(3 * this._totConvexPoints);
		let positionIndex = 0;
		let vIdx = 0;

		let R = 1.0;

		for (let j = 0; j < nFootprints; j++) {

			let footprintPoly = this._footprints[j].convexPolygons;

			for (let polyIdx in footprintPoly) {
				for (let pointIdx in footprintPoly[polyIdx]) {
					this._vertexConvexPolyPosition[positionIndex] = R * footprintPoly[polyIdx][pointIdx].x;
					this._vertexConvexPolyPosition[positionIndex + 1] = R * footprintPoly[polyIdx][pointIdx].y;
					this._vertexConvexPolyPosition[positionIndex + 2] = R * footprintPoly[polyIdx][pointIdx].z;

					this._convexIndexes[vIdx] = Math.floor(positionIndex / 3);

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
	checkSelection(in_mouseHelper) {

		let mousePix = in_mouseHelper.computeNpix256();
		if (mousePix !== null) {
			this._hoveredFootprints = [];
			this._totHoveredPoints = 0;
			let mousePoint = new Point({ x: in_mouseHelper.x, y: in_mouseHelper.y, z: in_mouseHelper.z }, CoordsType.CARTESIAN);

			if (mousePix != null) {
				if (global.healpix4footprints) {
					if (this._footprintsInPix256.has(mousePix)) {
						// console.log("mouse pixel (n=8): "+mousePix+ "
						// "+this._footprintsInPix256.get(mousePix).length+" possible x-matches");

						for (let i = 0; i < this._footprintsInPix256.get(mousePix).length; i++) {

							let footprint = this._footprintsInPix256.get(mousePix)[i];
							// console.log(footprint.identifier+" pixels (n=8): "+ footprint.pixels ) ;

							if (GeomUtils.pointInsidePolygons2(footprint.convexPolygons, mousePoint)) {
								console.log("INSIDE " + footprint.identifier + " pixel " + mousePix);
							}

						}

					}

				} else {

					for (let i = 0; i < this._footprints.length; i++) {

						let footprint = this._footprints[i];

						if (GeomUtils.checkPointInsidePolygon5(footprint._selectionObj, mousePoint)) {

							let details = [...footprint._details]
							details.splice(this._geomColumn._index, 1);
							this._hoveredFootprints.push(footprint);
							this._totHoveredPoints += footprint.totPoints;
						}

					}
					// if (this._hoveredFootprints.length > 0) {
						this.initHoveringBuffer();

					// }

				}
			}
		}
		session.updateHoveredFootprints(this, this._hoveredFootprints);
	}

	highlightFootprint(footprint, highlighted) {
		if (highlighted) {
			this._hoveredFootprints.push(footprint);
			this._totHoveredPoints += footprint.totPoints;
		} else {
			const indexOfFootprint = this._hoveredFootprints.indexOf(footprint)
			this._hoveredFootprints.splice(indexOfFootprint, 1)
			this._totHoveredPoints -= footprint.totPoints;
		}
		this.initHoveringBuffer();
		session.updateHoveredFootprints(this, this._hoveredFootprints);

	}

	/**
	 * 
	 * @param {Footprint[]} footprints
	 */

	addFootprint2Selected(footprints) {
		let refreshBuffer = false;
		for (let f of footprints) {
			if (!this._selectedFootprints.includes(f)) {
				this._selectedFootprints.push(f);
				this._totSelectedPoints += f.totPoints;
				refreshBuffer = true;
			}
		}
		if (refreshBuffer) {
			this.initSelectionBuffer();
		}
	}

	/**
	 * 
	 * @param {Footprint} footprint 
	 */
	removeFootprintFromSelection(footprint) {
		const indexOfObject = this._selectedFootprints.indexOf(footprint)
		if (indexOfObject >= 0) {

			this._selectedFootprints.splice(indexOfObject, 1);
			this._totSelectedPoints -= footprint.totPoints;
			if (this._selectedFootprints.length > 0) {
				this.initSelectionBuffer();
			}

		}

		// const h = this._hoveredFootprints.indexOf(footprint)
		// const f = this._footprints.indexOf(footprint)
		// console.log(f)

	}

	initHoveringBuffer() {

		/*
		TODO better approach. when creating the indexbuffer of footprints, 
		add 1 extra position for the selection (set to 0 == not selected), 
		and save the position "positionIndex" in an array (selectionIndexes).
		When checking the selection, I get the index of the footprint, which
		matches with the index in the selectionIndexes to retrieve the position 
		of the flag to be set to 1 in the vertexposition
		This will ease checking the selection in the vertex/fragment shader and
		set the pointsize and shape color.
		*/

		if (this._hoveredFootprints.length == 0) {
			return
		}
		let nFootprints = this._hoveredFootprints.length;

		let npolygons = nFootprints - 1;
		for (let j = 0; j < nFootprints; j++) {
			npolygons += this._hoveredFootprints[j].polygons.length - 1;
		}
		// this._selectedIndex = new Uint16Array(this._totSelectedPoints + npolygons);
		// let MAX_UNSIGNED_SHORT = 65535; // this is used to enable and disable GL_PRIMITIVE_RESTART_FIXED_INDEX

		this._hoveredIndex = new Uint32Array(this._totHoveredPoints + npolygons);
		let MAX_UNSIGNED_SHORT = 0xFFFFFFFF; // this is used to enable and disable GL_PRIMITIVE_RESTART_FIXED_INDEX
		// let MAX_UNSIGNED_SHORT = Number.MAX_SAFE_INTEGER;

		let gl = this._gl;

		gl.bindBuffer(gl.ARRAY_BUFFER, this._hoveredVertexPositionBuffer);

		this._hoveredVertexPosition = new Float32Array(3 * this._totHoveredPoints);
		let positionIndex = 0;
		let vIdx = 0;

		let R = 1.0;
		this._nHoveredPrimitiveFlags = 0;

		for (let j = 0; j < nFootprints; j++) {

			let footprintPoly = this._hoveredFootprints[j].polygons;

			if (j > 0) {
				this._hoveredIndex[vIdx] = MAX_UNSIGNED_SHORT;
				this._nHoveredPrimitiveFlags += 1;
				vIdx += 1;
			}

			for (let polyIdx in footprintPoly) {
				if (polyIdx > 0) {
					this._hoveredIndex[vIdx] = MAX_UNSIGNED_SHORT;
					this._nHoveredPrimitiveFlags += 1;
					vIdx += 1;
				}
				for (let pointIdx in footprintPoly[polyIdx]) {

					this._hoveredVertexPosition[positionIndex] = R * footprintPoly[polyIdx][pointIdx].x;
					this._hoveredVertexPosition[positionIndex + 1] = R * footprintPoly[polyIdx][pointIdx].y;
					this._hoveredVertexPosition[positionIndex + 2] = R * footprintPoly[polyIdx][pointIdx].z;

					this._hoveredIndex[vIdx] = Math.floor(positionIndex / 3);

					vIdx += 1;
					positionIndex += 3;

				}


			}
		}



	}

	initSelectionBuffer() {

		/*
		TODO better approach. when creating the indexbuffer of footprints, 
		add 1 extra position for the selection (set to 0 == not selected), 
		and save the position "positionIndex" in an array (selectionIndexes).
		When checking the selection, I get the index of the footprint, which
		matches with the index in the selectionIndexes to retrieve the position 
		of the flag to be set to 1 in the vertexposition
		This will ease checking the selection in the vertex/fragment shader and
		set the pointsize and shape color.
		*/


		let nFootprints = this._selectedFootprints.length;

		let npolygons = nFootprints - 1;
		for (let j = 0; j < nFootprints; j++) {
			npolygons += this._selectedFootprints[j].polygons.length - 1;
		}
		// this._selectedIndex = new Uint16Array(this._totSelectedPoints + npolygons);
		// let MAX_UNSIGNED_SHORT = 65535; // this is used to enable and disable GL_PRIMITIVE_RESTART_FIXED_INDEX

		this._selectedIndex = new Uint32Array(this._totSelectedPoints + npolygons);
		let MAX_UNSIGNED_SHORT = 0xFFFFFFFF; // this is used to enable and disable GL_PRIMITIVE_RESTART_FIXED_INDEX
		// let MAX_UNSIGNED_SHORT = Number.MAX_SAFE_INTEGER;

		let gl = this._gl;

		gl.bindBuffer(gl.ARRAY_BUFFER, this._selectedVertexPositionBuffer);

		this._selectedVertexPosition = new Float32Array(3 * this._totSelectedPoints);
		let positionIndex = 0;
		let vIdx = 0;

		let R = 1.0;
		this._nSlectedPrimitiveFlags = 0;

		for (let j = 0; j < nFootprints; j++) {

			let footprintPoly = this._selectedFootprints[j].polygons;

			if (j > 0) {
				this._selectedIndex[vIdx] = MAX_UNSIGNED_SHORT;
				this._nSlectedPrimitiveFlags += 1;
				vIdx += 1;
			}
			for (let polyIdx in footprintPoly) {
				if (polyIdx > 0) {
					this._selectedIndex[vIdx] = MAX_UNSIGNED_SHORT;
					this._nSlectedPrimitiveFlags += 1;
					vIdx += 1;
				}
				for (let pointIdx in footprintPoly[polyIdx]) {

					this._selectedVertexPosition[positionIndex] = R * footprintPoly[polyIdx][pointIdx].x;
					this._selectedVertexPosition[positionIndex + 1] = R * footprintPoly[polyIdx][pointIdx].y;
					this._selectedVertexPosition[positionIndex + 2] = R * footprintPoly[polyIdx][pointIdx].z;

					this._selectedIndex[vIdx] = Math.floor(positionIndex / 3);

					vIdx += 1;
					positionIndex += 3;

				}


			}
		}



	}

	enableShader(in_mMatrix) {

		global.gl.useProgram(this._shaderProgram);
		this._shaderProgram.catUniformMVMatrixLoc = this._gl.getUniformLocation(this._shaderProgram, "uMVMatrix");
		this._shaderProgram.catUniformProjMatrixLoc = this._gl.getUniformLocation(this._shaderProgram, "uPMatrix");
		this._shaderProgram.pointsize = this._gl.getUniformLocation(this._shaderProgram, "u_pointsize");



		this._attribLocations.position = this._gl.getAttribLocation(this._shaderProgram, 'aCatPosition');

		this._attribLocations.color = this._gl.getUniformLocation(this._shaderProgram, 'u_fragcolor');


		var mvMatrix = mat4.create();
		mvMatrix = mat4.multiply(mvMatrix, global.camera.getCameraMatrix(), in_mMatrix);
		this._gl.uniformMatrix4fv(this._shaderProgram.catUniformMVMatrixLoc, false, mvMatrix);
		this._gl.uniformMatrix4fv(this._shaderProgram.catUniformProjMatrixLoc, false, global.pMatrix);
		this._gl.uniform1f(this._shaderProgram.pointsize, 14.0);
	}

	/**
	 * @param in_Matrix:
	 *            model matrix the current catalogue is associated to (e.g. HiPS
	 *            matrix)
	 */
	draw(in_mMatrix, in_mouseHelper) {

		this.enableShader(in_mMatrix);



		// MOUSE selection
		if (in_mouseHelper != null && in_mouseHelper.xyz != this._oldMouseCoords) {

			this.checkSelection(in_mouseHelper);

		}
		if (this._hoveredFootprints.length > 0) {

			// TODO POINT_SIZE doesn't have any effect on line thickness!! it only applies to points
			let rgb = colorHex2RGB("#00FF00");
			let alpha = 1.0;
			rgb[3] = alpha;
			this._gl.uniform4f(this._attribLocations.color, rgb[0], rgb[1], rgb[2], rgb[3]);
			this._gl.uniform1f(this._shaderProgram.pointsize, 14.0);	// <--- POINT_SIZE in LINE_LOOP is not applicable

			this._gl.bindBuffer(this._gl.ARRAY_BUFFER, this._hoveredVertexPositionBuffer);
			this._gl.bufferData(this._gl.ARRAY_BUFFER, this._hoveredVertexPosition, this._gl.STATIC_DRAW);

			// setting footprint position
			this._gl.vertexAttribPointer(this._attribLocations.position, FootprintSet.ELEM_SIZE, this._gl.FLOAT, false, FootprintSet.BYTES_X_ELEM * FootprintSet.ELEM_SIZE, 0);
			this._gl.enableVertexAttribArray(this._attribLocations.position);

			this._gl.bindBuffer(this._gl.ELEMENT_ARRAY_BUFFER, this._hoveredIndexBuffer);
			this._gl.bufferData(this._gl.ELEMENT_ARRAY_BUFFER, this._hoveredIndex, this._gl.STATIC_DRAW);

			// this._gl.drawElements (this._gl.LINE_LOOP, this._selectedVertexPosition.length / 3 + this._nSlectedPrimitiveFlags,this._gl.UNSIGNED_SHORT, 0);
			this._gl.drawElements(this._gl.LINE_LOOP, this._hoveredVertexPosition.length / 3 + this._nHoveredPrimitiveFlags, this._gl.UNSIGNED_INT, 0);
		}

		if (this._selectedFootprints.length > 0) {


			let rgb = colorHex2RGB("#ECB462");
			let alpha = 1.0;
			rgb[3] = alpha;
			this._gl.uniform4f(this._attribLocations.color, rgb[0], rgb[1], rgb[2], rgb[3]);
			this._gl.uniform1f(this._shaderProgram.pointsize, 14.0);	// <--- POINT_SIZE in LINE_LOOP is not applicable

			this._gl.bindBuffer(this._gl.ARRAY_BUFFER, this._selectedVertexPositionBuffer);
			this._gl.bufferData(this._gl.ARRAY_BUFFER, this._selectedVertexPosition, this._gl.STATIC_DRAW);

			// setting footprint position
			this._gl.vertexAttribPointer(this._attribLocations.position, FootprintSet.ELEM_SIZE, this._gl.FLOAT, false, FootprintSet.BYTES_X_ELEM * FootprintSet.ELEM_SIZE, 0);
			this._gl.enableVertexAttribArray(this._attribLocations.position);

			this._gl.bindBuffer(this._gl.ELEMENT_ARRAY_BUFFER, this._selectedIndexBuffer);
			this._gl.bufferData(this._gl.ELEMENT_ARRAY_BUFFER, this._selectedIndex, this._gl.STATIC_DRAW);

			// this._gl.drawElements (this._gl.LINE_LOOP, this._selectedVertexPosition.length / 3 + this._nSlectedPrimitiveFlags,this._gl.UNSIGNED_SHORT, 0);
			this._gl.drawElements(this._gl.LINE_LOOP, this._selectedVertexPosition.length / 3 + this._nSlectedPrimitiveFlags, this._gl.UNSIGNED_INT, 0);

		}

		// TODO move this out of the draw method <- ?
		this._gl.bindBuffer(this._gl.ARRAY_BUFFER, this._vertexCataloguePositionBuffer);
		this._gl.bufferData(this._gl.ARRAY_BUFFER, this._vertexCataloguePosition, this._gl.STATIC_DRAW);

		// setting footprint position
		this._gl.vertexAttribPointer(this._attribLocations.position, FootprintSet.ELEM_SIZE, this._gl.FLOAT, false, FootprintSet.BYTES_X_ELEM * FootprintSet.ELEM_SIZE, 0);
		this._gl.enableVertexAttribArray(this._attribLocations.position);

		this._gl.bindBuffer(this._gl.ELEMENT_ARRAY_BUFFER, this._indexBuffer);
		this._gl.bufferData(this._gl.ELEMENT_ARRAY_BUFFER, this._indexes, this._gl.STATIC_DRAW);

		// setting footprint shape color
		var rgb = colorHex2RGB(this._shapeColor);
		var alpha = 1.0;
		rgb[3] = alpha;
		this._gl.uniform4f(this._attribLocations.color, rgb[0], rgb[1], rgb[2], rgb[3]);

		this._gl.uniform1f(this._shaderProgram.pointsize, 4.0);
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
		var ext = this._gl.getExtension('OES_element_index_uint');
		this._gl.drawElements(this._gl.LINE_LOOP, this._vertexCataloguePosition.length / 3 + this._nPrimitiveFlags, this._gl.UNSIGNED_INT, 0);
		// this._gl.drawElements (this._gl.LINE_LOOP, this._vertexCataloguePosition.length / 3 + this._nPrimitiveFlags,this._gl.UNSIGNED_SHORT, 0);
		if (global.showPointsInPolygons) {
			// this._gl.drawElements (this._gl.POINT, this._vertexCataloguePosition.length / 3 + 1,this._gl.UNSIGNED_SHORT, 0);
			this._gl.drawElements(this._gl.POINT, this._vertexCataloguePosition.length / 3 + 1, this._gl.UNSIGNED_SHORT, 0);
			//		this._gl.drawElements (this._gl.POINT, 1,this._gl.UNSIGNED_SHORT, 0);
		}








		// if (global.showConvexPolygons){

		// 	rgb = colorHex2RGB(this._shapeColor);
		// 	var alpha = 0.3;
		// 	rgb[3] = alpha;
		// 	this._gl.uniform4f(this._attribLocations.color, 1., 0., 0., rgb[3]);

		// 	this._gl.bindBuffer(this._gl.ARRAY_BUFFER, this._vertexConvexPolyPositionBuffer);
		// 	this._gl.bufferData(this._gl.ARRAY_BUFFER, this._vertexConvexPolyPosition, this._gl.STATIC_DRAW);
		// 	this._gl.vertexAttribPointer(this._attribLocations.position, FootprintSet.CONVEXPOLY_ELEM_SIZE, this._gl.FLOAT, false, FootprintSet.BYTES_X_ELEM * FootprintSet.CONVEXPOLY_ELEM_SIZE, 0);
		// 	this._gl.enableVertexAttribArray(this._attribLocations.position);			
		// 	this._gl.bindBuffer(this._gl.ELEMENT_ARRAY_BUFFER, this._convexIndexBuffer);
		// 	this._gl.bufferData(this._gl.ELEMENT_ARRAY_BUFFER, this._convexIndexes, this._gl.STATIC_DRAW);
		// 	this._gl.drawElements (this._gl.LINE_LOOP, this._vertexConvexPolyPosition.length / 3 + 1,this._gl.UNSIGNED_SHORT, 0);

		// }



		this._gl.bindBuffer(this._gl.ARRAY_BUFFER, null);
		this._gl.bindBuffer(this._gl.ELEMENT_ARRAY_BUFFER, null);
		this._oldMouseCoords = in_mouseHelper.xyz;

	}


}


export default FootprintSet;