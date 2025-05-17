"use strict";
/**
 * @author Fabrizio Giordano (Fab)
 */

import { FITSWriter } from 'jsfitsio';

import eventBus from '../../../events/EventBus.js';
import OpenPanelEvent from '../../../events/OpenPanelEvent.js';


class ToolbarPanelPresenter {

    _view;
    _fitsdata;
    _img;

    // TODO check where to pass the FITS and the IMAGE
    constructor(in_view){

		this._view = in_view;
		let self  = this;

		var _public = {

			refreshModel: (fitsdata, img)=>{
				self.setModel(fitsdata, img);
			},
            refreshImage: (img)=>{
				self._img = img;
			},
            setModel: (fitsdata, img)=>{
                self._fitsdata = fitsdata;
                self._img = img;
                let url = self.generateFITSUrl();
                self._view.setDownloadFits(url);
			},
            saveFITS: ()=> {
                // TODO implement save method
                console.log("SAVE FITS");
                this.exportFITS();
            },
            saveImage: ()=>{
                // TODO implement save method
                console.log("SAVE IMAGE");
                this.exportImage();
            },
            showFITSHeader: ()=>{
                // TODO this must call the view
                console.log("SHOW FITS HEADER");
                this.showFITSHeader();
            },
			toggle: ()=> {
				self._view.toggle();
			},
			close: ()=> {
				self._view.close();
			}
		}
        this.addButtonsClickHandlers();
		return _public;
	}

    addButtonsClickHandlers() {

        this._view.fitsHeaderButton().on("click", {caller: this}, this.showFITSHeader);
		// this._view.fitsExportButton().on("click", {caller: this}, this.exportFITS);
		this._view.imageExportButton().on("click", {caller: this}, this.exportImage);

        this._view.closeDataExplorerButton().on("click", {caller: this}, function() {
            eventBus.fireEvent(new OpenPanelEvent("DataExplorer"));
        });
		
    }

	showFITSHeader(event) {
        console.log("clicked on showFITSHeader");

        event.data.caller._view.toggleFITSPanel();

        

        console.log(event.data.caller._fitsdata.fitsheader);
        // TODO update view
        event.data.caller._view.fillFitsHeaderPopup(event.data.caller._fitsdata.fitsheader[0]);
    }

	exportFITS(event) {
        console.log("clicked on exportFITS");
        console.log(event.data.caller._fitsdata);
        // let fw = new FITSWriter();
        // fw.run(event.data.caller._fitsdata.fitsheader, event.data.caller._fitsdata.fitsdata);
        // fw.typedArrayToURL();
		// TODO save the file
        // possible solution <a href="path_to_file" download="proposed_file_name"><button>export fits</button></a>

	}

    generateFITSUrl(){
        let fw = new FITSWriter();
        fw.run(this._fitsdata.fitsheader[0], this._fitsdata.fitsdata.get(0));
        return fw.typedArrayToURL();
    }

	exportImage(event) {
        console.log("clicked on exportImage");
        console.log(event.data.caller._img);
		// TODO save the file
	}

    get view(){
		return this._view;
	}

}

export default ToolbarPanelPresenter;