"use strict";

import {vec3, vec4, mat4} from 'gl-matrix';

import global from '../../Global.js';
import { fovHelper } from '../hipsnew/FoVHelper.js';
import {degToRad} from '../../utils/Utils.js';
import GridShaderManager from '../../shaders/GridShaderManager.js';
import Point from '../../utils/Point.js';
import CoordsType from '../../utils/CoordsType.js';
import FoVUtils from '../../utils/FoVUtils.js';
import FoV from '../FoV.js';
// import AbstractGrid from './AbstractGrid.js';
import { gridTextHelper } from './GridTextHelper.js';

// class EquatorialGrid extends AbstractGrid {
    class EquatorialGrid {

	static ELEM_SIZE;
	static BYTES_X_ELEM;

    /**
     * 
     * @param {double} radius 
     * @param {double} fov
     */
    constructor(radius, fov) {

		// super(radius, fov);

		EquatorialGrid.ELEM_SIZE = 3;
		EquatorialGrid.BYTES_X_ELEM = new Float32Array().BYTES_PER_ELEMENT;

		this._viewmatrix = undefined;

		
		this._shaderProgram = global.gl.createProgram();
		this.initShaders();
		
        this._attribLocations = {};
		this._nPrimitiveFlags = 0;
		this._totPoints = 0;
		
		
        this._phiVertexPositionBuffer = global.gl.createBuffer();
        // this._indexBuffer = global.gl.createBuffer();
		this._thetaVertexPositionBuffer = global.gl.createBuffer();
		// this._indexBuffer = global.gl.createBuffer();
		
		this._attribLocations = {
				position: 0,
				selected: 1,
				pointSize: 2,
				color: [0.0, 1.0, 0.0, 1.0]
		};

        this._fov = fov;
        this._phiArray = [];
		this._thetaArray = [];
		
		this.initBuffers(fov);
        // this.initHtml();
	}

	initShaders() {

		let fragmentShaderStr = GridShaderManager.healpixGridFS();
		this.fragmentShader = global.gl.createShader(global.gl.FRAGMENT_SHADER);
		global.gl.shaderSource(this.fragmentShader, fragmentShaderStr);
		global.gl.compileShader(this.fragmentShader);
		if (!global.gl.getShaderParameter(this.fragmentShader, global.gl.COMPILE_STATUS)) {
			alert(global.gl.getShaderInfoLog(this.fragmentShader));
			return null;
		}

		let vertexShaderStr = GridShaderManager.healpixGridVS();
		this.vertexShader = global.gl.createShader(global.gl.VERTEX_SHADER);
		global.gl.shaderSource(this.vertexShader, vertexShaderStr);
		global.gl.compileShader(this.vertexShader);
		if (!global.gl.getShaderParameter(this.vertexShader, global.gl.COMPILE_STATUS)) {
			alert(global.gl.getShaderInfoLog(this.vertexShader));
			return null;
		}

		global.gl.attachShader(this._shaderProgram, this.vertexShader);
		global.gl.attachShader(this._shaderProgram, this.fragmentShader);
		global.gl.linkProgram(this._shaderProgram);

		if (!global.gl.getProgramParameter(this._shaderProgram, global.gl.LINK_STATUS)) {
			alert("Could not initialise shaders");
		}
		global.gl.useProgram(this._shaderProgram);

	}

	initBuffers (fov) {

        
        let x, y, z;
        let phiVertexPosition, thetaVertexPosition;
		let thetaRad, phiRad;
		let R = 1.0;

        // let phiStep = 10;
		// let thetaStep = 10;
		let steps = fovHelper.getRADegSteps(fov);
        let phiStep = steps.raStep;
		let thetaStep = steps.decStep;

        this._phiStep  = phiStep;
        this._phiStepRad  = degToRad(phiStep);
        this._ra4Labels = new Map();

        this._thetaStep  = thetaStep;
        this._thetaStepRad  = degToRad(thetaStep);
        this._dec4Labels = new Map();

        this._phiArray = [];
		this._thetaArray = [];

        // phi section (for RA lines)
        for (let theta = thetaStep; theta < 180; theta += thetaStep){
			
			phiVertexPosition = new Float32Array(360/phiStep * 3);
			
			thetaRad = degToRad(theta);

			for (let phi = 0; phi <360; phi += phiStep){

				phiRad = degToRad(phi);
				
				x = R * Math.sin(thetaRad) * Math.cos(phiRad);
				y = R * Math.sin(thetaRad) * Math.sin(phiRad);
				z = R * Math.cos(thetaRad);
				
                let phiDphiStep = Math.floor(phi/phiStep);
				phiVertexPosition[ 3 * phiDphiStep] = x; 
				phiVertexPosition[ 3 * phiDphiStep + 1] = y;
				phiVertexPosition[ 3 * phiDphiStep + 2] = z;
				
                if (!this._dec4Labels.has(phi)) {
                    this._dec4Labels.set(phi, []);
                }
                this._dec4Labels.get(phi).push([x, y, z]);
			}
			
			this._phiArray.push(phiVertexPosition);

		}
		
		for (var phi = 0; phi <360; phi += phiStep){
						
			thetaVertexPosition = new Float32Array(360/thetaStep * 3);
			
			phiRad = degToRad(phi);
			
			for (var theta = 0; theta <360; theta += thetaStep){
				
				thetaRad = degToRad(theta);
				
				x = R * Math.sin(thetaRad) * Math.cos(phiRad);
				y = R * Math.sin(thetaRad) * Math.sin(phiRad);
				z = R * Math.cos(thetaRad);
				
				let thetaDthetaStep = Math.floor(theta/thetaStep);
				thetaVertexPosition[ 3 * thetaDthetaStep] = x; 
				thetaVertexPosition[ 3 * thetaDthetaStep + 1] = y;
				thetaVertexPosition[ 3 * thetaDthetaStep + 2] = z;
	
                if (!this._ra4Labels.has(90 - theta)) {
                    this._ra4Labels.set(90 - theta, []);
                }
                this._ra4Labels.get(90 - theta).push([x, y, z]);
			}
			
			this._thetaArray.push(thetaVertexPosition);
			
		}

		// console.log("Buffer initialized");
		
	}

    /**
     * 
     * @param {FoV} fovObj 
     */
	refresh(fov) {

        if (this._fov !== fov){
            
            this._fov = fov;
            this.initBuffers(this._fov);
            
        }
		
	}


    vectorDistance(p1, p2) {
        let r = Math.sqrt( (p1.x - p2.x)**2 + (p1.y - p2.y)**2 + (p1.z - p2.z)**2 );
        return r;
    }
	

	enableShader(mMatrix){

		global.gl.useProgram(this._shaderProgram);
		this._shaderProgram.catUniformMVMatrixLoc = global.gl.getUniformLocation(this._shaderProgram, "uMVMatrix");
		this._shaderProgram.catUniformProjMatrixLoc = global.gl.getUniformLocation(this._shaderProgram, "uPMatrix");
		this._attribLocations.position  = global.gl.getAttribLocation(this._shaderProgram, 'aCatPosition');
		
		let mvMatrix = mat4.create();
		mvMatrix = mat4.multiply(mvMatrix, global.camera.getCameraMatrix(), mMatrix);
		global.gl.uniformMatrix4fv(this._shaderProgram.catUniformMVMatrixLoc, false, mvMatrix);
		global.gl.uniformMatrix4fv(this._shaderProgram.catUniformProjMatrixLoc, false, global.pMatrix);

	}


    /**
	 * @param mMatrix:
	 *            model matrix the current catalogue is associated to (e.g. HiPS
	 *            matrix)
	 */
    
    draw(mMatrix, fovObj){
				
		if (this._thetaArray.length == 0) {
			return;
		}
        this.refresh(fovObj);

        this.enableShader(mMatrix);
    
        // TODO change to drawElements with GL_PRIMITIVE
        for (var i = 0; i < this._phiArray.length; i++){
            global.gl.bindBuffer(global.gl.ARRAY_BUFFER, this._phiVertexPositionBuffer);
            global.gl.bufferData(global.gl.ARRAY_BUFFER, this._phiArray[i], global.gl.STATIC_DRAW);
            global.gl.vertexAttribPointer(this._attribLocations.position, 3, global.gl.FLOAT, false, 0, 0);
            global.gl.enableVertexAttribArray(this._attribLocations.position);

            global.gl.drawArrays(global.gl.LINE_LOOP, 0, 360/this._phiStep);
		}

        // TODO change to drawElements with GL_PRIMITIVE
        for (var j = 0; j < this._thetaArray.length; j++){
		
			global.gl.bindBuffer(global.gl.ARRAY_BUFFER, this._thetaVertexPositionBuffer);
			global.gl.bufferData(global.gl.ARRAY_BUFFER, this._thetaArray[j], global.gl.STATIC_DRAW);
			global.gl.vertexAttribPointer(this._attribLocations.position, 3, global.gl.FLOAT, false, 0, 0);
			global.gl.enableVertexAttribArray(this._attribLocations.position);

			global.gl.drawArrays(global.gl.LINE_LOOP, 0, 360/this._thetaStep);
			
		}


        let center = FoVUtils.getCenterJ2000(global.gl.canvas);
        let mvMatrix = mat4.create();
        mvMatrix = mat4.multiply(mvMatrix, global.camera.getCameraMatrix(), mMatrix);
        let mvpMatrix = mat4.create();
        mvpMatrix = mat4.multiply(mvpMatrix, global.pMatrix, mvMatrix);


        

        for (const [radegkey, points] of this._dec4Labels.entries()) {
            if (Math.abs(radegkey - center._raDeg) <= this._phiStep ) {
                
                for (let p = 0; p < points.length; p++) {
                
                    let phiPoint = [points[p][0], points[p][1], points[p][2], 1]; // ref point for the label
                    let point = new Point({"x": points[p][0], "y": points[p][1], "z": points[p][2]}, CoordsType.CARTESIAN);
                
                    
                    
                    // position the div
                    let decDeg = point._decDeg;
                    if (Math.abs(decDeg - center._decDeg) < 60 ) {
                        // https://webglfundamentals.org/webgl/lessons/webgl-text-html.html
                        let clipspace = vec4.create();
                        vec4.transformMat4(clipspace, phiPoint, mvpMatrix);

                        // divide X and Y by W just like the GPU does.
                        clipspace[0] /= clipspace[3];
                        clipspace[1] /= clipspace[3];

                        // convert from clipspace to pixels
                        let pixelX = (clipspace[0] *  0.5 + 0.5) * global.gl.canvas.width;
                        let pixelY = (clipspace[1] * -0.5 + 0.5) * global.gl.canvas.height;
                        gridTextHelper.addEqDivSet(decDeg.toFixed(2), pixelX, pixelY, 'dec');
                    }
                    
                        
                }

            }

        }
        
        for (const [decdegkey, points] of this._ra4Labels.entries()) {
            if (Math.abs(decdegkey - center._decDeg) <= this._thetaStep ) {
                
                for (let p = 0; p < points.length; p++) {
                
                    let phiPoint = [points[p][0], points[p][1], points[p][2], 1]; // ref point for the label
                    let point = new Point({"x": points[p][0], "y": points[p][1], "z": points[p][2]}, CoordsType.CARTESIAN);
                
                    let d = this.vectorDistance(point, center);
                    
                    // // position the div
                    let raDeg = point._raDeg;

                    if (d < degToRad(50)) {
                        // https://webglfundamentals.org/webgl/lessons/webgl-text-html.html
                        let clipspace = vec4.create();
                        vec4.transformMat4(clipspace, phiPoint, mvpMatrix);

                        // divide X and Y by W just like the GPU does.
                        clipspace[0] /= clipspace[3];
                        clipspace[1] /= clipspace[3];

                        // convert from clipspace to pixels
                        let pixelX = (clipspace[0] *  0.5 + 0.5) * global.gl.canvas.width;
                        let pixelY = (clipspace[1] * -0.5 + 0.5) * global.gl.canvas.height;
                        
                        gridTextHelper.addEqDivSet(raDeg.toFixed(2), pixelX, pixelY, 'ra');
                    }
                        
                }

            }

        }
        
        gridTextHelper.resetDivSets();
        


		

		// var ext = global.gl.getExtension('OES_element_index_uint');
		// global.gl.drawElements (global.gl.LINE_LOOP, this._vertexCataloguePosition.length / 3 + this._nPrimitiveFlags, global.gl.UNSIGNED_INT, 0);
		
		
		global.gl.bindBuffer(global.gl.ELEMENT_ARRAY_BUFFER, null);
		
		
	}

}

export default EquatorialGrid;