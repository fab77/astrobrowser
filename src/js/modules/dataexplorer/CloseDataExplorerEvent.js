"use strict";

class CloseDataExplorerEvent {
	
	_catalogue;
	static name = "CloseDataExplorerEvent";
	
	constructor(){
		
	}
	
	get name(){
		return CloseDataExplorerEvent.name;
	}
	
	
}

export default CloseDataExplorerEvent;