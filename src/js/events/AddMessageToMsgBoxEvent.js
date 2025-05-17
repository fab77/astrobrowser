"use strict";

class AddMessageToMsgBoxEvent{
	
	_message;
	_msgId;
	static name = "AddMessageToMsgBoxEvent";
	
	constructor(msgId, message){
		this._message = message
		this._msgId = msgId
	}
	
	get name(){
		return AddMessageToMsgBoxEvent.name;
	}

	get message(){
		return this._message
	}

	get msgId(){
		return this._msgId
	}
	
}

export default AddMessageToMsgBoxEvent;