"use strict";

class ShowCoordsGridSelectionChangedEvent{
	
	_shouldShowGrid;
	static name = "ShowCoordsGridSelectionChangedEvent";
	
	constructor(in_shouldShowGrid){
		this._shouldShowGrid = in_shouldShowGrid;
	}
	
	get name(){
		return ShowCoordsGridSelectionChangedEvent.name;
	}
	
	get shouldShowGrid(){
		return this._shouldShowGrid;
	}

}
export default ShowCoordsGridSelectionChangedEvent;