"use strict";
import TapRepo from '../../../repos/tap/TapRepo.js';
/**
 * @author Fabrizio Giordano (Fab77)
 */

import { session } from '../../../utils/Session.js';
import { tapRepoSingleton } from '../../../repos/tap/TapRepoService.js';
import FootprintSettingsEvent from './events/FootprintSettingsEvent.js';
import eventBus from '../../../events/EventBus.js';
import FootprintSettingsChangeEvent from './events/FootprintSettingsChangeEvent.js';
import FootprintSetCloseEvent from './events/FootprintSetCloseEvent.js';

class FootprintListPresenter {
	_view;
	_id;

	constructor(in_view) {
		this._view = in_view;
		this._id = 0;
		this.registerForEvents();
	}

	get view() {
		return this._view;
	}


	/**
	 * 
	 * @param {TapRepo} tapRepo 
	 */
	addFootprintsSet = (tapRepo) => {

		let footprints = tapRepo.observationsList;
		let tableData = [];
		for (const [key, fpSet] of footprints.entries()) {
			tableData.push({ id: this._id, selected: false, name: fpSet.name, settings: 'gear', model: fpSet })
			this._id++

		}
		if (tableData.length > 0) {
			this._view.addTapRepo(tapRepo, tableData, this.fpsetSelected, this.openFpSetSettingsPanel);
		}

	}

	refreshCataloguesView() {
		this._view.clear();
	}

	fpsetSelected(tapRepo, fpset, checked) {
		if (checked) {
			tapRepoSingleton.queryObservationByFoV(tapRepo, fpset, null);
			session.activateFootprintSet(fpset);
		} else {
			session.deactivateFootprintSet(fpset);
			eventBus.fireEvent(new FootprintSetCloseEvent(fpset))
		}
	}

	openFpSetSettingsPanel(fpset, tapRepo) {
		eventBus.fireEvent(new FootprintSettingsEvent(fpset, tapRepo));
	}

	registerForEvents() {
		eventBus.registerForEvent(this, FootprintSettingsChangeEvent.name);
	}

	notify(event) {
		if (event instanceof FootprintSettingsChangeEvent) {


			let refreshQueryByFov = event.fpSet.updateColumnMappingByName(event.geometry, event.obsName, event.color, event.hue);
			if (refreshQueryByFov) {
				tapRepoSingleton.queryObservationByFoV(event.tapRepo, event.fpSet, null);
			}
		}
	}

}

export default FootprintListPresenter;

