"use strict";

class FootprintSetCloseEvent{
	
	_footprintset;
	static name = "FootprintSetCloseEvent";
	
	constructor(footprintset){
		this._footprintset = footprintset;
		
	}
	
	get name(){
		return FootprintSetCloseEvent.name;
	}
	
	get footprintSet(){
		return this._footprintset;
	}

}

export default FootprintSetCloseEvent;