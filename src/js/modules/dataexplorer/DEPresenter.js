"use strict";
/**
 * @author Fabrizio Giordano (Fab)
 */

// import DEView from "./DEView.js";
import $ from "jquery";

import { WCSLight, HiPSProjection, MercatorProjection, Point, CoordsType, NumberType } from 'wcslight';
import CtrlPanelPresenter from './ctrlpanel/CtrlPanelPresenter.js';
import CtrlPanelView from './ctrlpanel/CtrlPanelView.js';
import Canvas2D from './model/Canvas2D.js';
import CanvasPanelView from './canvaspanel/CanvasPanelView.js';
import CanvasPanelPresenter from './canvaspanel/CanvasPanelPresenter.js';

import eventBus from '../../events/EventBus.js';
import ColorMapChangeEvent from './events/ColorMapChangeEvent.js';
import ScaleFunctionChangeEvent from './events/ScaleFunctionChangeEvent.js';
import InvertColorMapEvent from './events/InvertColorMapEvent.js';
import ToolbarPanelView from './toolbarpanel/ToolbarPanelView.js';
import ToolbarPanelPresenter from './toolbarpanel/ToolabarPanelPresenter.js';
import FooterView from "./footbar/FooterView.js";
import FooterPresenter from "./footbar/FooterPresenter.js";

class DEPresenter {

	_pxSize;
	_raDeg;
	_decDeg;
	_radius;
	_projection;
	_ctrlView;
	_model;
	_canvas2d;



	constructor(view) {

		this.init(view);
		this._ctrlPresenter = undefined;
		var _public = {

			refreshModel: (pxSize, raDeg, decDeg, radius, projectionName, fitsURL) => {
				this.setModel(pxSize, raDeg, decDeg, radius, projectionName, fitsURL);
				this.callWCS();
			},
			toggle: () => {
				this._view.toggle();
				if (this._view.isVisible()) {
					if (this._ctrlPresenter == undefined) {
						this.initChildrenPresenters();
					}
					this._canvasPresenter.clear();
					this._footerPresenter.clear();
				}
			},
			close: () => {
				this._view.close();
			}

		}
		// this.addButtonsClickHandlers();
		return _public;
	}

	init(view) {
		this._view = view;
		this.registerForEvents();

	}


	registerForEvents() {

		eventBus.registerForEvent(this, ColorMapChangeEvent.name);
		eventBus.registerForEvent(this, ScaleFunctionChangeEvent.name);
		eventBus.registerForEvent(this, InvertColorMapEvent.name);

		// eventBus.registerForEvent(this, ShowFITSHeaderEvent.name);
		// eventBus.registerForEvent(this, ExportFITSEvent.name);
		// eventBus.registerForEvent(this, ExportImageEvent.name);

	}

	notify(in_event) {

		if (in_event instanceof ColorMapChangeEvent) {
			console.log("catched ColorMapChangeEvent " + in_event.colorMapName);
			this._canvas2d.setColorMap(in_event.colorMapName);
			this._canvas2d.applyColorAndTransferFunction();
			let img = this._canvas2d.getBrowseImage();
			this._canvasPresenter.refreshModel(img);
			this._tbarPresenter.refreshImage(this._canvas2d.getBrowseImage());

		} else if (in_event instanceof ScaleFunctionChangeEvent) {
			console.log("catched ScaleFunctionChangeEvent " + in_event.scaleFunctionName);
			this._canvas2d.setTransferFunction(in_event.scaleFunctionName);
			this._canvas2d.applyColorAndTransferFunction();
			let img = this._canvas2d.getBrowseImage();
			this._canvasPresenter.refreshModel(img);
			this._tbarPresenter.refreshImage(this._canvas2d.getBrowseImage());

		} else if (in_event instanceof InvertColorMapEvent) {
			console.log("catched InvertColorMapEvent " + in_event.isInverted)
			this._canvas2d.setInverseColorMap(in_event.isInverted);
			this._canvas2d.applyColorAndTransferFunction();
			let img = this._canvas2d.getBrowseImage();
			this._canvasPresenter.refreshModel(img);
			this._tbarPresenter.refreshImage(this._canvas2d.getBrowseImage());

		}
		//  else if (in_event instanceof ShowFITSHeaderEvent) {
		// 	console.log("Catched ShowFITSHeaderEvent");
		// 	console.log(this._model);
		// 	this._tbarPresenter.showFITSHeader();

		// } else if (in_event instanceof ExportFITSEvent) {
		// 	console.log("Catched ExportFITSEvent");
		// 	console.log(this._model);
		// 	this._tbarPresenter.saveFITS();

		// } else if (in_event instanceof ExportImageEvent) {
		// 	console.log("Catched ExportImageEvent");
		// 	console.log(this._canvas2d.getBrowseImage());
		// 	this._tbarPresenter.refreshImage(this._canvas2d.getBrowseImage());
		// 	this._tbarPresenter.saveImage();

		// }

	}


	setModel(pxSize, raDeg, decDeg, radius, projectionName, fitsURL) {

		this._pxSize = pxSize;
		this._raDeg = raDeg;
		this._decDeg = decDeg;
		this._radius = radius;
		this._projection = WCSLight.getProjection(projectionName);
		this._ctrlView.setModel(this._pxSize, this._raDeg, this._decDeg, this._radius, projectionName);
		this._fitsURL = fitsURL;
	}

	callWCS() {
		/** HiPS to MER */
		// let center = {"ra": this._raDeg, "dec": this._decDeg};

		this._canvasPresenter.showLoading(true);
		let _self = this;

		let center = new Point(CoordsType.ASTRO, NumberType.DEGREES, this._raDeg, this._decDeg);
		let radius = this._radius;
		let pxsize = this._pxSize;
		// TODO this must be passed
		// let hipsBaseUri = "https://skies.esac.esa.int/Herschel/normalized/PACS_hips160/";
		let hipsBaseUri = this._fitsURL;

		let inproj = new HiPSProjection();
		
		inproj.parsePropertiesFile(hipsBaseUri).then(async propFile => {

			inproj.initFromHiPSLocationAndPxSize(hipsBaseUri, pxsize)
			let outproj = new MercatorProjection();
			let canvasPresenter = this._canvasPresenter;
			let tbarPresenter = this._tbarPresenter;
			let dePresenter = this;

			WCSLight.cutout(center, radius, pxsize, inproj, outproj).then((result) => {
				if (result.fitsused.length > 0){
					dePresenter._model = result;
					dePresenter._canvas2d = new Canvas2D(result.fitsdata, result.fitsheader, result.outproj);
					let img = dePresenter._canvas2d.getBrowseImage();
	
					tbarPresenter.setModel(dePresenter._model, img);
					canvasPresenter.refreshModel(img);
					dePresenter.setImageListener();
					_self._canvasPresenter.showLoading(false);
					_self._footerPresenter.addFitsUrls(result.fitsused)
				} else {
					_self._canvasPresenter.showNoDataFound();
				}
				
			})
			// .catch(function (err) {
			// 	console.log("[index.js] " + err);
			// 	_self._canvasPresenter.showLoading(false);
			// });

		});



	}

	setImageListener() {

		let dePresenter = this;
		$("#canvas_img").mousemove(function (e) {

			let bounds = this.getBoundingClientRect();
			let left = Math.floor(bounds.left);
			let top = Math.floor(bounds.top);
			let imgWidth = this.width;
			let imgHeight = this.height;
			let x = e.pageX - left;
			// FITS image is flipped in respect at HTML Image
			let y = imgHeight - (e.pageY - top);

			if (x <= imgWidth && y <= imgHeight && x > 0 && y > 0) {
				let p_value = dePresenter._canvas2d.getValueByCanvasCoords(x - 1, y - 1);
				let p_coord = dePresenter._canvas2d.getRaDecByCanvasCoords(x - 1, y - 1);
				dePresenter._ctrlPresenter.refreshPixelDetails(p_value, x, y, p_coord);

			}


		});
	}

	initChildrenPresenters() {

		this._ctrlView = new CtrlPanelView();
		this._view.attachCtrlPanel(this._ctrlView.getHtml());
		this._ctrlPresenter = new CtrlPanelPresenter(this._ctrlView);

		this._canvasView = new CanvasPanelView();
		this._canvasPresenter = new CanvasPanelPresenter(this._canvasView);
		this._view.attachCanvasPanel(this._canvasView.getHtml());

		this._tbarView = new ToolbarPanelView();
		this._view.attachToolbarPanel(this._tbarView.getHtml());
		this._tbarPresenter = new ToolbarPanelPresenter(this._tbarView);

		this._footerView = new FooterView();
		this._view.attachFooterPanel(this._footerView.getHtml());
		this._footerPresenter = new FooterPresenter(this._footerView);


	}
}

export default DEPresenter;