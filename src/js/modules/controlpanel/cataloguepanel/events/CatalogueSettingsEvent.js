"use strict";

class CatalogueSettingsEvent{
	
	_catalogue;
	_tapRepo;
	static name = "CatalogueSettingsEvent";
	
	constructor(catalogue, tapRepo){
		this._catalogue = catalogue;
		this._tapRepo = tapRepo;
	}
	
	get name(){
		return CatalogueSettingsEvent.name;
	}
	
	get catalogue(){
		return this._catalogue;
	}

	get tapRepo() {
		return this._tapRepo;
	}

}

export default CatalogueSettingsEvent;