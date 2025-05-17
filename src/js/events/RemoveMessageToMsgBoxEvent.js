"use strict";

class RemoveMessageToMsgBoxEvent{
	
	_msgId;
	static name = "RemoveMessageToMsgBoxEvent";
	
	constructor(msgId){
		this._msgId = msgId
	}
	
	get name(){
		return RemoveMessageToMsgBoxEvent.name;
	}

	get msgId(){
		return this._msgId
	}
	
}

export default RemoveMessageToMsgBoxEvent;