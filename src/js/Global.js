"use strict";

import { Healpix } from "healpixjs";
import InsideSphereSelectionChangedEvent from './events/InsideSphereSelectionChangedEvent.js';
import eventBus from './events/EventBus.js';

import HiPS from './model/hipsnew/HiPS.js';

import config from './config.json';

import {addHiPS} from './repos/HiPSNodeRepo.js'

class Global {

	_pMatrix;	// projection matrix (perspective)
	_mvMatrix;	// TODO model view matrix ? needed?
	_model;		// selected object
	_camera;		// the camera object
	_gl;			// GL context
	_rayPicker;	// TODO probably useless here ince all methods are static
	_hipsStack;
	_baseUrl;
	_selectionnside;
	_healpix4footprints;
	_showConvexPolygons; // used in FPCatalogue to drawing convex polygons together with the original footprints (for debug)
	_defaultHips;
	_blendMode
	HIPS_REF_ORDER;

	constructor() {

		this.HIPS_REF_ORDER = 6;
		this._TAPProviders = config.tapProviders
		this._HiPSNodes = config.hipsNodes
		this._useCORSProxy = config.useCORSProxy
		this._corsProxyUrl=config.corsProxyUrl
		this._maxDecimals= config.maxDecimals
		this._defaultHipsUrl = config.defaultHipsUrl
		this._debug = config.debug;
		this._insideSphere = config.insideView;
		this._version = config.version

		this._pMatrix = null;
		this._mvMatrix = null;
		this._model = null;
		this._camera = null;
		this._gl = null;
		this._rayPicker = null;
		this._healpix = [];
		this._order = 3;
		
		this._selectionnside = 32;
		this._baseUrl = "http://skyint.esac.esa.int/esasky-tap/";
		this._healpix4footprints = false;
		this._showConvexPolygons = false; // used in FPCatalogue to drawing convex polygons together with the original footprints (for debug)
		this._showPointsInPolygons = false;
		this._defaultHips = null;
		this._blendMode = false;
	
	}

	get version(){
		return this._version
	}

	set corsProxyUrl(url) {
		this._corsProxyUrl = url;
	}

	get corsProxyUrl() {
		return this._corsProxyUrl;
	}
	get useCORSProxy(){
		return this._useCORSProxy;
	}

	set useCORSProxy(enabled){
		this._useCORSProxy = enabled;
	}

	get debug() {
		return this._debug;
	}

	getTAPProviders() {
		return this._TAPProviders;
	}

	setSelectedHiPS(hips) {
		this._selectedHiPS = hips;
	}

	getSelectedHiPS() {
		return this._selectedHiPS;
	}

	getHealpix(order) {
		if (this._healpix[order] == undefined) {
			this._healpix[order] = new Healpix(Math.pow(2, order));
		}
		return this._healpix[order];
	}

	get MAX_DECIMALS() {
		return this._maxDecimals;
	}

	get pMatrix() {
		return this._pMatrix;
	}
	// IS IT USED?!?
	get mvMatrix() {
		return this._mvMatrix;
	}

	get model() {
		return this._model;
	}

	get camera() {
		return this._camera;
	}

	get gl() {
		return this._gl;
	}

	get rayPicker() {
		return this._rayPicker;
	}

	set pMatrix(in_pMatrix) {
		this._pMatrix = in_pMatrix;
	}
	// TODO
	set mvMatrix(in_mvMatrix) {
		this._mvMatrix = in_mvMatrix;
	}

	set model(in_model) {
		this._model = in_model;
	}

	set camera(in_camera) {
		this._camera = in_camera;
	}

	set gl(in_gl) {
		this._gl = in_gl;
	}
	// TODO
	set rayPicker(in_rayPicker) {
		this._rayPicker = in_rayPicker;
	}


	set order(in_order) {
		this._order = in_order;
	}

	get order() {
		return this._order;
	}

	set insideSphere(in_insideSphere) {
		this._insideSphere = in_insideSphere;
		eventBus.fireEvent(new InsideSphereSelectionChangedEvent(in_insideSphere));
	}

	get insideSphere() {
		return this._insideSphere;
	}

	get baseUrl() {
		return this._baseUrl;
	}

	get nsideForSelection() {
		return this._selectionnside;
	}

	get healpix4footprints() {
		return this._healpix4footprints;
	}

	get showConvexPolygons() {
		return this._showConvexPolygons;
	}

	get showPointsInPolygons() {
		return this._showPointsInPolygons;
	}



	get defaultHips() {

		if (this._defaultHips == null) {
			const self = this
			this._defaultHips = addHiPS("https://skies.esac.esa.int/DSSColor/").then((descriptor) => {
				self._defaultHips = new HiPS(1, [0.0, 0.0, 0.0], 0, 0, descriptor.surveyName, self._defaultHipsUrl, "jpg", descriptor.maxOrder, false, descriptor);
				self._defaultHips.refreshModel(180);
				self._selectedHiPS = self._defaultHips;	
				return this._defaultHips;
			});

			

		}
		return this._defaultHips;
	}

	get blendMode() {
		return this._blendMode;
	}

	set hipsFoV(fov) {
		this._hipsFoV = fov;
	}

	get hipsFoV() {
		return this._hipsFoV;
	}

	getConfig_cameraFovDeg(){
		return config.camera.fovDeg;
	}
	
	getConfig_nearPlane(){
		return config.camera.nearPlane;
	}

	getConfig_cameraFarPlane(){
		return config.camera.farPlane;
	}

}

var global = new Global();

export default global;