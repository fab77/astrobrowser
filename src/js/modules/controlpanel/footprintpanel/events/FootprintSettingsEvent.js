"use strict";

class FootprintSettingsEvent{
	
	_footprintset;
	_tapRepo;
	static name = "FootprintSettingsEvent";
	
	constructor(footprintset, tapRepo){
		this._footprintset = footprintset;
		this._tapRepo = tapRepo;
	}
	
	get name(){
		return FootprintSettingsEvent.name;
	}
	
	get footprintSet(){
		return this._footprintset;
	}

	get tapRepo(){
		return this._tapRepo;
	}

}

export default FootprintSettingsEvent;