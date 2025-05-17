"use strict";

class OpenDataExplorerPanelEvent{
	
	_craDeg;
	_cdecDeg;
	_radiusDeg;
	_pxSize;
	_projectionName;
	_hipsURL;
	static name = "OpenDataExplorerPanelEvent";
	
	constructor(centralRA, centralDec, pxSize, radius, projectionName, hipsURL){
		this._craDeg = centralRA;
		this._cdecDeg = centralDec;
		this._pxSize = pxSize;
		this._radiusDeg = radius;
		this._projectionName = projectionName;
		this._hipsURL = hipsURL;
	}
	
	get craDeg() {
		return this._craDeg;
	}

	get cdecDeg() {
		return this._cdecDeg;
	}
	
	get radiusDeg() {
		return this._radiusDeg;
	}
	
	get projectionName() {
		return this._projectionName;
	}

	get pxSize() {
		return this._pxSize;
	}

	get hipsURL() {
		return this._hipsURL;
	}
	
	get name(){
		return OpenDataExplorerPanelEvent.name;
	}
	
}

export default OpenDataExplorerPanelEvent;