"use strict";

class HiPSDescriptor {
	
	_mission;
	_surveyName;
	_url;
	_maxOrder;
	_imgFormat;
	_hipsFrame;
	_emMin;
	_emMax;
	
	constructor(hipsproperties, hipsurl){
		
		// 

		// console.log(hipslist_JSON);
		this._minOrder = 3;
		this._imgformats = [];
		this._datarange = {min: undefined, max: undefined};
		this._maxOrder = undefined;
		this._tilewidth = undefined;
		this._hipsFrame = undefined;
		this._hipsName = undefined;
		this._hipsurl = hipsurl;
		this._emMin = undefined;
		this._emMax = undefined;

		const allLines = hipsproperties.split(/\r\n|\n/);
		allLines.forEach((line) => {
			if (line.startsWith("hips_tile_format") || line.startsWith("format")) {
				let formatlist = this.getValue(line.replace(/jpeg/ig, "jpg"));
				this._imgformats = formatlist.split(" ");
			} else if (line.startsWith("hips_data_range")) {
				let dr = this.getValue(line);
				this._datarange.min = parseFloat(dr.split(" ")[0].trim());
				this._datarange.max = parseFloat(dr.split(" ")[1].trim());
			} else if (line.startsWith("hips_tile_width")) {
				this._tilewidth = this.getValue(line);
			} else if (line.startsWith("hips_order_min")) {
				this._minOrder = parseInt(this.getValue(line));
			} else if (line.startsWith("hips_order") || line.startsWith("maxOrder")) {
				this._maxOrder = parseInt(this.getValue(line));
			} else if (line.startsWith("hips_frame") || line.startsWith("frame")) {
				this._hipsFrame = this.getValue(line);
			} else if (line.startsWith("obs_collection") || line.startsWith("label")) {
				this._hipsName = this.getValue(line);
			} else if (line.startsWith("em_min")) {
				this._emMin = this.getValue(line);
			} else if (line.startsWith("em_max")) {
				this._emMax = this.getValue(line);
			} 

			
		
		});

		if (this._hipsFrame === undefined) {
			console.warn("[HiPSDescriptor] this._hipsFrame is not defined in the properties file of "+this._hipsurl+". Setting it to equatorial for convenience");
			this._hipsFrame = "equatorial";
		}
		this._isGalctic = (this._hipsFrame.toLowerCase().includes("gal")) ? true : false;

		if (this._maxOrder === undefined || this._imgformats.length == 0) {
			throw new Error("[HiPSDescriptor] this._maxOrder: "+ this._maxOrder+" this._imgFormat.length: "+this._imgformats.length);
		}


		// this._mission = hipslist_JSON.mission;
		// this._surveyName = hipslist_JSON.surveyName;
		// let urlFromJson = hipslist_JSON.surveyRootUrl;
		// if(!urlFromJson.endsWith('/')){
		// 	urlFromJson += "/";
		// }
		// urlFromJson = urlFromJson.replace('cdn.skies', 'skies');

		// this._url = urlFromJson;
		// this._maxOrder = hipslist_JSON.maximumNorder;
		// this._imgFormat = hipslist_JSON.imgFormat;
		// this._hipsFrame = hipslist_JSON.hipsFrame;

	}

	getValue(line) {
		return line.split("=")[1].trim();
	}

	// get mission(){
	// 	return this._mission;
	// }
	
	get surveyName(){
		// return this._surveyName;
		return this._hipsName;
	}
	
	get url(){
		// return this._url;
		return this._hipsurl
	}
	
	get maxOrder(){
		return this._maxOrder;
	}

	get minOrder(){
		return this._minOrder;
	}
	
	get imgFormats(){
		return this._imgformats;
	}
	
	get hipsFrame(){
		return this._hipsFrame;
	}

	get isGalactic() {
		return this._isGalctic;
	}
	
	get emMin() {
		return this._emMin
	}

	get emMax() {
		return this._emMax
	}
}

export default HiPSDescriptor;
