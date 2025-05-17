"use strict";

class FootprintSettingsChangeEvent {

	_geometry;
	_obsname;
	_color;
	_hue;
	_fpset;
	_tapRepo;
	static name = "FootprintSettingsChangeEvent";

	constructor(geometry, name, color, hue, fpset, tapRepo) {
		this._geometry = geometry;
		this._obsname = name;
		this._color = color;
		this._hue = hue;
		this._fpset = fpset;
		this._tapRepo = tapRepo;
	}

	get name() {
		return FootprintSettingsChangeEvent.name;
	}

	get geometry() {
		return this._geometry;
	}

	get obsName() {
		return this._obsname;
	}

	get hue() {
		return this._hue;
	}

	get color() {
		return this._color;
	}

	get fpSet() {
		return this._fpset;
	}

	get tapRepo () {
		return this._tapRepo;
	}

}

export default FootprintSettingsChangeEvent;