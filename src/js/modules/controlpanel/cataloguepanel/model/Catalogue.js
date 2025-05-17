"use strict";
/**
 * @author Fabrizio Giordano (Fab77)
 */
import { colorHex2RGB } from '../../../../utils/Utils.js';
import { mat4 } from 'gl-matrix';
import global from '../../../../Global.js';
import Point from '../../../../utils/Point.js';
import CoordsType from '../../../../utils/CoordsType.js';
import Source from './Source.js';
import { shaderUtility } from '../../../../utils/ShaderUtility.js';
import TapMetadataList from '../../../../repos/tap/TapMetadataList.js';

import { session } from '../../../../utils/Session.js';
import { newVisibleTilesManager } from '../../../../model/hipsnew/VisibleTilesManager.js';

class Catalogue {

	static ELEM_SIZE;
	static BYTES_X_ELEM;
	_TYPE;
	_name;
	_shaderProgram;
	_gl;
	_vertexCataloguePositionBuffer;
	_vertexhoveredCataloguePositionBuffer;
	_sources;
	_oldMouseCoords;
	_vertexCataloguePosition;
	_attribLocations;
	_hoveredIndexes;
	_descriptor;
	_healpixDensityMap;

	_ready;


	/**
	 * 
	 * @param {Column[]} columns 
	 * @param {Column} raColumn 
	 * @param {Column} decColumn 
	 * @param {Column} nameColumn 
	 * @param {*} tablename 
	 * @param {*} tabledesc 
	 * @param {*} tablesurl 
	 * @param {TapMetadataList} tapMetadataList 
	 */
	constructor(columns, raColumn, decColumn, nameColumn, tablename, tabledesc, tablesurl, tapMetadataList) {
		// constructor(in_name, in_metadata, in_raIdx, in_decIdx, in_nameIdx, in_descriptor){

		this._ready = false;
		this._TYPE = "SOURCE_CATALOGUE";
		Catalogue.ELEM_SIZE = 6;
		Catalogue.BYTES_X_ELEM = new Float32Array().BYTES_PER_ELEMENT;
		this._columns = columns;
		this._sources = [];
		this._attribLocations = {};

		this._name = tablename;


		this._tapMetadataList = tapMetadataList;
		this._raColumn = undefined;
		this._decColumn = undefined;
		this._nameColumn = undefined;
		this.setPositionColumns(tapMetadataList);
		this.setNameColumn(tapMetadataList);

		this._shapeColumn = undefined;
		this._colorColumn = undefined;

		this._tableDescription = tabledesc;
		this._tableUrl = tablesurl;

		this._gl = global.gl;
		this._shaderProgram = this._gl.createProgram();
		this._vertexCataloguePositionBuffer = this._gl.createBuffer();
		this._vertexhoveredCataloguePositionBuffer = this._gl.createBuffer();

		this._vertexCataloguePosition = [];

		this._hoveredIndexes = [];
		this._selectedIndexes = [];
		this._extHoveredIndexes = [];

		this._oldMouseCoords = null;

		this._attribLocations = {
			position: 0,
			selected: 1,
			pointSize: 2,
			color: [0.0, 1.0, 0.0, 1.0],
			brightness: 3
		};

		this._healpixDensityMap = new Map();
		this._shapeColor = "#8F00FF";

		this.initShaders();

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
		for (let tapMetadata of tapMetadataList._posEqRAMetaColumns) {
			if (tapMetadata.ucd !== undefined && tapMetadata.ucd.includes("pos.eq.ra")) {

				if (tapMetadata.ucd.includes("meta.main")) {
					this._raColumn = tapMetadata;
					break;
				}

				// getting the first one
				if (this._raColumn === undefined) {
					this._raColumn = tapMetadata;
				}
			}
		}


		for (let tapMetadata of tapMetadataList._posEqDecMetaColumns) {

			if (tapMetadata.ucd !== undefined && tapMetadata.ucd.includes("pos.eq.dec")) {

				if (tapMetadata.ucd.includes("meta.main")) {
					this._decColumn = tapMetadata;
					break;
				}

				// getting the first one
				if (this._decColumn === undefined) {
					this._decColumn = tapMetadata;
				}
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

		var gl = this._gl;
		var shaderProgram = this._shaderProgram;

		var fragmentShader = this.loadShaderFromDOM("cat-shader-fs");
		var vertexShader = this.loadShaderFromDOM("cat-shader-vs");

		gl.attachShader(shaderProgram, vertexShader);
		gl.attachShader(shaderProgram, fragmentShader);
		gl.linkProgram(shaderProgram);

		if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
			alert("Could not initialise shaders");
		}

		shaderUtility.useProgram(shaderProgram);


	}


	loadShaderFromDOM(shaderId) {
		var gl = this._gl;

		var shaderScript = document.getElementById(shaderId);

		if (!shaderScript) {
			return null;
		}

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


	get name() {
		return this._name;
	}

	get sources() {
		return this._sources;
	}

	addSource(in_source) {
		this._sources.push(in_source);
	}

	/**
	 * 
	 * @param {Array.Array<Object>} in_data 
	 * @param {TapMetadataList} columnsmeta 
	 */
	addSources(in_data, columnsmeta) {
		var j,
			point,
			source;

		// TODO columnsmeta ??? pass it to each source object or handle it in Catalogue2?
		this._columns = columnsmeta;

		let idRa = this._raColumn.index;
		for (let cid = 0; cid < columnsmeta._posEqRAMetaColumns; cid++) {
			let currCol = columnsmeta._posEqRAMetaColumns[cid];
			if (currCol._name == this._raColumn._name) {
				this._raColumn = currCol;
				break;
			}
		}

		for (let cid = 0; cid < columnsmeta._posEqDecMetaColumns; cid++) {
			let currCol = columnsmeta._posEqDecMetaColumns[cid];
			if (currCol._name == this._decColumn._name) {
				this._decColumn = currCol;
				break;
			}
		}

		for (j = 0; j < in_data.length; j++) {

			point = new Point({
				"raDeg": in_data[j][this._raColumn.index],
				"decDeg": in_data[j][this._decColumn.index]
			}, CoordsType.ASTRO);
			source = new Source(point, in_data[j]);

			this.addSource(source);
		}
		this.initBuffer();
		this._ready = true;
	}

	clearSources() {
		this._sources = [];
		this._hoveredIndexes = [];
	}



	extHighlightSource(source, highlighted) {
		const sIdx = this._sources.indexOf(source)
		if (highlighted) {
			if (! (this._extHoveredIndexes.indexOf(sIdx) > 0)){
				this._extHoveredIndexes.push(sIdx);
			}
		} else {
			const indexOfSourceHovered = this._extHoveredIndexes.indexOf(sIdx)
			this._extHoveredIndexes.splice(indexOfSourceHovered, 1)
		}
		let hoveredSources = []
		for (let hidx of this._extHoveredIndexes) {
			hoveredSources.push(this._sources[hidx])
		}
		session.updateHoveredSources(this, hoveredSources);
	}

/**
 * 
 * @param {Source[]} sources 
 */
	extAddSources2Selected(sources) {
		for (let s of sources) {
			const sIdx = this._sources.indexOf(s)
			if (sIdx > 0 && !this._selectedIndexes.includes(sIdx)) {
				this._selectedIndexes.push(sIdx);
			}
		}

	}

	/**
	 * 
	 * @param {Source} source
	 */
	extRemoveSourceFromSelection(source) {
		const indexOfObject = this._sources.indexOf(source)
		if (indexOfObject >= 0) {
			const sidx = this._selectedIndexes.indexOf(indexOfObject)
			this._selectedIndexes.splice(sidx, 1);
			const eidx = this._extHoveredIndexes.indexOf(indexOfObject)
			this._extHoveredIndexes.splice(eidx, 1);
			this._vertexCataloguePosition[(indexOfObject * Catalogue.ELEM_SIZE) + 3] = 0.0; // not hovered
		}
	}




	updateColumnMappingByName(raColName, decColName, nameColName, sizeColName, color, hueColName) {
		this._shapeColor = color;
		let refreshQueryByFov = false;
		if (this._raColumn._name != raColName || this._decColumn._name != decColName) {
			// change ra mapping
			for (let column of this._columns) {
				if (column._name == raColName) {
					this._raColumn = column;
				}
				if (column._name == decColName) {
					this._decColumn = column;
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

		if (sizeColName != "--") {
			if (this._shapeColumn === undefined || this._shapeColumn._name != sizeColName) {
				for (let column of this._columns) {
					if (column._name == sizeColName) {
						this._shapeColumn = column;
						break;
					}
				}

				let minmax = this.minMax(this._shapeColumn._index);
				for (let source of this._sources) {

					let normsize = ((source._details[this._shapeColumn._index] - minmax.min) / (minmax.max - minmax.min)) * (20 - 8) + 8;
					source.shapeSize = normsize;
				}
				this.initBuffer();

			}
		}

		if (hueColName != "--") {
			if (this._colorColumn === undefined || this._colorColumn._name != hueColName) {
				for (let column of this._columns) {
					if (column._name == hueColName) {
						this._colorColumn = column;
						break;
					}
				}
			}

			let minmax = this.minMax(this._colorColumn._index);
			for (let source of this._sources) {

				let normsize = - (((source._details[this._colorColumn._index] - minmax.min) / (minmax.max - minmax.min)) * 2 - 1);
				source.brightnessFactor = normsize;
			}
			this.initBuffer();
		}
		return refreshQueryByFov;

	}

	minMax(columnindex) {
		let min = this._sources[0]._details[columnindex];
		let max = min;

		for (let source of this._sources) {
			if (source._details[columnindex] < min) {
				min = source._details[columnindex];
			}
			if (source._details[columnindex] > max) {
				max = source._details[columnindex];
			}
		}
		return {
			"min": min,
			"max": max
		}
	}

	initBuffer() {

		var gl = this._gl;

		var sources = this._sources;

		gl.bindBuffer(gl.ARRAY_BUFFER, this._vertexCataloguePositionBuffer);
		var nSources = sources.length;

		this._vertexCataloguePosition = new Float32Array(nSources * Catalogue.ELEM_SIZE);
		var positionIndex = 0;

		// max num of decimal places is 17
		let R = 1.0000000000000000;

		for (var j = 0; j < nSources; j++) {


			let currSource = sources[j];
			let currPix = currSource.healpixPixel;

			if (this._healpixDensityMap.has(currPix)) {
				let sourceList = this._healpixDensityMap.get(currPix);

				if (!sourceList.includes(j)) {
					sourceList.push(j);
				}
			} else {
				this._healpixDensityMap.set(currPix, [j]);
			}

			// source position on index 0, 1, 2
			this._vertexCataloguePosition[positionIndex] = currSource.point.x;
			this._vertexCataloguePosition[positionIndex + 1] = currSource.point.y;
			this._vertexCataloguePosition[positionIndex + 2] = currSource.point.z;

			// source hovered (0 = not hovered or 1 = hovered) on index 3
			this._vertexCataloguePosition[positionIndex + 3] = 0.0;

			// source size (not used for the moment) on index 4
			// this._vertexCataloguePosition[positionIndex+4] = 8.0;
			this._vertexCataloguePosition[positionIndex + 4] = this._sources[j].shapeSize;

			this._vertexCataloguePosition[positionIndex + 5] = this._sources[j].brightnessFactor;

			positionIndex += Catalogue.ELEM_SIZE;

		}
		this._gl.bufferData(this._gl.ARRAY_BUFFER, this._vertexCataloguePosition, this._gl.STATIC_DRAW);


		/* 
		 * check https://stackoverflow.com/questions/27714014/3d-point-on-circumference-of-a-circle-with-a-center-radius-and-normal-vector
		 * for a strategy to create circle on the surface of the sphere instead of creating the circle-point in the fragment shader. This 
		 * should solve the issue of having the circles always parallel to the screen
		 */

		/*
		 * https://webglfundamentals.org/webgl/lessons/webgl-instanced-drawing.html
		 */

	}



	getSelectionRadius(){
		const order = newVisibleTilesManager.getVisibleOrder()
		switch (order){
			case 0:
			case 1:
			case 2:
				return 0.005
			case 3:
				return 0.001
			case 4:
				return 0.0009
			case 5:
				return 0.0005
			case 6:
				return 0.0001
			case 7:
				return 0.00009
			case 8:
				return 0.00005
			case 9:
				return 0.00001
			default:
				return 0.000005
		}
	}

	checkSelection(in_mouseHelper) {

		let hoveredIndexes = [];
		let sourcesHovered = [];
		let mousePix = in_mouseHelper.computeNpix256();

		if (mousePix != null) {

			// let mousePoint = new Point({ x: in_mouseHelper.x, y: in_mouseHelper.y, z: in_mouseHelper.z }, CoordsType.CARTESIAN);

			if (this._healpixDensityMap.has(mousePix)) {

				for (let i = 0; i < this._healpixDensityMap.get(mousePix).length; i++) {

					let sourceIdx = this._healpixDensityMap.get(mousePix)[i];
					let source = this.sources[sourceIdx];

					// let mouseCoords = in_mouseHelper.xyz;

					if (source === undefined){
						// console.log(`Source undefined ${i} ${this.sources}`)
						// console.log(this.sources)
						continue;
					}
					let dist = Math.sqrt((source.point.x - in_mouseHelper.x) * (source.point.x - in_mouseHelper.x) + (source.point.y - in_mouseHelper.y) * (source.point.y - in_mouseHelper.y) + (source.point.z - in_mouseHelper.z) * (source.point.z - in_mouseHelper.z));
					// if (dist <= 0.01) {
					const selectionRadius = this.getSelectionRadius();
					if (dist <= selectionRadius) {

						hoveredIndexes.push(sourceIdx);
						sourcesHovered.push(source)

					} 
					// else {
					// 	console.log(`dist > ${selectionRadius}`)
					// }

				}

			}
		} else {
			console.log("mousepix is null")
		}
		session.updateHoveredSources(this, sourcesHovered);
		return hoveredIndexes;

	}




	enableShader(in_mMatrix) {

		global.gl.useProgram(this._shaderProgram);
		this._shaderProgram.catUniformMVMatrixLoc = this._gl.getUniformLocation(this._shaderProgram, "uMVMatrix");
		this._shaderProgram.catUniformProjMatrixLoc = this._gl.getUniformLocation(this._shaderProgram, "uPMatrix");

		this._attribLocations.position = this._gl.getAttribLocation(this._shaderProgram, 'aCatPosition');

		this._attribLocations.hovered = this._gl.getAttribLocation(this._shaderProgram, 'a_selected');

		this._attribLocations.pointSize = this._gl.getAttribLocation(this._shaderProgram, 'a_pointsize');

		this._attribLocations.color = this._gl.getUniformLocation(this._shaderProgram, 'u_fragcolor');

		this._attribLocations.brightness = this._gl.getAttribLocation(this._shaderProgram, 'a_brightness');

		var mvMatrix = mat4.create();
		mvMatrix = mat4.multiply(mvMatrix, global.camera.getCameraMatrix(), in_mMatrix);
		this._gl.uniformMatrix4fv(this._shaderProgram.catUniformMVMatrixLoc, false, mvMatrix);
		this._gl.uniformMatrix4fv(this._shaderProgram.catUniformProjMatrixLoc, false, global.pMatrix);

	}

	/**
	 * @param in_Matrix: model matrix the current catalogue is associated to (e.g. HiPS matrix)
	 */
	draw(in_mMatrix, in_mouseHelper) {


		// shaderUtility.useProgram(this._shaderProgram);

		this.enableShader(in_mMatrix);

		this._gl.bindBuffer(this._gl.ARRAY_BUFFER, this._vertexCataloguePositionBuffer);

		// setting source position
		this._gl.vertexAttribPointer(this._attribLocations.position, 3, this._gl.FLOAT, false, Catalogue.BYTES_X_ELEM * Catalogue.ELEM_SIZE, 0);
		this._gl.enableVertexAttribArray(this._attribLocations.position);

		// setting hovered sources
		this._gl.vertexAttribPointer(this._attribLocations.hovered, 1, this._gl.FLOAT, false, Catalogue.BYTES_X_ELEM * Catalogue.ELEM_SIZE, Catalogue.BYTES_X_ELEM * 3);
		this._gl.enableVertexAttribArray(this._attribLocations.hovered);

		// TODO The size can be set with uniform or directly in the shader. setting point size (for variable catalogue)
		this._gl.vertexAttribPointer(this._attribLocations.pointSize, 1, this._gl.FLOAT, false, Catalogue.BYTES_X_ELEM * Catalogue.ELEM_SIZE, Catalogue.BYTES_X_ELEM * 4);
		this._gl.enableVertexAttribArray(this._attribLocations.pointSize);

		this._gl.vertexAttribPointer(this._attribLocations.brightness, 1, this._gl.FLOAT, false, Catalogue.BYTES_X_ELEM * Catalogue.ELEM_SIZE, Catalogue.BYTES_X_ELEM * 5);
		this._gl.enableVertexAttribArray(this._attribLocations.brightness);

		// setting source shape color 
		// var rgb = colorHex2RGB(this._descriptor.shapeColor);
		var rgb = colorHex2RGB(this._shapeColor);

		var alpha = 1.0;
		rgb[3] = alpha;
		this._gl.uniform4f(this._attribLocations.color, rgb[0], rgb[1], rgb[2], rgb[3]);

		if (in_mouseHelper != null && in_mouseHelper.xyz != this._oldMouseCoords) {

			// removing old hovered
			for (var k = 0; k < this._hoveredIndexes.length; k++) {
				this._vertexCataloguePosition[(this._hoveredIndexes[k] * Catalogue.ELEM_SIZE) + 3] = 0.0; // not hovered
				this._vertexCataloguePosition[(this._hoveredIndexes[k] * Catalogue.ELEM_SIZE) + 4] = this._sources[this._hoveredIndexes[k]].shapeSize; // point size
			}

			this._hoveredIndexes = this.checkSelection(in_mouseHelper);

			let hoveredSources = [];
			for (var i = 0; i < this._hoveredIndexes.length; i++) {
				hoveredSources.push(this._sources[this._hoveredIndexes[i]]);
			}


			// new hovered applied
			for (var i = 0; i < this._hoveredIndexes.length; i++) {
				this._vertexCataloguePosition[(this._hoveredIndexes[i] * Catalogue.ELEM_SIZE) + 3] = 1.0; // hovered
				this._vertexCataloguePosition[(this._hoveredIndexes[i] * Catalogue.ELEM_SIZE) + 4] = this._sources[this._hoveredIndexes[i]].shapeSize; // point size
				// this._vertexCataloguePosition[ (this._hoveredIndexes[i] * Catalogue2.ELEM_SIZE) + 4] = 10.0; // point size
			}
			
		}

		for (let s = 0; s < this._selectedIndexes.length; s++) {
			this._vertexCataloguePosition[(this._selectedIndexes[s] * Catalogue.ELEM_SIZE) + 3] = 2.0; // selected
			this._vertexCataloguePosition[(this._selectedIndexes[s] * Catalogue.ELEM_SIZE) + 4] = this._sources[this._selectedIndexes[s]].shapeSize; // point size				
		}

		for (let e = 0; e < this._extHoveredIndexes.length; e++) {
			this._vertexCataloguePosition[(this._extHoveredIndexes[e] * Catalogue.ELEM_SIZE) + 3] = 1.0; // selected
			this._vertexCataloguePosition[(this._extHoveredIndexes[e] * Catalogue.ELEM_SIZE) + 4] = this._sources[this._extHoveredIndexes[e]].shapeSize; // point size				
		}

		this._gl.bufferData(this._gl.ARRAY_BUFFER, this._vertexCataloguePosition, this._gl.STATIC_DRAW);



		var numItems = this._vertexCataloguePosition.length / Catalogue.ELEM_SIZE;

		this._gl.drawArrays(this._gl.POINTS, 0, numItems);

		this._oldMouseCoords = in_mouseHelper.xyz;

	}


}


export default Catalogue;