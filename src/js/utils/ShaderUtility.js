
import global from '../Global.js';
import ShaderManager from '../shaders/ShaderManager.js';

class ShaderUtility {

  useProgram(program) {
    if (this.lastUsedProgram != program) {
      global.gl.useProgram(program);
      this.lastUsedProgram = program;
    }
  }

  createHiPSFSShaderProgram() {
    const fragmentShaderStr = ShaderManager.hipsNativeFS();
    let fragmentShader = global.gl.createShader(global.gl.FRAGMENT_SHADER);
    global.gl.shaderSource(fragmentShader, fragmentShaderStr);
    global.gl.compileShader(fragmentShader);
    if (!global.gl.getShaderParameter(fragmentShader, global.gl.COMPILE_STATUS)) {
      alert(global.gl.getShaderInfoLog(fragmentShader));
      return null;
    }
    return fragmentShader;
  }

  createHiPSVSShaderProgram() {
    const vertexShaderStr = ShaderManager.hipsVS();
    let vertexShader = global.gl.createShader(global.gl.VERTEX_SHADER);
    global.gl.shaderSource(vertexShader, vertexShaderStr);
    global.gl.compileShader(vertexShader);
    if (!global.gl.getShaderParameter(vertexShader, global.gl.COMPILE_STATUS)) {
      alert(global.gl.getShaderInfoLog(vertexShader));
      return null;
    }
    return vertexShader;
  }


  enableHiPSShader() {

  }

  enableFootprintShader() {

  }

  enableCatalgueShader() {

  }

  enebaleHEALPixShader() {

  }

  enableRADecShader() {

  }

}

export const shaderUtility = new ShaderUtility();


