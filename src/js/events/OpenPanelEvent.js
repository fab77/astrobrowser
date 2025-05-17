"use strict";

class OpenPanelEvent{
	
	_panelName;
	// _view;
	static name = "OpenPanelEvent";
	
	// constructor(panelName, view){
	constructor(panelName){
		this._panelName = panelName;
		// this._view = view;
	}
	
	get name(){
		return OpenPanelEvent.name;
	}

	// get view() {
	// 	return this._view;
	// }
	
	get panelName(){
		return this._panelName;
	}
}

export default OpenPanelEvent;