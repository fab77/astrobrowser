"use strict";

class ColorMapChangeEvent{
	
	_colorMapName;
	static name = "ColorMapChangeEvent";
	
	constructor(colorMapName){
		this._colorMapName = colorMapName;
	}
	
	get name(){
		return ColorMapChangeEvent.name;
	}

	get colorMapName(){
		return this._colorMapName;
	}
}

export default ColorMapChangeEvent;