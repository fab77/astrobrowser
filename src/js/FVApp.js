/**
 * @author Fabrizio Giordano (Fab77)
 */
import FVView from './FVView.js';
import global from './Global.js';
import MainPresenter from './MainPresenter.js';

export class FVApp{

	constructor(){
		
		if (global.debug){
			console.log("[FVApp::FVApp]");
		}
		this.init();
		this.initListeners();
	}


	/**
	 * used for debug pourpose in the browser console. 
	 * e.g. fabviewer.FVApp.prototype.getGlobalSettings()._showConvexPolygons = true
	 * @returns  
	 */
	getGlobalSettings() {
		return global;
	}

	
	init(){
		if (global.debug){
			console.log("[FVApp::init]");
		}
		let canvas = document.getElementById("fabviewer_canvas");
		
		try {
			if (global.debug){
				console.log("[FVApp::init]canvas");
				console.log(canvas);
			}
			
			this.gl = canvas.getContext("webgl2", {
				alpha: false
			});
			
			let params = new URLSearchParams(location.search);
			if (params.get('debug') != null){
				console.warn("WebGL DEBUG MODE ON");
				this.gl = WebGLDebugUtils.makeDebugContext(this.gl);	
			}
			
			this.gl.viewportWidth = canvas.width;
			this.gl.viewportHeight = canvas.height;
			
			this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
			
		} catch (e) {
			console.log("Error instansiating WebGL context");
		}
		if (!this.gl) {
			alert("Could not initialise WebGL, sorry :-(");
		}
		
		this.view = new FVView(canvas, global.insideSphere);
		
		global.gl = this.gl;
		
		this.presenter = new MainPresenter(this.view, this.gl);
		
		this.fabVReqID = '';
		
		
	};
	
	initListeners(){
		
		let resizeCanvas = () => {
			if (global.debug){
				console.log("[MainPresenter::addEventListeners->resizeCanvas]");
			}
		   	this.view.resize(this.gl);
		   	this.presenter.draw();
		}
		
		function handleContextLost(event){
			console.log("[handleContextLost]");
			event.preventDefault();
			cancelRequestAnimFrame(this.fabVReqID);
		}

		let handleContextRestored = (event) => {
			console.log("[handleContextRestored]");
			let canvas = document.getElementById("fabviewer_canvas");
			this.gl.viewportWidth = canvas.width;
			this.gl.viewportHeight = canvas.height;
			this.gl.clearColorrgbrgb(0.86, 0.86, 0.86, 1.0);
			
			this.gl.enable(this.gl.DEPTH_TEST);
			
			this.fabVReqID = requestAnimFrame(this.tick, canvas);
		}
		
		
		window.addEventListener('resize', resizeCanvas);
		this.view.canvas.addEventListener('webglcontextlost', handleContextLost, false);
		this.view.canvas.addEventListener('webglcontextrestored', handleContextRestored, false);
		resizeCanvas();
	};
	
	run(){
		if (global.debug){
			console.log("[FVApp::run]");
		}
		this.tick();
	};
	
	tick() {
		
		this.drawScene();
		if(global.debug){
			// Only do this at DEBUG since every getError call takes 5-10ms
			let error = this.gl.getError();
			if (error != this.gl.NO_ERROR && error != this.gl.CONTEXT_LOST_WEBGL) {
				console.log("GL error: "+error);
			}
		}

		this.fabVReqID = requestAnimationFrame(()=>this.tick());
		
	}

	
	drawScene(){
		this.presenter.draw();
	};
	
	
}