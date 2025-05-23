"use strict";
/**
 * @author Fabrizio Giordano (Fab)
 */


import { Healpix, Vec3, Pointing } from "healpixjs";
import global from '../Global.js';
import {cartesianToSpherical, sphericalToAstroDeg, raDegToHMS, decDegToDMS} from './Utils.js';

class MouseHelper {
	
	xyz;
	raDec;
	phiTheta;
	
	/**
	 * @param xyz array [x, y, z] 
	 * @param raDecDeg [ra, dec] in degrees in equatorial J2000 
	 * @param phiThetaDeg [phi, theta] in degrees spherical coords
	 */
	constructor(in_xyz, in_raDecDeg, in_phiThetaDeg) {
		if (in_xyz != null && in_xyz !== undefined){
			this.xyz = in_xyz;
		}
		
		if (in_raDecDeg != null && in_raDecDeg !== undefined){
			this.raDec = in_raDecDeg;
		}
		
		if (in_phiThetaDeg != null && in_phiThetaDeg !== undefined){
			this.phiTheta = in_phiThetaDeg;
		}
	};
	
	
	// TODO wrong method name. No more fixed nside=256. nside is now defined into Global.js 
	computeNpix256() {
		
		if (this.xyz != null){
			// let healpix256 = new Healpix(global.nsideForSelection);
			let healpix256 = global.getHealpix(global.nsideForSelection);
			let vec3 = new Vec3(this.x, this.y, this.z);
			let pointing = new Pointing(vec3);
			let res = healpix256.ang2pix(pointing);
//			console.log(res);
			return res;
		}
		return null;
		
	};

	update (mousePoint) {

		this.phiThetaDeg = cartesianToSpherical(mousePoint);
		this.raDecDeg = sphericalToAstroDeg(this.phiThetaDeg.phi, this.phiThetaDeg.theta);
		this.xyz = mousePoint;
		this.raHMS = raDegToHMS(this.raDecDeg.ra);
		this.decDMS = decDegToDMS(this.raDecDeg.dec);
		
	}
	
	clear(){
		
		this.xyz = null;
		this.raDec = null;
		this.phiTheta = null;
	};
	
	// /**
	//  * @param {any} in_xyz
	//  */
	// set xyz(in_xyz){
	// 	if (in_xyz != null && in_xyz !== undefined){
	// 		this.xyz = in_xyz;
	// 	}
	// };
	
	// /**
	//  * @param {any} in_raDecDeg
	//  */
	// set raDecDeg(in_raDecDeg){
	// 	if (in_raDecDeg != null && in_raDecDeg !== undefined){
	// 		this.raDec = in_raDecDeg;
	// 	}
		
	// };
	
	// /**
	//  * @param {any} in_phiThetaDeg
	//  */
	// set phiThetaDeg(in_phiThetaDeg){
	// 	if (in_phiThetaDeg != null && in_phiThetaDeg !== undefined){
	// 		this.phiTheta = in_phiThetaDeg;
	// 	}
		
	// };
	
	
	
	get xyz() {
		return this.xyz;
	};
	
	get x(){
		return this.xyz[0];
	};
	
	get y(){
		return this.xyz[1];
	};
	
	get z(){
		return this.xyz[2];
	};
	
	get ra(){
		return this.raDec[0];
	};
	
	get dec(){
		return this.raDec[1];
	};
	
	get phi(){
		return this.phiTheta[0];
	};
	
	get theta(){
		return this.phiTheta[1];
	};
	
	
}

export default MouseHelper;