// "use strict";

// // import Point from '../utils/Point.js';

// import { Healpix, Vec3, Pointing } from "healpixjs";
// import global from '../Global.js';

// class Source{
	
// 	_point;
// 	_name;
// 	_details;
// 	_h_pix;
// 	_shapesize;
// 	/**
// 	 * 
// 	 * @param in_point:
// 	 *            Point.js
// 	 * @param in_name:
// 	 *            String - source name
// 	 * @param in_details:
// 	 *            Object {"key": <key>, "value": <value>, "valueType":
// 	 *            <valueType>, "unit": <unit>}
// 	 */
// 	// constructor(in_point, in_name, in_details=[]){
// 	constructor(in_point, in_details=[]){
// 		this._point = in_point;
// 		// this._name = in_name;
// 		this._details = in_details;
// 		this._shapesize = 8.0;
// 		this._brightnessFactor = -99;
// 		this.computeHealpixPixel();
// 	}



// 	computeHealpixPixel(){
		
// 		let healpix = new Healpix(global.nsideForSelection);
// 		let vec3 = new Vec3(this._point.x, this._point.y, this._point.z);
// 		let ptg = new Pointing(vec3, false);
// 		this._h_pix = healpix.ang2pix(ptg, false);
		
// 	}
	
// 	get point(){
// 		return this._point;
// 	}

// 	get name () {
// 		return this._name;
// 	}
	
// 	get healpixPixel(){
// 		return this._h_pix;
// 	}

// 	get shapeSize() {
// 		return this._shapesize;
// 	}

// 	setShapeSize (columnindex) {
		
// 		this._shapesize = this._details[columnindex];
		
// 	}

// 	set shapeSize (size) {
		
// 		this._shapesize = size;
		
// 	}

// 	get brightnessFactor() {
// 		return this._brightnessFactor;
// 	}

// 	/**
// 	 * 
// 	 * @param {*} factor [-1..1]
// 	 */
// 	setBrightnessFactor(factor){
// 		this._brightnessFactor = factor;
// 	}

// 	/**
// 	 * 
// 	 * @param {*} factor [-1..1]
// 	 */
// 	set brightnessFactor(factor) {
// 		this._brightnessFactor = factor;
// 	}
// }

// export default Source;
