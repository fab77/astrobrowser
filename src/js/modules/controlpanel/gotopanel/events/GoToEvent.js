"use strict";

class GoToEvent{

    _raDeg;
    _decDeg;
    static name = "GoToEvent";

    constructor(raDeg, decDeg) {
        this._decDeg = decDeg;
        this._raDeg = raDeg;
    }

    get name(){
		return GoToEvent.name;
	}

    get raDeg() {
        return this._raDeg
    }

    get decDeg() {
        return this._decDeg
    }


}

export default GoToEvent;