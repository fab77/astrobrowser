"use strict";

class GridShaderManager {

    static healpixGridVS () {
		return `#version 300 es

        in vec4 aCatPosition;
        // in float u_pointsize;

        uniform mat4 uMVMatrix;
        uniform mat4 uPMatrix;

        // out lowp vec4 vColor;

        void main() {

            gl_Position = uPMatrix * uMVMatrix * aCatPosition;
            gl_PointSize = 7.0;

        }`;
	}

    static healpixGridFS () {
        return `#version 300 es

		precision mediump float;
        
        out vec4 fragColor;

        void main() {
            fragColor = vec4(1.0, 0.0, 0.0, 1);
            //gl_FragColor = u_fragcolor;
		} `;
	}

}
export default GridShaderManager;