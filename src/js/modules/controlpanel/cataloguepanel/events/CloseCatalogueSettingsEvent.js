"use strict";

class CloseCatalogueSettingsEvent{
	
	_catalogue;
	static name = "CloseCatalogueSettingsEvent";
	
	constructor(){
		
	}
	
	get name(){
		return CloseCatalogueSettingsEvent.name;
	}
	
	
}

export default CloseCatalogueSettingsEvent;