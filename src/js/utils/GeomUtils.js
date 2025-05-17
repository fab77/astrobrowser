"use strict";
import Point from './Point.js';
import Point2D from './Point2D.js';
import CoordsType from '../utils/CoordsType.js';

/**
 * @author Fabrizio Giordano (Fab77)
 */
class GeomUtils{
	

	// orthodromic distance - great circle distance
	static orthodromicDistance(p1, p2) {

		// Math.sqrt( ((p1._raRad - p2._raRad)*Math.cos(p1._decRad) )**2 + (p1._decRad - p2._decRad)**2 );
		return Math.acos(Math.sin(p1._decRad) * Math.sin(p2._decRad) + Math.cos(p1._decRad) * Math.cos(p2._decRad) * Math.cos(p2._raRad - p1._raRad));

	}

	

	/**
	 * 
	 * @param {*} polygons 
	 * @returns {points: [[]], flag: int} where flag is
	 * 0 -> if all points are in the same emisphere and abs(Dec) > 10 -> uses spherical projection with z=0, x = sin(dec) cos (ra); y = sin(dec) sin(ra)
	 * 1 -> if all points are in the equatorial belt (abs(dec)< 10) => normal BBox using x=RA, y=Dec directly
	 * 2 -> if all points are in the equatorial belt (abs(dec)< 10) and poly is crossing RA 0 => subtract 360 to every RA > 180
	 */
	 static computeSelectionObject(polygons) {
		let poly4selection = [];
		let flag = 0;
		let maxx = undefined;
		let maxy = undefined;
		let minx = undefined;
		let miny = undefined;


		const DEC_THRESHOLD = 10;
		let emisphere = 0;  // 1 means northen emisphere with Dec > 10 deg, -1 southern emisphere with Dec < -10 deg
		// let emishpere = (polygons[0][0].decDeg() >= DEC_THRESHOLD) ? 1 : -1; // 1 means northen emisphere, -1 southern emisphere
		if (polygons[0][0].decDeg >= DEC_THRESHOLD) {
			emisphere = 1;
		} else if (polygons[0][0].decDeg <= -1 * DEC_THRESHOLD) {
			emisphere = -1;
		} else {
			flag = 1;
		}
		if (flag == 0) {
			// let first = new Point2D(polygons[0][0].x, polygons[0][0].y);
			let first = GeomUtils.projectIn2D(polygons[0][0]);
			maxx = first.x;
			maxy = first.y;
			minx = first.x;
			miny = first.y;
			for (let currpoly of polygons) {
				let selpoly = [];
				for (let point of currpoly) {
					if ( (point.decDeg > emisphere * DEC_THRESHOLD && emisphere == -1) ||
						 (point.decDeg < emisphere * DEC_THRESHOLD && emisphere == 1) ) {
						flag = 1;
						poly4selection = [];
						break;
					}
					// let p = new Point2D(point.x, point.y);
					let p = GeomUtils.projectIn2D(point);
					selpoly.push(p);
					if (p.x > maxx) {
						maxx = p.x;
					}
					if (p.y > maxy) {
						maxy = p.y;
					}
					if (p.x < minx) {
						minx = p.x;
					}
					if (p.y < miny) {
						miny = p.y;
					}
					
				}
				poly4selection.push(selpoly);
			}
		}
		
		if (flag == 0) {
			return {
				'poly4selection': poly4selection,
				'flag': flag,
				'maxx': maxx,
				'maxy': maxy,
				'minx': minx,
				'miny': miny
			};
		}


		const RA_THRESHOLD = 180;
		let belowThreshold = (polygons[0][0].raDeg < RA_THRESHOLD); // 1 means northen emisphere, -1 southern emisphere;
		maxx = polygons[0][0].raDeg;
		maxy = polygons[0][0].decDeg;
		minx = polygons[0][0].raDeg;
		miny = polygons[0][0].decDeg;
		for (let currpoly of polygons) {
			let selpoly = [];
			for (let point of  currpoly) {
				let p = new Point2D(point.raDeg, point.decDeg);
				selpoly.push(p);
				if (point.raDeg > maxx) {
					maxx = point.raDeg;
				}
				if (point.decDeg > maxy) {
					maxy = point.decDeg;
				}
				if (point.raDeg < minx) {
					minx = point.raDeg;
				}
				if (point.decDeg < miny) {
					miny = point.decDeg;
				}

				if ( (point.raDeg >= RA_THRESHOLD && belowThreshold) ||
					(point.raDeg <= RA_THRESHOLD && !belowThreshold) ) {
					flag = 2;
					poly4selection = [];
					break;
				}
			}
			poly4selection.push(selpoly);
		}

		if (flag == 1) {
			return {
				'poly4selection': poly4selection,
				'flag': flag,
				'maxx': maxx,
				'maxy': maxy,
				'minx': minx,
				'miny': miny
			};
		}

		maxx = polygons[0][0].raDeg;
		if (polygons[0][0].raDeg >= RA_THRESHOLD) {
			maxx = polygons[0][0].raDeg - 360;
		}
		maxy = polygons[0][0].decDeg;
		minx = maxx;
		miny = maxy;
		for (let currpoly of polygons) {
			let selpoly = [];
			for (let point of currpoly) {
				let curra = (point.raDeg >= RA_THRESHOLD ? (point.raDeg - 360) : point.raDeg);
				if (curra > maxx) {
					maxx = curra;
				}
				if (point.decDeg > maxy) {
					maxy = point.decDeg;
				}

				if (curra < minx) {
					minx = curra;
				}
				if (point.decDeg < miny) {
					miny = point.decDeg;
				}

				// if (point.raDeg >= RA_THRESHOLD){
				let p = new Point2D(curra, point.decDeg);
				selpoly.push(p);
				// }
			}
			poly4selection.push(selpoly);
		}

		return {
			'poly4selection': poly4selection,
			'flag': flag,
			'maxx': maxx,
			'maxy': maxy,
			'minx': minx,
			'miny': miny
		};
	}



	static stereographic (point) {
		return { 
			'x': 2* parseFloat(point.x)/(1-parseFloat(point.z)), 
			'y': 2* parseFloat(point.y)/(1-parseFloat(point.z))
		};
	}

	static projectIn2D(point) {
		return GeomUtils.stereographic(point);
		//return GeomUtils.mercator(point);
		// return point;
	}

	static checkPointInsidePolygon5(selectionObj, point) {

		let intersections = 0;
		let flag = selectionObj.flag;
		let p0 = undefined;
		let p1 = undefined;

		if (flag == 0) {
			// p0 = new Point2D(point.x, point.y);
			p0 = GeomUtils.projectIn2D(point);
		} else if (flag == 1) {
			p0 = new Point2D(point.raDeg, point.decDeg);
		} else if (flag == 2) {
			const RA_THRESHOLD = 180; // TODO move it as a statci constant since it's been used in other methods
			if (point.raDeg >= RA_THRESHOLD) {
				p0 = new Point2D(point.raDeg - 360, point.decDeg);
			} else {
				p0 = new Point2D(point.raDeg, point.decDeg);
			}
			
		}
		p1 = new Point2D(p0.x, p0.y + 2* Math.abs(selectionObj.maxy - selectionObj.miny));

		if (p0.x > selectionObj.maxx || p0.x < selectionObj.minx ||
			p0.y > selectionObj.maxy || p0.y < selectionObj.miny) {
				return false;
			}

		let polygons = selectionObj.poly4selection;
		// iterating over all subpolygons
		for (let i = 0; i < polygons.length; i++){
			let currpoly = polygons[i];
			
			
			intersections = 0;
			let p2, p3;

			// computing intersection between each segment of the current subpolygon (p) and the rect m01, q01
			for (let p = 0; p < currpoly.length-1; p++) {
			
				p2 = currpoly[p];
				p3 = currpoly[p+1];

				let denominator = (p3.y - p2.y) * (p1.x - p0.x) - (p3.x - p2.x) * (p1.y - p0.y) ;
				let numerator01 = (p3.x - p2.x) * (p0.y - p2.y) - (p3.y - p2.y) * (p0.x - p2.x);
				let numerator23 = (p1.x - p0.x) * (p0.y - p2.y) - (p1.y - p0.y) * (p0.x - p2.x);

				if ( denominator != 0) {

					let lamda01 = numerator01 / denominator;
					let lambda23 = numerator23 / denominator;
					if (lamda01 >= 0 && lamda01 <= 1 &&
						lambda23 >= 0 && lambda23 <= 1) {
							intersections++;
					}	
				}	
			}
			// computing intersection against last point and first point of the currpoly
			p2 = currpoly[currpoly.length-1];
			p3 = currpoly[0]
			let denominator = (p3.y - p2.y) * (p1.x - p0.x) - (p3.x - p2.x) * (p1.y - p0.y) ;
			let numerator01 = (p3.x - p2.x) * (p0.y - p2.y) - (p3.y - p2.y) * (p0.x - p2.x);
			let numerator23 = (p1.x - p0.x) * (p0.y - p2.y) - (p1.y - p0.y) * (p0.x - p2.x);

			if ( denominator != 0) {

				let lamda01 = numerator01 / denominator;
				let lambda23 = numerator23 / denominator;
				if (lamda01 >= 0 && lamda01 <= 1 &&
					lambda23 >= 0 && lambda23 <= 1) {

						intersections++;
					}

				
			} 
			// odd intersections means point inside, even => point outside
			if ( (intersections % 2) == 1 ) {
				return true;
			}
		}
		return false;
	}

	static checkPointInsidePolygon4(polygons, point) {

		let intersections;
		// mouse position projected into 2D XY plane
		let p0 = GeomUtils.projectIn2D(point);
		let lambda_p, lambda_s;

		// // second arbitrary point used to construct the rect
		// let p1 = { 
		// 	'x': p0.x + Math.PI/2,
		// 	'y': p0.y
		// };

		// TODO 
		/**
		 * [flag to indicate the projection strategy to be use fo footprint selection. 
		 * Each polygon has is own flag computed at init time (in the constructor)]
		 * 1. compute correct flag to be used in each Footprint (constructor)  <- move this into the Footprint constructor 
		 * 		
		 * 		a. flag 0:if all points are in the same emisphere and abs(Dec) > 10 -> x = sin(dec) cos (ra); y = sin(dec) sin(ra)
		 * 		b. flag 1: normal BBox using x=RA, y=Dec directly
		 * 		c. flag 2: subtract 360 to every RA > 180 (case when poly is crossing RA 0)
		 * 		
		 * 2. when cursor moves, update mouse(x, y) for each 0,1,2 projections
		 * 3. foreach poly: 
		 * 	3.1 select correct mouse x,y
		 * 	3.2 check if mouse is inside BBox(poly)
		 * 	3.3 compute p1 = p0 + (max x and y of polygon)
		 * 	3.4 count intersections 
		 * 
		 */

		let maxdist = point._raDeg + 15;
		if (maxdist > 360) {
			maxdist = point._raDeg - 15;;
		}

		let p1point = new Point({
			"raDeg": maxdist,
			"decDeg": point._decDeg
		}, CoordsType.ASTRO);
		let p1 = GeomUtils.projectIn2D(p1point);

		
		// iterating over all subpolygons
		for (let i = 0; i < polygons.length; i++){
			let currpoly = polygons[i];
			
			
			intersections = 0;
			let p2, p3;
			// compute BBox
			// computing intersection between each segment of the current subpolygon (p) and the rect m01, q01
			for (let p = 0; p < currpoly.length-1; p++) {
			
				p2 = GeomUtils.projectIn2D(currpoly[p]);
				p3 = GeomUtils.projectIn2D(currpoly[p+1]);

				let denominator = (p3.y - p2.y) * (p1.x - p0.x) - (p3.x - p2.x) * (p1.y - p0.y) ;
				let numerator01 = (p3.x - p2.x) * (p0.y - p2.y) - (p3.y - p2.y) * (p0.x - p2.x);
				let numerator23 = (p1.x - p0.x) * (p0.y - p2.y) - (p1.y - p0.y) * (p0.x - p2.x);

				if ( denominator != 0) {

					let lamda01 = numerator01 / denominator;
					let lambda23 = numerator23 / denominator;
					if (lamda01 >= 0 && lamda01 <= 1 &&
						lambda23 >= 0 && lambda23 <= 1) {
							intersections++;
						}

					
				} 
				// else if (denominator == 0 && numerator01 == 0 && numerator23 == 0) { // coincident
				// 	intersections++;
				// }
					
			}
			p2 = GeomUtils.projectIn2D(currpoly[currpoly.length-1])
			p3 = GeomUtils.projectIn2D(currpoly[0])
			let denominator = (p3.y - p2.y) * (p1.x - p0.x) - (p3.x - p2.x) * (p1.y - p0.y) ;
			let numerator01 = (p3.x - p2.x) * (p0.y - p2.y) - (p3.y - p2.y) * (p0.x - p2.x);
			let numerator23 = (p1.x - p0.x) * (p0.y - p2.y) - (p1.y - p0.y) * (p0.x - p2.x);

			if ( denominator != 0) {

				let lamda01 = numerator01 / denominator;
				let lambda23 = numerator23 / denominator;
				if (lamda01 >= 0 && lamda01 <= 1 &&
					lambda23 >= 0 && lambda23 <= 1) {

						intersections++;
					}

				
			} 
			// else if (denominator == 0 && numerator01 == 0 && numerator23 == 0) { // coincident
			// 	// not sure ... need to check if p0 lies between p2-p3
			// 	intersections++;
			// }

			// odd intersections means point inside, even => point outside
			if ( (intersections % 2) == 1 ) {
				return true;
			}
			
			
		
		}

		return false;

	}
	

	
	
  }

export default GeomUtils;