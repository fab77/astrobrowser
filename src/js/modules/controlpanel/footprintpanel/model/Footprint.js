"use strict";
/**
 * @author Fabrizio Giordano (Fab)
 */



import { Pointing, Healpix } from "healpixjs";
import {degToRad} from '../../../../utils/Utils.js';
import GeomUtils from '../../../../utils/GeomUtils.js';
import global from '../../../../Global.js';
import STCSParser from '../../../../utils/STCSParser.js';


class Footprint{
	
	_polygons; // array of polygons (-> array of points)
	_convexPolygons; // array of convex polygons (-> array of points) 
	_stcs; // STC-S Space-Time Coordinate Metadata Linear String Implementation 
	
	_details;
	_totPoints;
	_totConvexPoints;
	_npix256;
	_footprintsPointsOrder; // 1-> clockwise, -1 counter clockwise
	 

	/**
	 * 
	 * @param in_point: Point.js - center
	 * @param in_identifier: String - observation name/identifier
	 * @param in_stcs: String - STC-S representation of the footprint
	 * @param in_details: Object {"key": <key>, "value": <value>, "valueType": <valueType>, "unit": <unit>}
	 */
	//  constructor(in_point, in_identifier, in_stcs, in_details=[], footprintsPointsOrder){
	constructor(in_stcs, in_details=[], footprintsPointsOrder){
		
		// this._center = in_point;
		this._stcs = in_stcs.toUpperCase();
		// this._identifier = in_identifier;
		this._details = in_details;
		this._polygons = [];
		this._totPoints = 0;
		this._totConvexPoints = 0;
		
		// this._footprintsPointsOrder = footprintsPointsOrder;
		this.computePoints();
		// this._footprintsPointsOrder = GeomUtils.isPolyClockwise(this._polygons);
		// this.computeConvexPoly();
		this.computeSelectionObject();
		if (global.healpix4footprints){
			this._npix256 = this.computeNpix256();	
		}
		
	}

	computeSelectionObject(){
		this._selectionObj = GeomUtils.computeSelectionObject(this._polygons);
	}
	
	
	computeConvexPoly(){
		
		// this._convexPolygons = GeomUtils.computeConvexPolygons3(this._polygons, this._footprintsPointsOrder, this);
		this._convexPolygons = GeomUtils.computeConvexPolygons4(this._polygons, this._footprintsPointsOrder, this);
		
		for (let i = 0; i < this._convexPolygons.length; i++){
			let poly = this._convexPolygons[i];
//			this._totConvexPoints += Object.values(poly).length;
			this._totConvexPoints += poly.length;
		}
		
	}
	
	/**
	 * return: array of int representing the HEALPix pixels covering the footprint 
	 */
	// TODO wrong method name. No more fixed nside=256. nside is now defined into Global.js
	computeNpix256(){

//		this._convexPolygons = GeomUtils.computeConvexPolygons(this._polygons);
		
		let healpix256 = new Healpix(global.nsideForSelection);

		let points = [];
		for (let i = 0; i < this._convexPolygons.length; i++){
			let poly = this._convexPolygons[i];
			for (let j = 0; j < poly.length; j++){

				let currPoint = poly[j];

				let phiTheta = currPoint.computeHealpixPhiTheta();
				let phiRad = degToRad(phiTheta.phi);
				let thetaRad = degToRad(phiTheta.theta);
				
				let pointing = new Pointing(null, false, thetaRad, phiRad);

				points.push(pointing);
			}
		}
		
		let rangeSet = healpix256.queryPolygonInclusive(points, 32);

		return rangeSet.r;
		
	};

	
	computePoints(){
		
		let res =  STCSParser.parseSTCS(this._stcs);
		this._polygons = res.polygons;
		this._totPoints = res.totpoints;
		
	}
	
	get totPoints(){
		return this._totPoints;
	}
	
	get totConvexPoints(){
		return this._totConvexPoints;
	}

	get polygons(){
		return this._polygons;
	}
	
	get convexPolygons(){
		return this._convexPolygons;
	}

	get identifier () {
		return this._identifier;
	}
	
	get center(){
		return this._center;
	}
	
	get pixels(){
		return this._npix256;
	}
	
}

export default Footprint;
