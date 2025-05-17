"use strict";

class ScaleFunctionChangeEvent{
	
	_sfName;
	static name = "ScaleFunctionChangeEvent";
	
	constructor(sfName){
		this._sfName = sfName;
	}
	
	get name(){
		return ScaleFunctionChangeEvent.name;
	}

	get scaleFunctionName(){
		return this._sfName;
	}
}

export default ScaleFunctionChangeEvent;