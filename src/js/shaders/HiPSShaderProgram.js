
import global from '../Global.js';
import ShaderManager from './ShaderManager.js';
import { colorMap } from "../model/hipsnew/ColorMap.js";

class HiPSShaderProgram {

    _shaderProgram = undefined;
    _vertexShader;
    _fragmentShader;
    _UBO_colorMapBuffer;
    _UBO_colorMapVariableInfo = {};
    gl_uniforms;    // uniform names in the shader
    gl_attributes;  // uniform attribute names in the shader
    locations;

    constructor() {

        this.gl_uniforms = {
            "sampler": "uSampler0",
            "factor": "uFactor0",
            "m_perspective": "uPMatrix",
            "m_model": "uMMatrix",
            "m_view": "uVMatrix",
            "colormapIdx": "cmapIdx",
            "colormap_red": "r",
            "colormap_green": "g",
            "colormap_blue": "b"
        }

        this.gl_attributes = {
            "vertex_pos": "aVertexPosition",
            "text_coords": "aTextureCoord"
        }

        this.locations = {
            "pMatrix": "",
            "mMatrix": "",
            "vMatrix": "",
            "sampler": "",
            "textureAlpha": "",
            "clorMapIdx": "",
            "vertexPositionAttribute": "",
            "textureCoordAttribute": ""
        }
    }
    get gl_uniforms() {
        return this.gl_uniforms;
    }

    get gl_attributes() {
        return this.gl_attributes;
    }

    get locations() {
        return this.locations;
    }

    get shaderProgram() {
        if (!this._shaderProgram) {
            this._shaderProgram = global.gl.createProgram();
            this.initShaders();
        }
        global.gl.useProgram(this._shaderProgram);
        return this._shaderProgram
    }

    initShaders() {
        let fragmentShaderStr = ShaderManager.hipsNativeFS();
        this._fragmentShader = global.gl.createShader(global.gl.FRAGMENT_SHADER);
        global.gl.shaderSource(this._fragmentShader, fragmentShaderStr);
        global.gl.compileShader(this._fragmentShader);
        if (!global.gl.getShaderParameter(this._fragmentShader, global.gl.COMPILE_STATUS)) {
            alert(global.gl.getShaderInfoLog(this._fragmentShader));
            return null;
        }

        let vertexShaderStr = ShaderManager.hipsVS();
        this._vertexShader = global.gl.createShader(global.gl.VERTEX_SHADER);
        global.gl.shaderSource(this._vertexShader, vertexShaderStr);
        global.gl.compileShader(this._vertexShader);
        if (!global.gl.getShaderParameter(this._vertexShader, global.gl.COMPILE_STATUS)) {
            alert(global.gl.getShaderInfoLog(this._vertexShader));
            return null;
        }

        global.gl.attachShader(this._shaderProgram, this._vertexShader);
        global.gl.attachShader(this._shaderProgram, this._fragmentShader);

        global.gl.linkProgram(this._shaderProgram);

        if (!global.gl.getProgramParameter(this._shaderProgram, global.gl.LINK_STATUS)) {
            alert("Could not initialise shaders");
        }
        // global.gl.useProgram(this._shaderProgram);
    }

    enableProgram() {
        global.gl.useProgram(this._shaderProgram);
    }

    setGrayscaleShader() {
        global.gl.detachShader(this._shaderProgram, this._fragmentShader);
        const fragmentShaderStr = ShaderManager.hipsGrayscaleFS();
        this.changeFSShader(fragmentShaderStr);
    }

    setNativeShader() {
        global.gl.detachShader(this._shaderProgram, this._fragmentShader);
        const fragmentShaderStr = ShaderManager.hipsNativeFS();
        this.changeFSShader(fragmentShaderStr);
    }

    setColorMapShader(colorMap) {


        global.gl.detachShader(this._shaderProgram, this._fragmentShader);
        const fragmentShaderStr = ShaderManager.hipsColorMapFS();
        this.changeFSShader(fragmentShaderStr);

        // Get the index of the Uniform Block from any program
        const blockIndex = global.gl.getUniformBlockIndex(this._shaderProgram, "colormap");
        // Get the size of the Uniform Block in bytes
        const blockSize = global.gl.getActiveUniformBlockParameter(
            this._shaderProgram,
            blockIndex,
            global.gl.UNIFORM_BLOCK_DATA_SIZE
        );
        const uboVariableNames = ["r_palette", "g_palette", "b_palette"];
        // Get the respective index of the member variables inside our Uniform Block
        const uboVariableIndices = global.gl.getUniformIndices(
            this._shaderProgram,
            uboVariableNames
        );
        // Get the offset of the member variables inside our Uniform Block in bytes
        const uboVariableOffsets = global.gl.getActiveUniforms(
            this._shaderProgram,
            uboVariableIndices,
            global.gl.UNIFORM_OFFSET
        );
        // const uboVariableOffsets = [0, 1024, 2048]

        this._UBO_colorMapBuffer = global.gl.createBuffer();
        // Create Uniform Buffer to store our data
        // this.uboBuffer = global.gl.createBuffer(); // moved into the constructor
        // Bind it to tell WebGL we are working on this buffer
        global.gl.bindBuffer(global.gl.UNIFORM_BUFFER, this._UBO_colorMapBuffer);
        // Allocate memory for our buffer equal to the size of our Uniform Block
        // We use dynamic draw because we expect to respecify the contents of the buffer frequently

        // global.gl.bufferData(global.gl.UNIFORM_BUFFER, blockSize, global.gl.DYNAMIC_DRAW);
        global.gl.bufferData(global.gl.UNIFORM_BUFFER, 12288, global.gl.STATIC_DRAW);

        // Unbind buffer when we're done using it for now
        // Good practice to avoid unintentionally working on it
        global.gl.bindBuffer(global.gl.UNIFORM_BUFFER, null);
        // Bind the buffer to a binding point
        // Think of it as storing the buffer into a special UBO ArrayList
        // The second argument is the index you want to store your Uniform Buffer in
        // Let's say you have 2 unique UBO, you'll store the first one in index 0 and the second one in index 1
        global.gl.bindBufferBase(global.gl.UNIFORM_BUFFER, 0, this._UBO_colorMapBuffer);
        // Name of the member variables inside of our Uniform Block

        // Create an object to map each variable name to its respective index and offset
        // const uboVariableInfo = {}; // moved into the constructor

        let self = this;
        uboVariableNames.forEach((name, index) => {
            self._UBO_colorMapVariableInfo[name] = {
                index: uboVariableIndices[index],
                offset: uboVariableOffsets[index],
            };
        });

    }




    changeFSShader(fragmentShaderStr) {
        this._fragmentShader = global.gl.createShader(global.gl.FRAGMENT_SHADER);
        global.gl.shaderSource(this._fragmentShader, fragmentShaderStr);
        global.gl.compileShader(this._fragmentShader);
        if (!global.gl.getShaderParameter(this._fragmentShader, global.gl.COMPILE_STATUS)) {
            alert(global.gl.getShaderInfoLog(this._fragmentShader));
            return null;
        }
        global.gl.attachShader(this._shaderProgram, this._fragmentShader);
        global.gl.linkProgram(this._shaderProgram);
        if (!global.gl.getProgramParameter(this._shaderProgram, global.gl.LINK_STATUS)) {
            alert("Could not initialise shaders");
        }
        global.gl.useProgram(this._shaderProgram);
    }



    enableShaders(pMatrix, vMatrix, mMatrix, colorMapIdx) {

        global.gl.useProgram(this._shaderProgram);

        this.locations.pMatrix = global.gl.getUniformLocation(this._shaderProgram, this.gl_uniforms.m_perspective);
        this.locations.mMatrix = global.gl.getUniformLocation(this._shaderProgram, this.gl_uniforms.m_model);
        this.locations.vMatrix = global.gl.getUniformLocation(this._shaderProgram, this.gl_uniforms.m_view);
        this.locations.sampler = global.gl.getUniformLocation(this._shaderProgram, this.gl_uniforms.sampler);
        this.locations.textureAlpha = global.gl.getUniformLocation(this._shaderProgram, this.gl_uniforms.factor);
        this.locations.clorMapIdx = global.gl.getUniformLocation(this._shaderProgram, this.gl_uniforms.colormapIdx);

        this.locations.vertexPositionAttribute = global.gl.getAttribLocation(this._shaderProgram, this.gl_attributes.vertex_pos);
        this.locations.textureCoordAttribute = global.gl.getAttribLocation(this._shaderProgram, this.gl_attributes.text_coords);

        if (colorMapIdx >= 2) {

            const index = global.gl.getUniformBlockIndex(this._shaderProgram, "colormap");
            global.gl.uniformBlockBinding(this._shaderProgram, index, 0);
            global.gl.bindBuffer(global.gl.UNIFORM_BUFFER, this._UBO_colorMapBuffer);

            let curentColorMap;
            if (colorMapIdx == 2) {
                curentColorMap = colorMap.PLANCK;
            } else if (colorMapIdx == 3) {
                curentColorMap = colorMap.CMB;
            } else if (colorMapIdx == 4) {
                curentColorMap = colorMap.RAINBOW;
            } else if (colorMapIdx == 5) {
                curentColorMap = colorMap.EOSB;
            } else if (colorMapIdx == 6) {
                curentColorMap = colorMap.CUBEHELIX;
            }

            global.gl.bufferSubData(
                global.gl.UNIFORM_BUFFER,
                0,
                curentColorMap.r,
                0
            );
            global.gl.bufferSubData(
                global.gl.UNIFORM_BUFFER,
                4096,
                curentColorMap.g,
                0
            );
            global.gl.bufferSubData(
                global.gl.UNIFORM_BUFFER,
                8192,
                curentColorMap.b,
                0
            );
            global.gl.bindBuffer(global.gl.UNIFORM_BUFFER, null);
        }



        global.gl.uniformMatrix4fv(this.locations.mMatrix, false, mMatrix);
        global.gl.uniformMatrix4fv(this.locations.pMatrix, false, pMatrix);
        global.gl.uniformMatrix4fv(this.locations.vMatrix, false, vMatrix);
    }

}

export const hipsShaderProgram = new HiPSShaderProgram();