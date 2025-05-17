"use strict";



import CutoutPanelView from "../cutoutpanel/CutoutPanelView.js";
import CutoutPanelPresenter from '../cutoutpanel/CutoutPanelPresenter.js';

import InsideSphereSelectionChangedEvent from '../../../events/InsideSphereSelectionChangedEvent.js';
import eventBus from '../../../events/EventBus.js';
import HiPS from '../../../model/hipsnew/HiPS.js';

import { addHiPSNode, addHiPS } from '../../../repos/HiPSNodeRepo.js';
import global from '../../../Global.js';
import config from '../../../config.json';

import { session } from '../../../utils/Session.js';
import ColorMaps from "../../dataexplorer/model/ColorMaps.js";

class HiPSListPresenter {

	_id;
	_view;
	_visibileHiPS;

	constructor(in_view) {
		this._visibileHiPS = [];
		this._view = in_view;
		this._model = null;
		this.hipsPresenters = [];
		this.timeCounter = 0;
		this._id = 0;
		eventBus.registerForEvent(this, InsideSphereSelectionChangedEvent.name);

		let _self = this;


		global._HiPSNodes.forEach((hipsNodeUrl) => {

			let tableData = [];
			addHiPSNode(hipsNodeUrl).then((hipslist) => {

				let promises = [];

				if (hipslist !== undefined) {
					hipslist.forEach((hipsurl) => {

						promises.push(addHiPS(hipsurl).then((descriptor) => {

							// let dtIcon = undefined;
							// const dtEnabled = descriptor.imgFormats.includes("fits") ? true : false;
							// if (dtEnabled) {
							// 	dtIcon = "scissor.svg";
							// }

							// console.log(config.defaultHipsUrl)
							// console.log(hipsurl.replace('http:','').replace('https:',''))
							// console.log(hipsurl.replace('http:','').replace('https:','') == config)

							// DEFAULT HIPS SELECTION!!!
							// let selected = global.defaultHips.name === descriptor.surveyName && config.defaultHipsUrl == hipsurl.replace('/http:','').replace('/https:','') ? true : false;
							let selected = config.defaultHipsUrl == hipsurl.replace('http:','').replace('https:','') ? true : false;
							if (selected) {
								session.activateHiPS(global.defaultHips);
							}
							let hips = selected ? global.defaultHips : null;
							const coordSystem = descriptor.isGalactic ? "galactic" : "equatorial"
							tableData.push({
								id: _self._id,
								selected: selected,
								name: descriptor.surveyName,
								image_format: descriptor.imgFormats,
								coord_sys: coordSystem,
								// data_explorer: dtIcon,
								em_min: descriptor.emMin,
								em_max: descriptor.emMax,
								descriptor: descriptor,
								hips: hips
							})

							_self._id++;

						}));

					})


					// promises.push(addHiPS("https://alasky.cds.unistra.fr/Pan-STARRS/DR1/g").then((descriptor) => {

					// 	let dtIcon = undefined;
					// 	const dtEnabled = descriptor.imgFormats.includes("fits") ? true : false;
					// 	if (dtEnabled) {
					// 		dtIcon = "scissor.svg";
					// 	}
					// 	let selected = (global.defaultHips.name === descriptor.surveyName) ? true : false;
					// 	if (selected) {
					// 		session.activateHiPS(global.defaultHips);
					// 	}
					// 	let hips = selected ? global.defaultHips : null;
					// 	const coordSystem = descriptor.isGalactic ? "galactic" : "equatorial"
					// 	tableData.push({
					// 		id: _self._id,
					// 		selected: selected,
					// 		name: descriptor.surveyName,
					// 		image_format: descriptor.imgFormats,
					// 		coord_sys: coordSystem,
					// 		data_explorer: dtIcon,
					// 		descriptor: descriptor,
					// 		hips: hips
					// 	})

					// 	_self._id++;

					// }));


					Promise.all(promises).then(() => {
						if (tableData.length > 0) {
							_self._view.addHiPSNode(hipsNodeUrl, tableData, _self.hipsSelectionHandler, _self.cutoutFormHandler, _self);
						}
					})

				}
			}).catch(function (err) {
				console.log("[HiPSListPresenter] " + err);
			});

		});

		this.addButtonsClickHandlers();
		this.registerForEvents();
		// this.initCutoutForm();
	}

	registerForEvents() {
		// eventBus.registerForEvent(this, OpenDataExplorerPanelEvent.name);
		// eventBus.registerForEvent(this, OpenPanelEvent.name);
	}

	notify(event) {

		// switch (event.constructor) {
		// 	case OpenDataExplorerPanelEvent:
		// 		console.log("OpenDataExplorerPanelEvent")
		// 		if (!this._dataExplorerPresenter) {
		// 			this._dataExplorerView = new DEView();
		// 			this._dataExplorerPresenter = new DEPresenter(this._dataExplorerView);
		// 			this.view.openDataExplorer(this._dataExplorerView.getHtml());
		// 		}
		// 		this._dataExplorerPresenter.toggle();
		// 		this._dataExplorerPresenter.refreshModel(event.pxSize, event.craDeg, event.cdecDeg, event.radiusDeg, event.projectionName, event._hipsURL);
		// 		break;

		// 	case OpenPanelEvent:
		// 		console.log("OpenPanelEvent")
		// 		if (event.panelName == "DataExplorer") {
		// 			this._dataExplorerPresenter.toggle();
		// 		}
		// 		break;
		// }
	}

	initCutoutForm() {
		this._cutoutPanelView = new CutoutPanelView();
		this._cutoutPresenter = new CutoutPanelPresenter(this._cutoutPanelView);
		this.view.openCutoutForm(this._cutoutPanelView.getHtml());
	}

	cutoutFormHandler(descriptor, caller) {
		caller._cutoutPresenter.toggle(descriptor)
	}

	hipsSelectionHandler(descriptor, checked, rowId, remove_thi_variable_hips, hipsNodeId, caller) {
		console.log(session.activeHiPS)
		session.activeHiPS.forEach( (h) => {
			console.log("deactivating hips "+ h)
			session.deactivateHiPS(h);
		})
		console.log(session.activeHiPS)

		let formats = descriptor.imgFormats; // getting first format available (//TODO check that it's not fits)
		let format;
		formats.forEach( (f) => {
			if (f == 'png' || f == 'jpg')
				format = f;
		});
		// let opacity = this.view.getSelectedOpacity() / 100; // TODO handle opacity here
		let opacity = 1.0; // TODO not used in HiPS. review it! and review global.defaultHiPS in which I am passing 9 (max order) instead of opacity
		// const isGalactic = descriptor.hipsFrame == 'galactic' ? true : false; // TODO handle Galactic frame
		const isGalactic = false;
		let hips = new HiPS(1, [0.0, 0.0, 0.0],
			0,
			0, descriptor.surveyName,
			descriptor.url, format,
			opacity, isGalactic, descriptor);
		session.activateHiPS(hips);
		caller._view.hipsActivated(rowId, hips, hipsNodeId);


		// if (!checked) {
		// 	session.deactivateHiPS(hips);
		// } else {
		// 	// let format = descriptor.imgFormats[1]; // getting first format available (//TODO check that it's not fits)
		// 	let formats = descriptor.imgFormats; // getting first format available (//TODO check that it's not fits)
		// 	let format;
		// 	formats.forEach( (f) => {
		// 		if (f == 'png' || f == 'jpg')
		// 			format = f;
		// 	});
		// 	// let opacity = this.view.getSelectedOpacity() / 100; // TODO handle opacity here
		// 	let opacity = 1.0; // TODO not used in HiPS. review it! and review global.defaultHiPS in which I am passing 9 (max order) instead of opacity
		// 	// const isGalactic = descriptor.hipsFrame == 'galactic' ? true : false; // TODO handle Galactic frame
		// 	const isGalactic = false;
		// 	let hips = new HiPS(1, [0.0, 0.0, 0.0],
		// 		0,
		// 		0, descriptor.surveyName,
		// 		descriptor.url, format,
		// 		opacity, isGalactic, descriptor);
		// 	session.activateHiPS(hips);
		// 	caller._view.hipsActivated(rowId, hips, hipsNodeId);
		// }
	}



	addButtonsClickHandlers() {

		this.view.colorMapDropDown().on("change", { caller: this }, this.colorMapChanged);
		this.view.invertColorMap().on("change", { caller: this }, this.invertColorChanged);

		this.view.filterField().on("change", { caller: this }, this.updateFilter)
        this.view.filterType().on("change", { caller: this }, this.updateFilter)
        this.view.filterValue().on("keyup", { caller: this }, this.updateFilter)
        this.view.clearFilter().on("click", { caller: this  }, this.clearFilterClicked)
        

	}

	clearFilterClicked(event) {
        console.log("clearFilter")
		let view = event.data.caller.view
        view.clearFilterClicked();
    }

    updateFilter(event) {
        console.log("updateFilter")
		let view = event.data.caller.view
        let filterVal = view.filterField().val();
        let typeVal = view.filterType().val();
		let value = view.filterValue().val()

        let filter = filterVal;
        view.filterType().disabled = false;
        view.filterValue().disabled = false;


        if (filterVal) {
            view.filterTable(filter, typeVal, value);
        }
    }
	colorMapChanged(event) {
		let valueSelected = this.value;
		console.log(valueSelected)
		let caller = event.data.caller;
		session.activeHiPS.forEach(hips => {
			hips.changeColorMap(ColorMaps[valueSelected]);
		});

	}

	invertColorChanged(event) {
		let target = event.target;
		let checked = target.checked;
		console.log(checked)

	}


	get view() {
		return this._view;
	}



	toggle() {
		this._view.toggle();
	}



}
export default HiPSListPresenter;