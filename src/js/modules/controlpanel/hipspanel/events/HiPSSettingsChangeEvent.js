"use strict";

class HiPSSettingsChangeEvent{
	
	_var;
	static name = "HiPSSettingsChangeEvent";
	
	constructor(myvar){
		this._var = myvar;
	}
	
	get name(){
		return HiPSSettingsChangeEvent.name;
	}

	get var() {
		return this._var;
	}
	
}

export default HiPSSettingsChangeEvent;