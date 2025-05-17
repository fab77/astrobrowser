"use strict";


import { session } from '../../../utils/Session.js';
import { tapRepoSingleton } from '../../../repos/tap/TapRepoService.js';
import CatalogueSettingsEvent from './events/CatalogueSettingsEvent.js';
import CatalogueSettingsChangeEvent from './events/CatalogueSettingsChangeEvent.js';

import eventBus from '../../../events/EventBus.js';
import CatalogueCloseEvent from './events/CatalogueCloseEvent.js';


class CatalogueListPresenter {

	_view;
	_model;
	_id;

	constructor(in_view) {

		this._view = in_view;
		this._model = null;
		this._id = 0;
		this.registerForEvents();
	}

	get view() {
		return this._view;
	}

	/**
	 * 
	 * @param {TapRepopo} tapRepo 
	 */
	addCatalogues(tapRepo) {

		let catalogues = tapRepo.cataloguesList;
		let tableData = [];
		for (const [key, catalogue] of catalogues.entries()) {
			tableData.push({ id: this._id, selected: false, name: catalogue.name, settings: 'gear', model: catalogue })
			this._id++
		}
		if (tableData.length > 0) {
			this._view.addTapRepo(tapRepo, tableData, this.catalogueSelected, this.openCatalogueSettingsPanel);
		}

	}

	refreshCataloguesView() {
		this._view.clear();
	}

	catalogueSelected(tapRepo, catalogue, checked) {
		if (checked) {
			tapRepoSingleton.queryCatalogueByFoV(tapRepo, catalogue, null);
			session.activateCatalogue(catalogue);
		} else {
			// tapRepoSingleton.removeCatalogue(_self._model.name);
			session.deactivateCatalogue(catalogue);
			eventBus.fireEvent(new CatalogueCloseEvent(catalogue))
		}
	}

	openCatalogueSettingsPanel(catalogue, tapRepo) {
		eventBus.fireEvent(new CatalogueSettingsEvent(catalogue, tapRepo));
	}

	registerForEvents() {
		eventBus.registerForEvent(this, CatalogueSettingsChangeEvent.name);
	}

	notify(event) {
		if (event instanceof CatalogueSettingsChangeEvent) {

			let refreshQueryByFov = event.catalogue.updateColumnMappingByName(event.ra, event.dec, event.sourcename, event.shape, event.color, event.hue);
			if (refreshQueryByFov) {
				tapRepoSingleton.queryCatalogueByFoV(event.tapRepo, event.catalogue, null);
			}

		}

	}
}
export default CatalogueListPresenter;