// "use strict";

// import global from '../Global.js';
// import {shaderUtility} from '../utils/ShaderUtility.js';

// class HealpixShader {

// 	constructor(shaderPrefix) {
// 		this.isInitialized = false;
// 		this.shaderPrefix = shaderPrefix;
// 	}

// 	initShaders () {
// 		this.shaderProgram = this.gl.createProgram();
// 		let fragmentShader;
// 		if(this.shaderPrefix == "hips" && global.blendMode){
// 			fragmentShader = this.getShader(this.shaderPrefix + "-shader-fs-blend");
// 		} else {
// 			fragmentShader = this.getShader(this.shaderPrefix + "-shader-fs");
// 		}
// 		let vertexShader = this.getShader(this.shaderPrefix + "-shader-vs");

// 		this.gl.attachShader(this.shaderProgram, vertexShader);
// 		this.gl.attachShader(this.shaderProgram, fragmentShader);
// 		this.gl.linkProgram(this.shaderProgram);
// 		this.gl.shaderProgram = this.shaderProgram;

// 		if (!this.gl.getProgramParameter(this.shaderProgram, this.gl.LINK_STATUS)) {
// 			alert("Could not initialise shaders");
// 		}

// 		shaderUtility.useProgram(this.shaderProgram);

// 		this.shaderProgram.vertexPositionAttribute = this.gl.getAttribLocation(this.shaderProgram, "aVertexPosition");
// 		this.shaderProgram.textureCoordAttribute = this.gl.getAttribLocation(this.shaderProgram, "aTextureCoord");

// 		this.setUniformLocation();
// 	}
	
	
// 	getShader(id){
// 		let shaderScript = document.getElementById(id);
// 		if (!shaderScript) {
// 			return null;
// 		}
		
// 		let str = "";
// 		let k = shaderScript.firstChild;
// 		while (k) {
// 			if (k.nodeType == 3) {
// 				str += k.textContent;
// 			}
// 			k = k.nextSibling;
// 		}
		
// 		let shader;
// 		if (shaderScript.type == "x-shader/x-fragment") {
// 			shader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
// 		} else if (shaderScript.type == "x-shader/x-vertex") {
// 			shader = this.gl.createShader(this.gl.VERTEX_SHADER);
// 		} else {
// 			return null;
// 		}

// 		this.gl.shaderSource(shader, str);
// 		this.gl.compileShader(shader);

// 		if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
// 			alert(this.gl.getShaderInfoLog(shader));
// 			return null;
// 		}
// 		return shader;
// 	}

// 	setUniformLocation (){
// 		this.shaderProgram.pMatrixUniform = this.gl.getUniformLocation(this.shaderProgram, "uPMatrix");
// 		this.shaderProgram.mMatrixUniform = this.gl.getUniformLocation(this.shaderProgram, "uMMatrix");
// 		this.shaderProgram.vMatrixUniform = this.gl.getUniformLocation(this.shaderProgram, "uVMatrix");
// 		this.shaderProgram.samplerUniform = this.gl.getUniformLocation(this.shaderProgram, "uSampler0");
// 		this.shaderProgram.uniformVertexTextureFactor = this.gl.getUniformLocation(this.shaderProgram, "uFactor0");
// 		this.gl.uniform1f(this.shaderProgram.uniformVertexTextureFactor, 1.0);
// 		this.gl.uniform1i(this.shaderProgram.samplerUniform, 0);
// 	}

// 	useShader(pMatrix, vMatrix, modelMatrix, opacity){
// 		if(!this.isInitialized){
// 			this.init();
// 		}
// 		if(shaderUtility.lastUsedProgram != this.shaderProgram){
// 			shaderUtility.useProgram(this.shaderProgram);
// 			this.gl.enableVertexAttribArray(this.shaderProgram.textureCoordAttribute);
// 			this.gl.enableVertexAttribArray(this.shaderProgram.vertexPositionAttribute);
// 		}
		
// 		this.gl.uniformMatrix4fv(this.shaderProgram.mMatrixUniform, false, modelMatrix);
// 		this.gl.uniformMatrix4fv(this.shaderProgram.pMatrixUniform, false, pMatrix);
// 		this.gl.uniformMatrix4fv(this.shaderProgram.vMatrixUniform, false, vMatrix);
	
// 		this.gl.uniform1f(this.shaderProgram.uniformVertexTextureFactor, opacity);
// 	}

// 	init(){
// 		if(this.isInitialized){
// 			return;
// 		}
// 		this.isInitialized = true;
// 		this.gl = global.gl;
// 		this.initShaders();
// 	}

// 	setBuffers(vertexPositionBuffer, vertexIndexBuffer){
// 		this.setPositionTextureBuffer(vertexPositionBuffer);
// 		this.setIndexBuffer(vertexIndexBuffer);
// 	}

// 	setPositionTextureBuffer(vertexPositionBuffer){
// 		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vertexPositionBuffer);
// 		this.gl.vertexAttribPointer(this.shaderProgram.vertexPositionAttribute, 3, this.gl.FLOAT, false, 20, 0);
// 		this.gl.vertexAttribPointer(this.shaderProgram.textureCoordAttribute, 2, this.gl.FLOAT, false, 20, 12);
// 	}
	
// 	setIndexBuffer(vertexIndexBuffer){
// 		this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, vertexIndexBuffer);
// 	}
// }
// export const healpixShader = new HealpixShader("hips");
// export const textShader = new HealpixShader("text");