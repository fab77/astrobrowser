// "use strict";

// import global from '../Global.js';
// import {healpixGridTileBufferSingleton} from './HealpixGridTileBuffer.js';

// class HealpixGridTile {

// 	constructor(order, ipix) {
// 		this.gl = global.gl;
// 		this.order = order;
// 		this.ipix = ipix;
// 		this.key = order + "/" + ipix;
// 		this.vertexPositionIndex = 0;
// 		this.setStep();
// 		this.initBuffer();
// 	}

// 	setStep(){
// 		switch (this.order){
// 			case 0:
// 			case 1:
// 			case 2:
// 			case 3:
// 				this.step = 16;
// 				break;
// 			case 4:
// 				this.step = 8;
// 				break;
// 			case 5:
// 				this.step = 4;
// 				break;
// 			default:
// 				this.step = 2;
// 				break;
// 		}
// 	}

// 	initBuffer () {
// 		this.vertexPosition = new Float32Array(4 * this.step * 3);

// 		global.getHealpix(this.order).getBoundariesWithStep(this.ipix, this.step).forEach(position => {
// 			this.addVertexPosition(position);
// 		});

// 		this.vertexPositionBuffer = this.gl.createBuffer();
// 		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexPositionBuffer);
// 		this.gl.bufferData(this.gl.ARRAY_BUFFER, this.vertexPosition, this.gl.STATIC_DRAW);
// 	}

// 	addVertexPosition(position) {
// 		this.vertexPosition[this.vertexPositionIndex++] = position.x;
// 		this.vertexPosition[this.vertexPositionIndex++] = position.y;
// 		this.vertexPosition[this.vertexPositionIndex++] = position.z;
// 	}

// 	draw(vertexPositionAttribute){
// 		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexPositionBuffer);
// 		this.gl.vertexAttribPointer(vertexPositionAttribute, 3, this.gl.FLOAT, false, 0, 0);
// 		this.gl.drawArrays(this.gl.LINE_LOOP, 0, this.vertexPosition.length / 3);
// 	}

// 	destruct(){
// 		this.vertexPosition = null;
// 		this.gl.deleteBuffer(this.vertexPositionBuffer);
// 	}
// }
// export default HealpixGridTile;