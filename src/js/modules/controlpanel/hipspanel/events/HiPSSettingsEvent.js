"use strict";

import HiPSDescriptor from "../../../../model/HiPSDescriptor.js";

class HiPSSettingsEvent{
	
	_descriptor;
	static name = "HiPSSettingsEvent";
	
	/**
	 * 
	 * @param {HiPSDescriptor} descriptor 
	 */
	constructor(descriptor){
		this._descriptor = descriptor;
	}
	
	get name(){
		return HiPSSettingsEvent.name;
	}
	
	get descriptor(){
		return this._descriptor;
	}

}

export default HiPSSettingsEvent;