"use strict";

class CatalogueSettingsChangeEvent{
	
	_ra;
	_dec;
	_sourcename;
	_shape;
	_color;
	_hue;
	// _cataloguename;
	_catalogue;
	_tapRepo;

	static name = "CatalogueSettingsChangeEvent";
	
	// constructor(ra, dec, name, shape, color, hue, cataloguename){
	constructor(ra, dec, name, shape, color, hue, catalogue, tapRepo){
		this._ra = ra;
		this._dec = dec;
		this._sourcename = name;
		this._shape = shape;
		this._color = color;
		this._hue = hue;
		// this._cataloguename = cataloguename;
		this._catalogue = catalogue;
		this._tapRepo = tapRepo;
	}
	
	get name(){
		return CatalogueSettingsChangeEvent.name;
	}

	get ra() {
		return this._ra;
	}

	get dec() {
		return this._dec;
	}

	get sourcename() {
		return this._sourcename;
	}

	get shape() {
		return this._shape;
	}

	get hue() {
		return this._hue;
	}

	get color() {
		return this._color;
	}

	// get cataloguename() {
	// 	return this._cataloguename;
	// }
	get catalogue() {
		return this._catalogue;
	}
	
	get tapRepo(){
		return this._tapRepo;
	}
	
}

export default CatalogueSettingsChangeEvent;