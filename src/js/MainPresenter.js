"use strict";
/**
 * @author Fabrizio Giordano (Fab)
 */
import $ from "jquery";

import Camera from './model/Camera.js';

import RayPickingUtils from './utils/RayPickingUtils.js';

import ControlPanelPresenter from './modules/controlpanel/ControlPanelPresenter.js';
import CoordinatesPanelPresenter from './presenter/CoordinatesPanelPresenter.js';

import FoVPresenter from './presenter/FoVPresenter.js';

import global from './Global.js';
import { session } from './utils/Session.js';

import eventBus from './events/EventBus.js';

import { mat4, vec3 } from 'gl-matrix';
import { cartesianToSpherical, sphericalToAstroDeg, sphericalToCartesian, raDegToHMS, decDegToDMS, degToRad } from './utils/Utils.js';
import MouseHelper from './utils/MouseHelper.js';


import InsideSphereSelectionChangedEvent from './events/InsideSphereSelectionChangedEvent.js';
import OpenPanelEvent from './events/OpenPanelEvent.js';
import GoToEvent from './modules/controlpanel/gotopanel/events/GoToEvent.js';
import HealpixGrid from './model/grids/HealpixGrid.js';
import EquatorialGrid from './model/grids/EquatorialGrid.js';
import ShowCoordsGridSelectionChangedEvent from './events/ShowCoordsGridSelectionChangedEvent.js';
import ShowHealpixGridSelectionChangedEvent from './events/ShowHealpixGridSelectionChangedEvent.js';

import DebugPresenter from "./modules/debug/DebugPresenter.js";

import { newVisibleTilesManager } from './model/hipsnew/VisibleTilesManager.js';
import CORSTAPReposEvent from "./events/CORSTAPReposEvent.js";

import DataPanelPresenter from "./modules/datapanel/DataPanelPresenter.js"
import AddMessageToMsgBoxEvent from "./events/AddMessageToMsgBoxEvent.js";
import RemoveMessageToMsgBoxEvent from "./events/RemoveMessageToMsgBoxEvent.js";

class MainPresenter {

	constructor(in_view, in_gl) {
		this.in_gl = in_gl;

		this.mouseHelper = new MouseHelper();

		this.init(in_view);
		this.registerForEvents();



	}

	init(in_view) {
		
		if (global.debug) {
			console.log("[MainPresenter::init]");
		}
		this.view = in_view;

		if (global.insideSphere) {
			this.camera = new Camera([0.0, 0.0, -0.005], global.insideSphere);
		} else {
			this.camera = new Camera([0.0, 0.0, 3.0], global.insideSphere);
		}
		global.camera = this.camera;
		var raypicker = new RayPickingUtils(); // <-- check if it can be converted to singleton instead of putting it into global
		global.rayPicker = raypicker;

		this.aspectRatio;
		this.fovDeg = global.getConfig_cameraFovDeg();
		this.nearPlane = global.getConfig_nearPlane();
		this.farPlane = global.getConfig_cameraFarPlane();

		this.mouseDown = false;
		this.lastMouseX = null;
		this.lastMouseY = null;
		this.inertiaX = 0.0;
		this.inertiaY = 0.0;
		this.zoomInertia = 0.0;

		


		this.nearestVisibleObjectIdx = 0;

		this.pMatrix = mat4.create();
		this.firstRun = true;


		this.aspectRatio = this.view.canvas.width / this.view.canvas.height;
		this.pMatrix = this.computePerspectiveMatrix();
		if (this.firstRun) {
			const initialFoV = 180.;
			const position = [0.0, 0.0, 0.0];
			const initialPhiRad = 0.;
			const initialThetaRad = 0.;
			if (this.hpGrid == undefined) {
				this.hpGrid = new HealpixGrid(1, position, initialPhiRad, initialThetaRad, initialFoV);
				newVisibleTilesManager.init(this.hpGrid); // <- here I need pmatrix for the raypicking
			}
			this.currentFoV = initialFoV;

			this.refreshFoV(this.pMatrix);
			setInterval(() => this.refreshFoV(), 100, this.pMatrix);
			// setInterval(() => this.refreshFoV(), 100);
			this.initPresenter();
			this.addEventListeners();
			this.view.addHipsButtonHandler(() => {
				this.hipsListPresenter.toggle();
			});
			this.view.fillVersion(global.version)
			global.defaultHips;
			this.firstRun = false;
		}



		// this.computePerspectiveMatrix();

		// const initialFoV = 180.;
		// const position = [0.0, 0.0, 0.0];
		// const initialPhiRad = 0.;
		// const initialThetaRad = 0.;
		// if (this.hpGrid == undefined) {
		// 	this.hpGrid = new HealpixGrid(1, position, initialPhiRad, initialThetaRad, initialFoV);
		// 	newVisibleTilesManager.init(this.hpGrid); // <- here I need pmatrix for the raypicking
		// }
		// this.currentFoV = initialFoV;

		// this.refreshFoV();
		// setInterval(() => this.refreshFoV(), 100);
		// this.initPresenter();
		// this.addEventListeners();
		// this.view.addHipsButtonHandler(() => {
		// 	this.hipsListPresenter.toggle();
		// });

		// this.view.fillVersion(global.version)
		// global.defaultHips;
	};

	

	computePerspectiveMatrix() {
		this.aspectRatio = this.view.canvas.width / this.view.canvas.height;

		let farPlane;
		if (global.insideSphere) {
			farPlane = 1.1 // far plane set to the radius (it could be more precise if needed)
		} else {



			let distCamera = - this.camera.getCameraMatrix()[14];
			let r = 1; // Need this to be the radius of the HiPS sphere. Can we get that somewhere?
			/**
			 * far plane dynamic computation
			 * O: origin of 3d space = center of sphere
			 * C: camera position
			 * r: radius of the sphere
			 * T: tangent point to the sphere from C
			 * F: far plane distance from camera
			 * beta: angle COT
			 * 
			 * 1. Pitagora:
			 * cateto2 = Math.sqrt(ipotenusa^2 - cateto1^2) 
			 * CT = Math.sqrt(CO^2 - r^2)
			 * 2. beta = atg(CT/r)
			 * 3. CF = CT Math.sin(beta)
			 * farplane = CF
			*/
			let c2 = Math.sqrt(distCamera ** 2 - r ** 2);
			let beta = Math.atan2(c2, r);
			let cf = c2 * Math.sin(beta);
			farPlane = cf;
		}
		var pMatrix = mat4.create();
		mat4.perspective(pMatrix, this.fovDeg * Math.PI / 180.0, this.aspectRatio, this.nearPlane, farPlane);
		global.pMatrix = this.pMatrix; // TODO try to remove global.pMatrix
		return pMatrix;

	}

	registerForEvents() {
		eventBus.registerForEvent(this, ShowHealpixGridSelectionChangedEvent.name);
		eventBus.registerForEvent(this, ShowCoordsGridSelectionChangedEvent.name);

		eventBus.registerForEvent(this, InsideSphereSelectionChangedEvent.name);

		eventBus.registerForEvent(this, OpenPanelEvent.name);

		// eventBus.registerForEvent(this, OpenDataExplorerPanelEvent.name);

		eventBus.registerForEvent(this, GoToEvent.name);

		eventBus.registerForEvent(this, CORSTAPReposEvent.name);

		eventBus.registerForEvent(this, AddMessageToMsgBoxEvent.name)

		eventBus.registerForEvent(this, RemoveMessageToMsgBoxEvent.name)

	}

	notify(in_event) {


		switch (in_event.constructor) {

			case ShowCoordsGridSelectionChangedEvent:
				this._showGrid = in_event._shouldShowGrid
				break;

			case ShowHealpixGridSelectionChangedEvent:
				this._showHPXGrid = in_event._shouldShowGrid
				break;

			case InsideSphereSelectionChangedEvent:
				// this.refreshViewAndModel(false, in_event.insideSphere);
				// visibleTilesManager.refreshModel(this.refreshFov(global.insideSphere).minFoV);
				break;

			case GoToEvent:

				let ra = in_event.raDeg;
				let dec = in_event.decDeg;
				this.camera.goTo(ra, dec);
				break;

			case CORSTAPReposEvent:
				this.controlPanelPresenter.refreshRepos();
				break;
			case AddMessageToMsgBoxEvent:
				this.view.addMessageToMessageQueue(in_event.msgId, in_event.message)
				break;
			case RemoveMessageToMsgBoxEvent:
				this.view.removeMessageToMessageQueue(in_event.msgId)
				break;
		}

	}

	initPresenter() {

		this.controlPanelPresenter = new ControlPanelPresenter(this.view);

		this.fovPresenter = new FoVPresenter();
		this.view.append2FabvContainer(this.fovPresenter.view.getHtml());

		this.coordinatesPanelPresenter = new CoordinatesPanelPresenter();
		this.view.append2FabvContainer(this.coordinatesPanelPresenter.view.getHtml());

		this._debugPresenter = null;


		this.dataPanelPresenter = new DataPanelPresenter(this.view.dataPanelDomId);
		this.view.append2DataPanel(this.dataPanelPresenter.view.getHtml())
		this.dataPanelPresenter.toggleView()
	};

	initDebugPresenter() {
		this._debugPresenter = new DebugPresenter();
		this.view.append2FabvContainer(this._debugPresenter.view.html);
	}



	addEventListeners() {
		if (global.debug) {
			console.log("[MainPresenter::addEventListeners]");
		}

		let self = this;
		this.view.metadataPanelButton.click(function () {
			self.dataPanelPresenter.toggleView();
		});

		var handleMouseDown = (event) => {
			this.view.canvas.setPointerCapture(event.pointerId);
			this.mouseDown = true;

			this.lastMouseX = event.pageX;
			this.lastMouseY = event.pageY;

			this.dataPanelPresenter.refresh(session.hoveredFootprints, session.hoveredSources)
			session.clearHoveredFootprints()
			event.preventDefault();
			return false;
		}

		var handleMouseUp = (event) => {
			this.view.canvas.releasePointerCapture(event.pointerId);
			this.mouseDown = false;
			document.getElementsByTagName("body")[0].style.cursor = "auto";
			this.lastMouseX = event.clientX;
			this.lastMouseY = event.clientY;


			// var intersectionWithModel = RayPickingUtils.getIntersectionPointWithModel(this.lastMouseX, this.lastMouseY, this.controlPanelPresenter.hipsListPresenter.getVisibleModels());
			var intersectionWithModel = RayPickingUtils.getIntersectionPointWithModel(this.lastMouseX, this.lastMouseY, session.activeHiPS);

			if (intersectionWithModel.intersectionPoint.intersectionPoint === undefined) {
				return;
			}
			if (intersectionWithModel.intersectionPoint.intersectionPoint.length > 0) {

				var phiThetaDeg = cartesianToSpherical(intersectionWithModel.intersectionPoint.intersectionPoint);
				//TODO to be reviewed. cartesianToSpherical seems to convert already Dec into [-90, 90]
				var raDecDeg = sphericalToAstroDeg(phiThetaDeg.phi, phiThetaDeg.theta);
				//				var raDecDeg = {
				//						ra: phiThetaDeg.phi,
				//						dec: -phiThetaDeg.theta
				//						};
				var raHMS = raDegToHMS(raDecDeg.ra);
				var decDMS = decDegToDMS(raDecDeg.dec);
				this.controlPanelPresenter.setSphericalCoordinates(phiThetaDeg);
				//				this.view.setPickedAstroCoordinates(raDecDeg, raHMS, decDMS);
				this.coordinatesPanelPresenter.update(raDecDeg, raHMS, decDMS, phiThetaDeg.phi, phiThetaDeg.theta);

			} else {
				// console.log("no intersection");
			}
			this.nearestVisibleObjectIdx = intersectionWithModel.idx;

		}


		var handleMouseMove = (event) => {
			var newX = event.clientX;
			var newY = event.clientY;

			if (this.mouseDown) {

				document.getElementsByTagName("body")[0].style.cursor = "grab";

				var deltaX = (newX - this.lastMouseX) * Math.PI / this.view.canvas.width;
				var deltaY = (newY - this.lastMouseY) * Math.PI / this.view.canvas.width;

				this.inertiaX += 0.1 * deltaX;
				this.inertiaY += 0.1 * deltaY;


			} else {

				// TODO 
				/**
				 * algo for source picking
				 * do raypicking against the HiPS sphere each draw cycle with mouse coords converted into model coords
				 * pass these coords to the fragment shader (catalogue fragment shader)
				 * In the fragment shader, compute if the segment from mouse coords and source point is less than the point radius (gl_PointSize)
				 * 
				 */
				// TODO THIS LOGIC should be moved into MouseHelper class
				var mousePicker = RayPickingUtils.getIntersectionPointWithSingleModel(newX, newY);
				var mousePoint = mousePicker.intersectionPoint;
				var mouseObjectPicked = mousePicker.pickedObject;
				if (mousePoint !== undefined) {

					if (mousePoint.length > 0) {

						this.mouseHelper.update(mousePoint);
						this.controlPanelPresenter.setSphericalCoordinates(this.mouseHelper.phiThetaDeg);
						this.coordinatesPanelPresenter.update(this.mouseHelper.raDecDeg, this.mouseHelper.raHMS, this.mouseHelper.decDMS, this.mouseHelper.phiThetaDeg.phi, this.mouseHelper.phiThetaDeg.theta);

					} else {
						this.mouseHelper.clear();
						let phiThetaDeg = this.getPhiThetaDeg()
						let raDecDeg = sphericalToAstroDeg(phiThetaDeg.phi, phiThetaDeg.theta)
						let raHMS = raDegToHMS(raDecDeg.ra);
						let decDMS = decDegToDMS(raDecDeg.dec);
						this.controlPanelPresenter.setSphericalCoordinates(phiThetaDeg);
						this.coordinatesPanelPresenter.update(raDecDeg, raHMS, decDMS, phiThetaDeg.phi, phiThetaDeg.theta);

					}

				}
			}

			this.lastMouseX = newX;
			this.lastMouseY = newY;
			event.preventDefault();
		}


		this.zoomIn = false;
		this.zoomOut = false;
		this.Xrot = 0;
		this.Yrot = 0;
		this.XYrot = [0, 0];
		this.keyPressed = false;


		var handleKeyUp = (event) => {
			this.keyPressed = false;
			this.zoomIn = false;
			this.zoomOut = false;
			this.Xrot = 0;
			this.Yrot = 0;
			this.XYrot = [0, 0];
			this.keyPressed = false;
		}

		var handleKeyPress = (event) => {

			var code = event.keyCode;

			var move = vec3.clone([0, 0, 0]);
			var rotStep = 0.01;
			var pan = false;
			switch (code) {
				case 38:// arrowUp
					this.zoomInertia -= 0.0001;
					break;
				case 40:// arrowDown
					this.zoomInertia += 0.0001;
					break;
				case 87:// W
					this.Xrot = -1;
					break;
				case 88:// X
					this.Xrot = 1;
					break;
				case 68:// A
					this.Yrot = 1;
					break;
				case 65:// D
					this.Yrot = -1;
					break;
				case 81:// Q
					this.XYrot = [-rotStep, -rotStep];
					break;
				case 69:// E
					this.XYrot = [rotStep, -rotStep];
					break;
				case 90:// Z
					this.XYrot = [-rotStep, rotStep];
					break;
				case 67:// C
					this.XYrot = [rotStep, rotStep];
					break;
			}
			this.keyPressed = true;

		}

		var handleMouseWheel = (event) => {

			if (event.deltaY < 0) {
				// Zoom in
				this.zoomInertia -= 0.001;
			} else {
				// Zoom out
				this.zoomInertia += 0.001;
			}


		}

		// window.addEventListener('keydown', handleKeyPress);
		// window.addEventListener('keyup', handleKeyUp);

		this.view.canvas.onpointerdown = handleMouseDown;
		this.view.canvas.onpointerup = handleMouseUp;
		this.view.canvas.onpointermove = handleMouseMove;
		this.view.canvas.onwheel = handleMouseWheel;

	};

	getModelCenter() {


		var rect = this.view.canvas.getBoundingClientRect();


		let centralCanvasX = (rect.left + this.view.canvas.width) / 2;
		let centralCanvasY = (rect.top + this.view.canvas.height) / 2;

		var intersectionWithModel = RayPickingUtils.getIntersectionPointWithModel(centralCanvasX, centralCanvasY, this.getVisibleModels());
		if (intersectionWithModel.intersectionPoint.intersectionPoint === undefined) {
			return;
		}
		if (intersectionWithModel.intersectionPoint.intersectionPoint.length > 0) {

			let phiThetaDeg = cartesianToSpherical(intersectionWithModel.intersectionPoint.intersectionPoint);
			let raDecDeg = sphericalToAstroDeg(phiThetaDeg.phi, phiThetaDeg.theta);
			let raHMS = raDegToHMS(raDecDeg.ra);
			let decDMS = decDegToDMS(raDecDeg.dec);

			// console.log(intersectionWithModel.pickedObject.name);
			// console.log(phiThetaDeg);
			// console.log(raDecDeg);


		} else {
			// console.log("no intersection");
		}
		return this.nearestVisibleObjectIdx;
	}


	getPhiThetaDeg(inside) {
		let maxX = global.gl.canvas.width;
		let maxY = global.gl.canvas.height;

		let point = RayPickingUtils.getIntersectionPointWithSingleModel(maxX / 2, maxY / 2).intersectionPoint;
		inside = inside !== undefined ? inside : global.insideSphere;
		return cartesianToSpherical(point, !inside);
	}


	refreshFoV(pMatrix) {
		this.fovObj = this.hpGrid.refreshFoV(false, pMatrix);
		this.currentFoV = this.hpGrid.getMinFoV();
		if (this.fovPresenter) {
			this.fovPresenter.updateFoV(this.fovObj);
		}

	}

	draw() {

		this.aspectRatio = this.view.canvas.width / this.view.canvas.height;
		this.pMatrix = this.computePerspectiveMatrix();
		// if (this.firstRun) {
		// 	const initialFoV = 180.;
		// 	const position = [0.0, 0.0, 0.0];
		// 	const initialPhiRad = 0.;
		// 	const initialThetaRad = 0.;
		// 	if (this.hpGrid == undefined) {
		// 		this.hpGrid = new HealpixGrid(1, position, initialPhiRad, initialThetaRad, initialFoV);
		// 		newVisibleTilesManager.init(this.hpGrid); // <- here I need pmatrix for the raypicking
		// 	}
		// 	this.currentFoV = initialFoV;

		// 	this.refreshFoV(this.pMatrix);
		// 	setInterval(() => this.refreshFoV(), 100);
		// 	this.initPresenter();
		// 	this.addEventListeners();
		// 	this.view.addHipsButtonHandler(() => {
		// 		this.hipsListPresenter.toggle();
		// 	});
		// 	this.view.fillVersion(global.version)
		// 	global.defaultHips;
		// 	this.firstRun = false;
		// }


		if (this.fovObj === undefined) {
			return;
		}

		global.gl.getExtension('OES_element_index_uint');


		global.gl.clear(global.gl.COLOR_BUFFER_BIT | global.gl.DEPTH_BUFFER_BIT);

		var cameraRotated = false;
		var THETA, PHI;

		if (this.keyPressed) {
			if (this.Yrot != 0) {
				this.camera.rotateY(this.Yrot);
			} else if (this.Xrot != 0) {
				this.camera.rotateX(this.Xrot);
			} else if (this.XYrot[0] != 0 && this.XYrot[1] != 0) {    // ????? it would never enter here!!!!
				this.camera.rotate(this.XYrot[0], this.XYrot[1]);
			}
		}

		global.gl.viewport(0, 0, global.gl.viewportWidth, global.gl.viewportHeight);
		global.gl.clear(global.gl.COLOR_BUFFER_BIT | global.gl.DEPTH_BUFFER_BIT);

		this.pMatrix = this.computePerspectiveMatrix();

		if (global.getSelectedHiPS() !== undefined) {


			if (this.fovObj.minFoV > 0.1 || this.zoomInertia > 0) {
				if (Math.abs(this.zoomInertia) > 0.0001) {
					this.camera.zoom(this.zoomInertia);
					this.zoomInertia *= 0.95;
				}
			}
			if (this.mouseDown || Math.abs(this.inertiaX) > 0.02 || Math.abs(this.inertiaY) > 0.02) {
				cameraRotated = true;
				THETA = this.inertiaY;
				PHI = this.inertiaX;
				this.inertiaX *= 0.95;
				this.inertiaY *= 0.95;
				this.camera.rotate(PHI, THETA);
			} else {
				this.inertiaY = 0;
				this.inertiaX = 0;
			}


			//!!!! TODO REFRESH ControlPanelPresenter model only if the panel is open
			this.controlPanelPresenter.refreshModel();

			let activeHips = session.activeHiPS;

			// TODO review this. It sould be taken from HiPSGrid
			let j2000ModelMatrix = global.getSelectedHiPS().getModelMatrix();
			let galacticModel = undefined;
			activeHips.forEach(hips => {
				if (hips.isGalacticHips) {
					galacticModel = hips.getModelMatrix();
				} else {
					j2000ModelMatrix = hips.getModelMatrix();
				}
			});

			if (global.debug) {
				if (this._debugPresenter == null) {
					this.initDebugPresenter();
				}
				if (global.getSelectedHiPS()._tileBuffer._tiles && global.getSelectedHiPS()._tileBuffer._tilesCache) {
					this._debugPresenter.refresh(global.getSelectedHiPS()._tileBuffer._tiles, global.getSelectedHiPS()._tileBuffer._tilesCache);
				}
			}

			global.gl.disable(global.gl.DEPTH_TEST);
			global.gl.enable(global.gl.BLEND);
			global.gl.enable(global.gl.CULL_FACE);
			if (global.insideSphere) {
				global.gl.cullFace(global.gl.BACK);
			} else {
				global.gl.cullFace(global.gl.FRONT);
			}

			if (global.blendMode) {
				global.gl.blendFunc(global.gl.SRC_ALPHA, global.gl.ONE);
			} else {
				global.gl.blendFunc(global.gl.SRC_ALPHA, global.gl.ONE_MINUS_SRC_ALPHA);
			}

			global.gl.blendFunc(global.gl.SRC_ALPHA, global.gl.ONE_MINUS_SRC_ALPHA);

			// DRAW HiPS
			session.activeHiPS.forEach(hips => {
				hips.draw(this.pMatrix, this.camera.getCameraMatrix(), cameraRotated);
			});

			// GRID
			let showHPXGrid = false;
			if (this._showHPXGrid) {
				$("#gridhpx").show();
				showHPXGrid = true;

			} else {
				$("#gridhpx").hide();
			}

			if (this.hpGrid !== undefined) {
				this.hpGrid.draw(j2000ModelMatrix, cameraRotated, showHPXGrid, this.pMatrix);
			}


			if (this._showGrid) {
				$("#gridcoords").show();
				if (this.eqGrid == undefined && this.fovObj !== undefined) {
					this.eqGrid = new EquatorialGrid(1.0, this.fovObj.minFoV);
				}
				if (this.eqGrid !== undefined) {
					this.eqGrid.draw(j2000ModelMatrix, this.fovObj.minFoV);
				}

			} else {
				$("#gridcoords").hide();
			}





			global.gl.enable(global.gl.DEPTH_TEST);
			global.gl.disable(global.gl.CULL_FACE);



			// CATALOGUES
			for (let cat of session.activeCatSets) {
				if (cat.ready) {
					cat.draw(j2000ModelMatrix, this.mouseHelper);
				}
			}

			// FOOTPRINTS
			for (let fset of session.activeFSets) {
				if (fset.ready) {
					fset.draw(j2000ModelMatrix, this.mouseHelper);
				}

			}


		}




		//		this.xyzRefSystemObj.draw(this.pMatrix, this.camera.getCameraMatrix());
	};
}

export default MainPresenter;