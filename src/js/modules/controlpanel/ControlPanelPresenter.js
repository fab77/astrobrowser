/**
 * @author Fabrizio Giordano (Fab)
 */
"use strict";

import $ from "jquery";

import global from '../../Global.js';


import eventBus from '../../events/EventBus.js';
import OpenPanelEvent from '../../events/OpenPanelEvent.js';

import ControlPanelView from './ControlPanelView.js';

import FootprintPanelView from './footprintpanel/FootprintPanelView.js';
import FootprintListPresenter from './footprintpanel/FootprintListPresenter.js';
import FootprintSettingsEvent from "./footprintpanel/events/FootprintSettingsEvent.js";
import FootprintSettingsView from "./footprintpanel/FootprintSettingsView.js";
import FootprintSettingsPresenter from "./footprintpanel/FootprintSettingsPresenter.js";
import CloseFootprintSettingsEvent from "./footprintpanel/events/CloseFootprintSettingsEvent.js";

import HiPSPanelView from './hipspanel/HiPSPanelView.js';
import HiPSListPresenter from './hipspanel/HiPSListPresenter.js';
// import HiPSSettingsView from './hipspanel/HiPSSettingsView.js';
// import HiPSSettingsPresenter from './hipspanel/HiPSSettingsPresenter.js';
// import HiPSSettingsEvent from "./hipspanel/events/HiPSSettingsEvent.js";
// import CloseHiPSSettingsEvent from "./hipspanel/events/CloseHiPSSettingsEvent.js";

import SettingsPanelView from '../../view/SettingsPanelView.js';
import SettingsPresenter from '../../presenter/SettingsPresenter.js';

import CutoutPanelView from "./cutoutpanel/CutoutPanelView.js";
import CutoutPanelPresenter from './cutoutpanel/CutoutPanelPresenter.js';
import CloseCutoutCloseEvent from "./cutoutpanel/events/CloseCutoutCloseEvent.js";

import CataloguePanelView from './cataloguepanel/CataloguePanelView.js';
import CatalogueListPresenter from './cataloguepanel/CatalogueListPresenter.js';
import { tapRepoSingleton } from '../../repos/tap/TapRepoService.js';
import CatalogueSettingsEvent from "./cataloguepanel/events/CatalogueSettingsEvent.js";
import CatalogueSettingsView from "./cataloguepanel/CatalogueSettingsView.js";
import CatalogueSettingsPresenter from "./cataloguepanel/CatalogueSettingsPresenter.js";
import CloseCatalogueSettingsEvent from "./cataloguepanel/events/CloseCatalogueSettingsEvent.js";
import { session } from "../../utils/Session.js";
import GoToView from "./gotopanel/GoToView.js";
import GoToPresenter from "./gotopanel/GoToPresenter.js";
import HiPSSelectedEvent from "../../events/HiPSSelectedEvent.js";

import DEView from "../dataexplorer/DEView.js";
import DEPresenter from "../dataexplorer/DEPresenter.js";
import OpenDataExplorerPanelEvent from '../../events/OpenDataExplorerPanelEvent.js';

class ControlPanelPresenter{
	
	_view;
	_parentView;

	_gotoPresenter;
	_catalogueListPresenter;
	_footprintsListPresenter;
	_hipsListPresenter;
	_settingsPresenter;
	_cutoutPresenter;

	_catalogueRepo;
	_footprintRepo;
	_menuOpen = false;
	// _dataExplorerView;
	
	constructor(in_parentView){
		
		this._parentView = in_parentView;
		
		this._view  = new ControlPanelView();
		
		this.initPresenters();
		
		this._parentView.appendChild2(this._view.html);
		
		this.addButtonsClickHandlers();
		
		this.registerForEvents();

	}
	

	initPresenters(){

		let gotoView = new GoToView();
		this.view.appendChild(gotoView.getHtml());
		this._gotoPresenter = new GoToPresenter(gotoView);
		

		let cataloguePanelView = new CataloguePanelView();
		this._catalogueListPresenter = new CatalogueListPresenter(cataloguePanelView);
		this.view.appendChild(cataloguePanelView.getHtml());
		
		let footprintPanelView = new FootprintPanelView();
		this._footprintsListPresenter = new FootprintListPresenter(footprintPanelView);
		this.view.appendChild(footprintPanelView.getHtml());
		
		let tapUrls = global.getTAPProviders();
		for (let tapurl of tapUrls) {
			
			tapRepoSingleton.addRepos(tapurl).then( (tapRepo) => {

				session.addTapRepo(tapRepo);
				// TODO need to pass the TapRepo here that will be used in the _footprintsListPresenter->footprintPresenter->TapService.retrieveByFoV
				// this._catalogueListPresenter.addCatalogues(tapRepo.cataloguesList, tapurl);
				this._catalogueListPresenter.addCatalogues(tapRepo);
				this._footprintsListPresenter.addFootprintsSet(tapRepo);
				// this._footprintsListPresenter.addFootprintsSet(tapRepo.observationsList, tapurl);

				// TODO addNotClassified

			});
		}


		

		let hipsPanelView = new HiPSPanelView();
		this.view.appendChild(hipsPanelView.getHtml());
		this._hipsListPresenter = new HiPSListPresenter(hipsPanelView);
		

		let settingsPanelView = new SettingsPanelView(global.insideSphere);
		this._settingsPresenter = new SettingsPresenter(settingsPanelView);
		this.view.appendChild(settingsPanelView.getHtml());

		let cutoutPanelView = new CutoutPanelView();
		this._cutoutPresenter = new CutoutPanelPresenter(cutoutPanelView);
		this.view.appendChild(cutoutPanelView.getHtml());
		
	}

	refreshRepos(){
		
		let tapUrls = global.getTAPProviders();
		session.clearTapRepoList();
		this._catalogueListPresenter.refreshCataloguesView();
		this._footprintsListPresenter.refreshCataloguesView();
		
		for (let tapurl of tapUrls) {
			
			tapRepoSingleton.addRepos(tapurl).then( (tapRepo) => {
				
				session.addTapRepo(tapRepo);
				this._catalogueListPresenter.addCatalogues(tapRepo);
				this._footprintsListPresenter.addFootprintsSet(tapRepo);
				
				// TODO addNotClassified

			});
		}
	}
	
	get view(){
        return this._view;
    }

	addButtonsClickHandlers(){
		$("#hamburgerButton").on("click", ()=>{
			this.menuOpen = !this.menuOpen;
			$("#hamburgerButton").toggleClass("open") 
			$("#gotoButton").toggleClass("controlButtonVisible");	
			$("#cataloguesButton").toggleClass("controlButtonVisible");	
			$("#footprintsButton").toggleClass("controlButtonVisible");	
			$("#mapsButton").toggleClass("controlButtonVisible");	
			$("#settingsButton").toggleClass("controlButtonVisible");
			$("#cutoutButton").toggleClass("controlButtonVisible");
			// $("#dataExplorerButton").toggleClass("controlButtonVisible");
			
			if(!this.menuOpen){
				this._catalogueListPresenter.view.close()
				this._footprintsListPresenter.view.close()
				this._hipsListPresenter.view.close()
				this._settingsPresenter.close()
				this._cutoutPresenter.close()
			}
		} );
		$("#gotoButton").on("click", function(){eventBus.fireEvent(new OpenPanelEvent("GoTo")) } );
		$("#cataloguesButton").on("click", function(){eventBus.fireEvent(new OpenPanelEvent("Catalogues")) } );
		$("#footprintsButton").on("click", function(){eventBus.fireEvent(new OpenPanelEvent("Imaging")) } );
		$("#mapsButton").on("click", function(){eventBus.fireEvent(new OpenPanelEvent("Maps")) } );
		$("#settingsButton").on("click", function(){eventBus.fireEvent(new OpenPanelEvent("Settings")) } );
		// $("#cutoutButton").on("click", function(){eventBus.fireEvent(new OpenPanelEvent("Cutout")) } );
		$("#dataExplorerButton").on("click", function(){eventBus.fireEvent(new OpenPanelEvent("DataExplorer")) } );
		

	}

	registerForEvents(){
		// eventBus.registerForEvent(this, OpenPanelEvent.name);
		
		eventBus.registerForEvent(this, CatalogueSettingsEvent.name);
		eventBus.registerForEvent(this, CloseCatalogueSettingsEvent.name);
		
		eventBus.registerForEvent(this, FootprintSettingsEvent.name);
		eventBus.registerForEvent(this, CloseFootprintSettingsEvent.name);
		
		// eventBus.registerForEvent(this, HiPSSettingsEvent.name);
		// eventBus.registerForEvent(this, CloseHiPSSettingsEvent.name);

		eventBus.registerForEvent(this, HiPSSelectedEvent.name);
		eventBus.registerForEvent(this, CloseCutoutCloseEvent.name);

		eventBus.registerForEvent(this, OpenDataExplorerPanelEvent.name);
		eventBus.registerForEvent(this, OpenPanelEvent.name);
	}
	
	notify(in_event){

		console.log(`Received OpenPanelEvent ${in_event.panelName} `)

		if (in_event instanceof OpenPanelEvent){
			
			if (in_event.panelName == "GoTo"){

				this._gotoPresenter.view.toggle()

			} else if (in_event.panelName == "Catalogues"){

				this._catalogueListPresenter.view.toggle()

			} else if (in_event.panelName == "Imaging"){

				this._footprintsListPresenter.view.toggle()

			} else if (in_event.panelName == "Maps"){

				this._hipsListPresenter.view.toggle()

			} else if (in_event.panelName == "Settings"){

				this._settingsPresenter.toggle()

			} else if (in_event.panelName == "Cutout"){

				this._cutoutPresenter.toggle()
			
			}  else if (in_event.panelName == "DataExplorer"){
				this._dataExplorerPresenter.toggle();
			}

			if (in_event.panelName !== "GoTo"){
				this._gotoPresenter.view.close()
			}
			if (in_event.panelName !== "Catalogues"){
				this._catalogueListPresenter.view.close()
			}
			if (in_event.panelName !== "Imaging"){
				this._footprintsListPresenter.view.close()
			}
			if (in_event.panelName !== "Maps"){
				this._hipsListPresenter.view.close()
			}
			if (in_event.panelName !== "Settings"){
				this._settingsPresenter.close()
			}
			if (in_event.panelName !== "Cutout"){
				this._cutoutPresenter.close()
			}
			// if (in_event.panelName !== "DataExplorer"){
			// 	this._dataExplorerPresenter.close()
			// }
			

		} else if (in_event instanceof CatalogueSettingsEvent) {
			
			let catSettingsView = new CatalogueSettingsView(in_event.catalogue);
			// ???
			let catSettingsPresenter = new CatalogueSettingsPresenter(catSettingsView, in_event.catalogue, in_event.tapRepo);
			this._view.showPopup(catSettingsView.getHtml());
		
		} else if (in_event instanceof CloseCatalogueSettingsEvent) {

			this._view.hidePopup();

		} else if (in_event instanceof FootprintSettingsEvent) {
		
			let fsSettingsView = new FootprintSettingsView(in_event.footprintSet);
			// ???
			let fsSettingsPresenter = new FootprintSettingsPresenter(fsSettingsView, in_event.footprintSet);
			this._view.showPopup(fsSettingsView.getHtml());

		} else if (in_event instanceof CloseFootprintSettingsEvent) {

			this._view.hidePopup();

		// } else if (in_event instanceof HiPSSettingsEvent) {
			
		// 	// ???
		// 	let hipsSettingsView = new HiPSSettingsView(in_event.descriptor);
		// 	this._view.showPopup(hipsSettingsView.getHtml());
		// 	let hipsSettingsPresenter = new HiPSSettingsPresenter(hipsSettingsView, in_event.descriptor);
			

		// }else if (in_event instanceof CloseHiPSSettingsEvent) {
		// 	this._view.hidePopup();

		} else if (in_event instanceof HiPSSelectedEvent){
			this.toggleFunctionalities();
		} else if (in_event instanceof OpenDataExplorerPanelEvent){
			console.log("OpenDataExplorerPanelEvent")
			console.log(OpenDataExplorerPanelEvent)
			if (!this._dataExplorerPresenter) {
				this._dataExplorerView = new DEView();
				this._dataExplorerPresenter = new DEPresenter(this._dataExplorerView);
				this.view.openDataExplorer(this._dataExplorerView.getHtml());
			}
			this._dataExplorerPresenter.toggle();
			this._dataExplorerPresenter.refreshModel(in_event.pxSize, in_event.craDeg, in_event.cdecDeg, in_event.radiusDeg, in_event.projectionName, in_event._hipsURL);
		}



	}
	
	toggleFunctionalities() {
		if (session.activeHiPS.length >= 1) {
			let hips = session.activeHiPS[0];
			if (hips._descriptor._imgformats.includes("fits") || 
				hips._descriptor._imgformats.includes("FITS") ){
					
					this._view.enableCutOutButton();
					$("#cutoutButton").on("click", function(){eventBus.fireEvent(new OpenPanelEvent("Cutout")) } );
			} else {
				// disable cutout panel
				this._view.disableCutOutButton();
				$("#cutoutButton").off("click", "**" );
			}
		}
	}


	get hipsListPresenter(){
		return this._hipsListPresenter;
	}

	refreshModel(){
		this._settingsPresenter.refreshModel();
		// this.toggleFunctionalities();
		
	}

	setSphericalCoordinates(phiThetaDeg){
		this._settingsPresenter.setSphericalCoordinates(phiThetaDeg);
	}
	
	
}
export default ControlPanelPresenter;