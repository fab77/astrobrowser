"use strict";

class CatalogueCloseEvent{
	
	_catalogue;
	static name = "CatalogueCloseEvent";
	
	constructor(catalogue){
		this._catalogue = catalogue;
		
	}
	
	get name(){
		return CatalogueCloseEvent.name;
	}
	
	get catalogue(){
		return this._catalogue;
	}

}

export default CatalogueCloseEvent;