"use strict";

import $ from "jquery";

import global from '../../../Global.js';
import FoVUtils from '../../../utils/FoVUtils.js';
// import OpenPanelEvent from '../../../events/OpenPanelEvent.js';
import OpenDataExplorerPanelEvent from '../../../events/OpenDataExplorerPanelEvent.js';
import eventBus from '../../../events/EventBus.js';
import { session } from "../../../utils/Session.js";

class CutoutPanelPresenter {

	_view;
	_center;
	_handlerInitialized;
	_refreshId;
	_descriptor;


	constructor(in_view) {

		this.init(in_view);

		// this.register4Events();

		const _public = {

			toggle: (descriptor) => {
				// console.log(session)
				
				const hips = session._activeHiPS[0]
				const url = hips._descriptor.url;
				this._descriptor = hips._descriptor;

				// const url = descriptor.url;
				// this._descriptor = descriptor;

				if (!this._handlerInitialized) {
					this.addButtonsClickHandlers();
				}

				// this._view.toggle(hips.descriptor.surveyName);
				this._view.toggle(this._descriptor.surveyName);

				if (this._view.isVisible()) {

					let self = this;
					let getCenterFunction = FoVUtils.getCenterJ2000;
					let canvas = global.gl.canvas;
					this._refreshId = setInterval(function () {
						self._center = getCenterFunction(canvas);
						self._view.setModel(self._center);
					}, 500);

				} else {
					clearInterval(this._refreshId);
				}
			},
			close: () => {
				this._view.close();
			}
		}

		return _public;
	}

	init(_view) {

		this._view = _view;
		this._handlerInitialized = false;

	}

	// register4Events() {
	// 	eventBus.registerForEvent(this, OpenPanelEvent.name);
	// }

	// notify(in_event) {

	// 	switch (in_event.constructor) {
	// 		case OpenPanelEvent:
	// 			if (in_event.panelName == "DataExplorer") {
	// 				this._dePresenter.toggle();
	// 			}
	// 			break;
	// 	}
	// }

	get view() {
		return this._view;
	}

	addButtonsClickHandlers() {

		let self = this;

		$("#cto_go").on("click", () => {

			console.log("clicked on Data explorer button");

			let pxSize = Number($("#cto_pxsize").val());
			let cRA = Number($("#cto_cRA").val());
			let cDec = Number($("#cto_cDec").val());
			let radius = Number($("#cto_radius").val());
			let projection = $("#cto_proj :selected").text();

			const url = this._descriptor.url;
			eventBus.fireEvent(new OpenDataExplorerPanelEvent(cRA, cDec, pxSize, radius, projection, this._descriptor.url));
			self.view.toggle();

		});
		this._handlerInitialized = true;
	}

}
export default CutoutPanelPresenter;