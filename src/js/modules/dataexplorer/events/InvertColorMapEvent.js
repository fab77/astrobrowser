"use strict";

class InvertColorMapEvent{
	
	_inverted;
	static name = "InvertColorMapEvent";
	
	constructor(inverted){
		this._inverted = inverted;
	}
	
	get name(){
		return InvertColorMapEvent.name;
	}

	get isInverted(){
		return this._inverted;
	}
}

export default InvertColorMapEvent;