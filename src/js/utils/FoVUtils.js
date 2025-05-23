"use strict";
/**
 * @author Fabrizio Giordano (Fab)
 */

// !!!!!!!!!!!
//TODO USE GLOBAL to get GL and Canvas instead of passing it as param all over!!!
import Point from './Point.js';
import RayPickingUtils from './RayPickingUtils.js';
import CoordsType from './CoordsType.js';
import {vec3, mat4} from 'gl-matrix';

class FoVUtils {
	
	// constructor(in_fovX = 180, in_fovY = 180){
	// 	console.error("USED!!!");
	// 	this._fovX_deg = in_fovX;
	// 	this._fovY_deg = in_fovY;
	// }
	
	// computeAngle (canvasX, canvasY, in_pMatrix, in_camera, in_model, in_canvas,
	// 		in_raypicker){
		
	// 	var rayWorld = vec3.create();
	// 	var intersectionDistance = 0;
	// 	var intersectionPoint = vec3.create();
	// 	var center = vec3.create();
	// 	var intersectionPoint_center_vector = vec3.create();
	// 	var b = vec3.create();
	// 	var scal_prod = vec3.create();
	// 	var b_center_vector = vec3.create();
	// 	var intersectionPoint_center_vector_norm = vec3.create();
	// 	var b_center_vector_norm = vec3.create();
	// 	var cos_angle = 0;
	// 	var angle_rad = 0;
	// 	var angle_deg = 0;

	// 	rayWorld = in_raypicker.getRayFromMouse(canvasX, canvasY, in_pMatrix, 
	// 			in_camera.getCameraMatrix(), in_canvas);
		
	// 	intersectionDistance = in_raypicker.raySphere(in_camera.getCameraPosition(), 
	// 			rayWorld, in_model);
	// 	console.log("[FoVUtils::computeAngle] intersectionDistance "+intersectionDistance 
	// 			+ "against object "+in_model.name);
		
	// 	if (intersectionDistance > 0){
			
	// 		vec3.scale(intersectionPoint, rayWorld, intersectionDistance);
	// 		vec3.add(intersectionPoint, in_camera.getCameraPosition(), intersectionPoint);
			
	// 		center = in_model.center;
			
	// 		vec3.subtract(intersectionPoint_center_vector, intersectionPoint, center);
			
	// 		b = vec3.create( [in_model.center[0], in_model.center[1], in_model.center[2] + in_model.radius] );
			
	// 		vec3.subtract(b_center_vector, b, center);
			
			
	// 		scal_prod = vec3.dot(intersectionPoint_center_vector, b_center_vector);
	// 		intersectionPoint_center_vector_norm = Math.sqrt(
	// 				intersectionPoint_center_vector[0]*intersectionPoint_center_vector[0] + 
	// 				intersectionPoint_center_vector[1]*intersectionPoint_center_vector[1] + 
	// 				intersectionPoint_center_vector[2]*intersectionPoint_center_vector[2]);
			
	// 		b_center_vector_norm = Math.sqrt(
	// 				b_center_vector[0]*b_center_vector[0] + 
	// 				b_center_vector[1]*b_center_vector[1] + 
	// 				b_center_vector[2]*b_center_vector[2]);
			
	// 		cos_angle = scal_prod / (intersectionPoint_center_vector_norm * b_center_vector_norm);
	// 		angle_rad = Math.acos(cos_angle);
	// 		angle_deg = 2 * radToDeg(angle_rad);
			
	// 	}else{
	// 		angle_deg = 180;
	// 	}
	// 	return angle_deg;
	// }
	
	// getFoV (in_canvas, in_pMatrix, in_camera, in_model, in_raypicker){

	// 	// horizontal FoV 
	// 	this._fovX_deg = this.computeAngle(0, in_canvas.height / 2, in_pMatrix, in_camera, in_model, in_canvas, in_raypicker);
	// 	// vertical FoV 
	// 	this._fovY_deg = this.computeAngle(in_canvas.width / 2, 0, in_pMatrix, in_camera, in_model, in_canvas, in_raypicker);
				
	// 	return [this._fovX_deg, this._fovY_deg];

	// }
	
	/** 
	 * return the minimum fov value between _fovY_deg and _fovX_deg
	 */
	getMinFoV (){
		return (this._fovY_deg <= this._fovX_deg) ? this._fovY_deg : this._fovX_deg;
	}
	
	/** raypicking on screen [0, 0] corner to check if HiPS covers the full screen
	if raypicking returns a valid point
		do raypicking on 4 screen corners and middle points
		return the points (8 in total)
	else
		do raypicking on screen [0, height/2]
		if raypicking returns a valid point
			compute middle top and bottom points
			compute intersection between frustrum and HiPS sphere using getFoVPolygonWithPlanes
		else
			compute intersection between frustum plane normal passing through the HiPS center
				and the HiPS (1 point).
			compute the middle point in the arc between the perpendicular plane and the point above (1 point)
			
		do raypicking on screen [0, width/2]
		if raypicking returns a valid point
			compute middle top and bottom points
			compute intersection between frustrum and HiPS sphere using getFoVPolygonWithPlanes
		else
			compute intersection between frustum plane normal passing through the HiPS center
				and the HiPS (1 point).
			compute the middle point in the arc between the perpendicular plane and the point above (1 point)

	 */
	static getFoVPolygon (in_pMatrix, in_cameraObj, in_gl_canvas, in_modelObj){
//		static getFoVPolygon (in_pMatrix, in_cameraObj, in_gl_canvas, in_modelObj, in_raypicker){

		var in_vMatrix = in_cameraObj.getCameraMatrix();
		var in_mMatrix = in_modelObj.getModelMatrix();
		var canvasWidth = in_gl_canvas.clientWidth;
		var canvasHeight = in_gl_canvas.clientHeight;
		
		var points = [];
		
		// Starting FIRST type of check
		var intersectionWithModel = RayPickingUtils.getIntersectionPointWithSingleModel(0, 0);
		
		// the screen is fully covered by the sphere. (CASE C) 
		if (intersectionWithModel.intersectionPoint.length > 0){
			let cornersPoints = FoVUtils.getScreenCornersIntersection(in_pMatrix, in_cameraObj, in_gl_canvas, in_modelObj);
			
			points = cornersPoints;
			console.warn("CASE C")
			
		}else{
			// Starting SECOND type of check
			let A = 0, 
			B = 0, 
			C = 0, 
			D = 0,
			M = mat4.create(),
			topPlaneNormal = [], 
			bottomPlaneNormal = [],
			rightPlaneNormal = [],
			leftPlaneNormal = [];
			
			let topPoints = [],
			bottomPoints = [],
			leftPoints = [],
			rightPoints = [],
			// intermidiate points
			middleLeftTop = [],
			middleTopRight = [],
			middleRightBottom = [],
			middleBottomLeft = [];
			
			M = mat4.multiply(M, in_vMatrix, in_mMatrix);
			M = mat4.multiply(M, in_pMatrix, M);
			
			// top plane normal
			
			A = M[3] - M[1];	// A = m41 - m21
			B = M[7] - M[5];	// B = m42 - m22
			C = M[11] - M[9];	// C = m43 - m23
			D = M[15] - M[13];	// D = m44 - m24
			topPlaneNormal = [M[3] - M[1], M[7] - M[5], M[11] - M[9], M[15] - M[13]];
			// bottom plane normal
			A = M[3] + M[1];	// A = m41 + m21
			B = M[7] + M[5];	// B = m42 + m22
			C = M[11] + M[9];	// C = m43 + m23
			D = M[15] + M[13];	// D = m44 + m24 
			bottomPlaneNormal = [M[3] + M[1], M[7] + M[5], M[11] + M[9], M[15] + M[13]];
			// right plane normal
			A = M[3] - M[0];	// A = m41 - m11
			B = M[7] - M[4];	// B = m42 - m12
			C = M[11] - M[8];	// C = m43 - m13
			D = M[15] - M[12];	// D = m44 - m14
			rightPlaneNormal = [M[3] - M[0], M[7] - M[4], M[11] - M[8], M[15] - M[12]];
			// left plane normal
			A = M[3] + M[0];	// A = m41 + m11
			B = M[7] + M[4];	// B = m42 + m12
			C = M[11] + M[8];	// C = m43 + m13
			D = M[15] + M[12];	// D = m44 + m14
			leftPlaneNormal = [M[3] + M[0], M[7] + M[4], M[11] + M[8], M[15] + M[12]];
	
			let intersectionTopMiddle = RayPickingUtils.getIntersectionPointWithSingleModel(canvasWidth/2, 0);
			let intersectionRightMiddle = RayPickingUtils.getIntersectionPointWithSingleModel(canvasWidth, canvasHeight/2);
	
			
			// zoomed out. half emisphere fully visible (CASE A) 
			// TODO N.B. this is the less precise algo. To make more precise, instead of computing the middle point between 2 points, 
			// it would be better to divide such segment into 3 or 4 and compute more intersection points with the sphere.
			if (intersectionTopMiddle.intersectionPoint.length == 0 && intersectionRightMiddle.intersectionPoint.length == 0){
				console.warn("CASE A")
				topPoints = FoVUtils.getNearestSpherePoint(topPlaneNormal);
				bottomPoints = FoVUtils.getNearestSpherePoint(bottomPlaneNormal);
				leftPoints = FoVUtils.getNearestSpherePoint(leftPlaneNormal);
				rightPoints = FoVUtils.getNearestSpherePoint(rightPlaneNormal);
				// computing intermidiate points
				middleLeftTop = FoVUtils.computeMiddlePoint(leftPoints[0], topPoints[0]);
				middleTopRight = FoVUtils.computeMiddlePoint(topPoints[0], rightPoints[0]);
				middleRightBottom = FoVUtils.computeMiddlePoint(rightPoints[0], bottomPoints[0]);
				middleBottomLeft = FoVUtils.computeMiddlePoint(bottomPoints[0], leftPoints[0]);
				// 8 points in total
				points.push(topPoints[0], middleTopRight[0], rightPoints[0], middleRightBottom[0], bottomPoints[0], middleBottomLeft[0], leftPoints[0], middleLeftTop[0]);
				
			} else if(intersectionTopMiddle.intersectionPoint.length == 0){
				// No intersection between top/bottom frustum planes and the sphere (CASE E)
				console.warn("CASE E")
				topPoints = FoVUtils.getNearestSpherePoint(topPlaneNormal);
				bottomPoints = FoVUtils.getNearestSpherePoint(bottomPlaneNormal);
				leftPoints = FoVUtils.getFrustumIntersectionWithSphere(M, leftPlaneNormal, bottomPlaneNormal, topPlaneNormal);
				rightPoints = FoVUtils.getFrustumIntersectionWithSphere(M, rightPlaneNormal, topPlaneNormal, bottomPlaneNormal);
				// computing intermidiate points
				middleLeftTop = FoVUtils.computeMiddlePoint(leftPoints[1], topPoints[0]);
				middleTopRight = FoVUtils.computeMiddlePoint(topPoints[0], rightPoints[0]);
				middleRightBottom = FoVUtils.computeMiddlePoint(rightPoints[1], bottomPoints[0]);
				middleBottomLeft = FoVUtils.computeMiddlePoint(bottomPoints[0], leftPoints[0]);
				// 10 points in total
				points.push(topPoints[0], middleTopRight[0], rightPoints[0], rightPoints[1], middleRightBottom[0], bottomPoints[0], middleBottomLeft[0], leftPoints[0], leftPoints[1], middleLeftTop[0]);
			
			} else if(intersectionRightMiddle.intersectionPoint.length == 0){
				console.warn("CASE D")
				// No intersection between right/left frustum planes and the sphere (CASE D)
				topPoints = FoVUtils.getFrustumIntersectionWithSphere(M, topPlaneNormal, leftPlaneNormal, rightPlaneNormal);
				bottomPoints = FoVUtils.getFrustumIntersectionWithSphere(M, bottomPlaneNormal, rightPlaneNormal, leftPlaneNormal);
				leftPoints = FoVUtils.getNearestSpherePoint(leftPlaneNormal);
				rightPoints = FoVUtils.getNearestSpherePoint(rightPlaneNormal);
				// computing intermidiate points
				middleLeftTop = FoVUtils.computeMiddlePoint(leftPoints[0], topPoints[0]);
				middleTopRight = FoVUtils.computeMiddlePoint(topPoints[1], rightPoints[0]);
				middleRightBottom = FoVUtils.computeMiddlePoint(rightPoints[0], bottomPoints[0]);
				middleBottomLeft = FoVUtils.computeMiddlePoint(bottomPoints[1], leftPoints[0]);
				// 10 points in total
				points.push(topPoints[0], topPoints[1], middleTopRight[0], rightPoints[0], middleRightBottom[0], bottomPoints[0], bottomPoints[1], middleBottomLeft[0], leftPoints[0], middleLeftTop[0]);
				
			} else {
				console.warn("CASE B")
				// all frustum planes intersect with the sphere, but the the screen is not fully covered. (CASE B)
				topPoints = FoVUtils.getFrustumIntersectionWithSphere(M, topPlaneNormal, leftPlaneNormal, rightPlaneNormal);
				bottomPoints = FoVUtils.getFrustumIntersectionWithSphere(M, bottomPlaneNormal, rightPlaneNormal, leftPlaneNormal);
				leftPoints = FoVUtils.getFrustumIntersectionWithSphere(M, leftPlaneNormal, bottomPlaneNormal, topPlaneNormal);
				rightPoints = FoVUtils.getFrustumIntersectionWithSphere(M, rightPlaneNormal, topPlaneNormal, bottomPlaneNormal);
				// 8 points in total
				points.push(topPoints[0], topPoints[1], rightPoints[0], rightPoints[1], bottomPoints[0], bottomPoints[1], leftPoints[0], leftPoints[1]);
				
			}
	
		}
		
		// var i = 0;
		// for (i = 0; i < points.length; i++){
		// 	console.log("("+points[i].raDeg+", "+points[i].decDeg+")");
		// }
		
		return points;
		
	}
	
	
	/** 
	 * by  using raypicking, it computes the intersection points between the HiPS sphere and the corners and middle points 
	 * of the screen:
	 * top:		(0,0), (canvasWidth/2,0), (canvasWidth,0)
	 * right:	(canvasWidth, canvasHeight/2)
	 * bottom:	(canvasWidth,canvasHeight), (canvasWidth/2,canvasHeight), (0, canvasHeight)
	 * left:	(0, canvasHeight/2)
	 *  
	 * return an array of intersection points in clockwise order. Top left point is in position 0
	 */
	static getScreenCornersIntersection(in_pMatrix, in_cameraObj, in_gl_canvas, in_modelObj){
//		static getScreenCornersIntersection(in_pMatrix, in_cameraObj, in_gl_canvas, in_modelObj, in_raypicker){
		
		let topLeft = null,
		topRight = null,
		bottomRight = null,
		bottomLeft = null,
		middleTop = null,
		middleBottom = null,
		middleLeft = null,
		middleRight = null; 
		let in_vMatrix = in_cameraObj.getCameraMatrix();
		let canvasWidth = in_gl_canvas.clientWidth;
		let canvasHeight = in_gl_canvas.clientHeight;
		
		let points = [];
		// TODO The code below can be replaced by 2 nested for loops 
		
		// Screen top
		
		topLeft = RayPickingUtils.getIntersectionPointWithSingleModel(0, 0);
		
		middleTop = RayPickingUtils.getIntersectionPointWithSingleModel(canvasWidth/2, 0);
		
		topRight = RayPickingUtils.getIntersectionPointWithSingleModel(canvasWidth, 0);
		
		
		// screen middle right
		middleRight = RayPickingUtils.getIntersectionPointWithSingleModel(canvasWidth, canvasHeight/2);
		
		// screen bottom
		bottomRight = RayPickingUtils.getIntersectionPointWithSingleModel(canvasWidth, canvasHeight);
		
		middleBottom = RayPickingUtils.getIntersectionPointWithSingleModel(canvasWidth/2, canvasHeight);
		
		bottomLeft = RayPickingUtils.getIntersectionPointWithSingleModel(0, canvasHeight);
		
		// screen middle left
		middleLeft = RayPickingUtils.getIntersectionPointWithSingleModel(0, canvasHeight/2);
		

		
		if (topLeft.intersectionPoint.length > 0){
//			points.push(new Point(topLeft.intersectionPoint));
			points.push(new Point({
				"x": topLeft.intersectionPoint[0],
				"y": topLeft.intersectionPoint[1],
				"z": topLeft.intersectionPoint[2]
			}, CoordsType.CARTESIAN));
		}
		if (middleTop.intersectionPoint.length > 0){
//			points.push(new Point(middleTop.intersectionPoint));
			points.push(new Point({
				"x": middleTop.intersectionPoint[0],
				"y": middleTop.intersectionPoint[1],
				"z": middleTop.intersectionPoint[2]
			}, CoordsType.CARTESIAN));
		}
		if (topRight.intersectionPoint.length > 0){
//			points.push(new Point(topRight.intersectionPoint));
			points.push(new Point({
				"x": topRight.intersectionPoint[0],
				"y": topRight.intersectionPoint[1],
				"z": topRight.intersectionPoint[2]
			}, CoordsType.CARTESIAN));
		}
		if (middleRight.intersectionPoint.length > 0){
//			points.push(new Point(middleRight.intersectionPoint));
			points.push(new Point({
				"x": middleRight.intersectionPoint[0],
				"y": middleRight.intersectionPoint[1],
				"z": middleRight.intersectionPoint[2]
			}, CoordsType.CARTESIAN));
		}
		if (bottomRight.intersectionPoint.length > 0){
//			points.push(new Point(bottomRight.intersectionPoint));
			points.push(new Point({
				"x": bottomRight.intersectionPoint[0],
				"y": bottomRight.intersectionPoint[1],
				"z": bottomRight.intersectionPoint[2]
			}, CoordsType.CARTESIAN));
		}
		if (middleBottom.intersectionPoint.length > 0){
//			points.push(new Point(middleBottom.intersectionPoint));
			points.push(new Point({
				"x": middleBottom.intersectionPoint[0],
				"y": middleBottom.intersectionPoint[1],
				"z": middleBottom.intersectionPoint[2]
			}, CoordsType.CARTESIAN));
		}
		if (bottomLeft.intersectionPoint.length > 0){
//			points.push(new Point(bottomLeft.intersectionPoint));
			points.push(new Point({
				"x": bottomLeft.intersectionPoint[0],
				"y": bottomLeft.intersectionPoint[1],
				"z": bottomLeft.intersectionPoint[2]
			}, CoordsType.CARTESIAN));
		}
		if (middleLeft.intersectionPoint.length > 0){
//			points.push(new Point(middleLeft.intersectionPoint));
			points.push(new Point({
				"x": middleLeft.intersectionPoint[0],
				"y": middleLeft.intersectionPoint[1],
				"z": middleLeft.intersectionPoint[2]
			}, CoordsType.CARTESIAN));
		}

		return points;
	}

	
	/**
	 * @returns center of type Point.js
 	 */
	static getCenterJ2000(canvas) {
		
		let canvasWidth = canvas.clientWidth;
		let canvasHeight = canvas.clientHeight;

		let center_xyz = RayPickingUtils.getIntersectionPointWithSingleModel(canvasWidth/2, canvasHeight/2);
		let center = new Point({
			"x": center_xyz.intersectionPoint[0],
			"y": center_xyz.intersectionPoint[1],
			"z": center_xyz.intersectionPoint[2]
		}, CoordsType.CARTESIAN);

		return center;
	}


	static computeMiddlePoint (point1, point2){
		var points = [];
		var x_s = 0,
		y_s = 0,
		z_s = 0;	// sphere center
		var R = 1;	// sphere radius
		var l, m, n;
		var x_m, y_m, z_m;	// coordinates of the middle point of the segment point1-point2 
		x_m = (point1.x + point2.x) / 2;
		y_m = (point1.y + point2.y) / 2;
		z_m = (point1.z + point2.z) / 2;
		
		l = x_m - x_s;
		m = y_m - y_s;
		n = z_m - z_s;
		
		var den = Math.sqrt(l*l + m*m + n*n);
		var x_1 = x_s + (R * l) / den;
		var y_1 = y_s + (R * m) / den;
		var z_1 = z_s + (R * n) / den;
		var dist_1_M = Math.sqrt( (x_1-x_m)*(x_1-x_m) + (y_1-y_m)*(y_1-y_m) + (z_1-z_m)*(z_1-z_m) );
		
		var x_2 = x_s - (R * l) / den;
		var y_2 = y_s - (R * m) / den;
		var z_2 = z_s - (R * n) / den;
		var dist_2_M = Math.sqrt( (x_2-x_m)*(x_2-x_m) + (y_2-y_m)*(y_2-y_m) + (z_2-z_m)*(z_2-z_m) );
		
		
		
		if (dist_1_M < dist_2_M){
//			points.push(new Point([x_1, y_1, z_1]));
			points.push(new Point({
				"x": x_1,
				"y": y_1,
				"z": z_1
			}, CoordsType.CARTESIAN));
		}else{
//			points.push(new Point([x_2, y_2, z_2]));
			points.push(new Point({
				"x": x_2,
				"y": y_2,
				"z": z_2
			}, CoordsType.CARTESIAN));
		}
		return points;
		
	}


	/** 
	 * This function returns the nearest intersection point between one frustum plane
	 * and the sphere using the normal to the plane.
	 */ 
	static getNearestSpherePoint(plane){
		
		var points = [];
		var P_intersection = null;
		
		var A = plane[0],
		B = plane[1],
		C = plane[2],
		D = plane[3];
		
		var x_s = 0,
		y_s = 0,
		z_s = 0,	// center of the sphere
		R = 1;	// radius of the sphere
		
		var t1 = R * Math.sqrt( 1 / (A*A + B*B + C*C));
		var t2 = - 1 * R * Math.sqrt( 1 / (A*A + B*B + C*C));
		
		var P_1 = [x_s + A * t1, y_s + B * t1, z_s + C * t1];
		var P_2 = [x_s + A * t2, y_s + B * t2, z_s + C * t2];

		// P_1 distance from plane plane4Circle_1 
		var den = Math.sqrt(A*A + B*B + C*C);
		var dist_1 = Math.abs( A * P_1[0] + B * P_1[1] + C * P_1[2] + D ) / den;
		var dist_2 = Math.abs( A * P_2[0] + B * P_2[1] + C * P_2[2] + D ) / den;

		P_intersection = P_2;
		if (dist_1 <= dist_2 ){
			P_intersection = P_1;
		}
		
		
//		points.push(new Point(P_intersection));
		points.push(new Point({
			"x": P_intersection[0],
			"y": P_intersection[1],
			"z": P_intersection[2]
		}, CoordsType.CARTESIAN));
		
		return points;
		
	}


	/**
	 * it computes the intersection points between the sphere and a plane of the frustum (plane4Sphere).
	 * To do that, the algo uses 2 perpendicular frustum planes to compute the nearest point to them.
	 * input:
	 * 	M: P * V * M matrice
	 * 	plane4Sphere: the plane the result points belong to	(e.g. top plane)
	 * 	plane4Circle_1: perpendicular plane to plane4Sphere to compute the nearest point to plane4Circle_1 (e.g. left plane)
	 * 	plane4Circle_2: perpendicular plane to plane4Sphere to compute the nearest point to plane4Circle_2 (e.g. right plane)
	 * 
	 * returns an array of 2 intersection points, first point computed with plane4Circle_1 and the second with plane4Circle_2
	 */
	static getFrustumIntersectionWithSphere (M, plane4Sphere, plane4Circle_1, plane4Circle_2){
		
		var P_intersection_1 = null,
		P_intersection_2 = null;
		var points = [];
		
		var A = plane4Sphere[0];
		var B = plane4Sphere[1];
		var C = plane4Sphere[2];
		var D = plane4Sphere[3]; 
		
		var x_s = 0,
		y_s = 0,
		z_s = 0;
		
		var R_s = 1;
		var x_c = x_s - (A * (A * x_s + B * y_s + C * z_s + D) / ( A * A + B * B + C * C));
		var y_c = y_s - (B * (A * x_s + B * y_s + C * z_s + D) / ( A * A + B * B + C * C));
		var z_c = z_s - (C * (A * x_s + B * y_s + C * z_s + D) / ( A * A + B * B + C * C));
		var d = Math.abs(A * x_s + B * y_s + C * z_s + D) / Math.sqrt( A * A + B * B + C * C);
		
		
		if (R_s > d){	// center of circle inside the sphere
			let r = Math.sqrt( R_s * R_s - ( d * d ) );
		
			A = plane4Circle_1[0];
			B = plane4Circle_1[1];
			C = plane4Circle_1[2];
			D = plane4Circle_1[3]; 
			
			let t1 = r * Math.sqrt( 1 / (A*A + B*B + C*C));
			let t2 = - 1 * r * Math.sqrt( 1 / (A*A + B*B + C*C));
			
			let P_1 = [x_c + A * t1, y_c + B * t1, z_c + C * t1];
			let P_2 = [x_c + A * t2, y_c + B * t2, z_c + C * t2];

			// P_1 distance from plane plane4Circle_1 
			let den = Math.sqrt(A*A + B*B + C*C);
			let dist_1 = Math.abs( A * P_1[0] + B * P_1[1] + C * P_1[2] + D ) / den;
			let dist_2 = Math.abs( A * P_2[0] + B * P_2[1] + C * P_2[2] + D ) / den;

			P_intersection_1 = P_2;
			if (dist_1 <= dist_2 ){
				P_intersection_1 = P_1;
			}
			
			
			console.log("from plane 1 -> P_intersection_1: "+P_intersection_1);
			
			A = plane4Circle_2[0];
			B = plane4Circle_2[1];
			C = plane4Circle_2[2];
			D = plane4Circle_2[3]; 
			
			t1 = r * Math.sqrt( 1 / (A*A + B*B + C*C));
			t2 = - 1 * r * Math.sqrt( 1 / (A*A + B*B + C*C));
			
			P_1 = [x_c + A * t1, y_c + B * t1, z_c + C * t1];
			P_2 = [x_c + A * t2, y_c + B * t2, z_c + C * t2];
			
			// P_1 distance from plane plane4Circle_1 
			den = Math.sqrt(A*A + B*B + C*C);
			dist_1 = Math.abs( A * P_1[0] + B * P_1[1] + C * P_1[2] + D ) / den;
			dist_2 = Math.abs( A * P_2[0] + B * P_2[1] + C * P_2[2] + D ) / den;

			P_intersection_2 = P_2;
			if (dist_1 <= dist_2 ){
				P_intersection_2 = P_1;
			}
			console.log("from plane 2 -> P_intersection_2: "+P_intersection_2);
			
		}else if ( R_s == d){	// center of circle tangent to the sphere
			let r = 0;
			
			A = plane4Circle_1[0];
			B = plane4Circle_1[1];
			C = plane4Circle_1[2];
			D = plane4Circle_1[3]; 
			
			let P_1 = P_2 = [x_c, y_c, z_c];
			P_intersection_1 = P_intersection_2 = P_1; 
			
		}else{	// center of circle outside the sphere 
			console.log("Top frustum plane not intersecting the sphere");
			P_intersection_1 = P_intersection_2 = null;
		}
//		points.push(new Point(P_intersection_1));
		points.push(new Point({
			"x": P_intersection_1[0],
			"y": P_intersection_1[1],
			"z": P_intersection_1[2]	
		}, CoordsType.CARTESIAN));
		
//		points.push(new Point(P_intersection_2));
		points.push(new Point({
			"x": P_intersection_2[0],
			"y": P_intersection_2[1],
			"z": P_intersection_2[2]	
		}, CoordsType.CARTESIAN));
		
		return points;
	}
	
	
	static getAstroFoVPolygon(points){
		var poly = "";
		var i = 0;
		var point;
		for (i = 0; i < points.length; i++){
			point = points[i];
			poly += point.toADQL();
			if (i < points.length - 1){
				poly += ",";
			}
		}
		return poly;
	}
	
}

export default FoVUtils;





