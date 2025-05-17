
"use strict";
/**
 * @author Fabrizio Giordano (Fab)
 */

import ColorMapChangeEvent from '../events/ColorMapChangeEvent.js';
import ScaleFunctionChangeEvent from '../events/ScaleFunctionChangeEvent.js';
import InvertColorMapEvent from '../events/InvertColorMapEvent.js';
import eventBus from '../../../events/EventBus.js';

class CtrlPanelPresenter {

    _view;

    constructor(in_view){

		this._view = in_view;
		let self  = this;
		var _public = {

			refreshModel: ()=>{
				self.setModel();
			},
			toggle: ()=> {
				self._view.toggle();
			},
			close: ()=> {
				self._view.close();
			},
			refreshPixelDetails(pxvalue, imgi, imgj, raDec) {
				self._view.refreshPixelDetails(pxvalue, imgi, imgj, raDec);
			}
		}
        this.addButtonsClickHandlers();
		return _public;
	}


    // init(_view){

	// 	this._view = _view;

	// }
	
    addButtonsClickHandlers() {

		this.view.colorMapDropDown().on("change", this.colorMapChanged);
		this.view.scaleFunctionDropDown().on("change", this.scaleFunctionChanged);
		this.view.invertColorMap().on("change", this.invertColorChanged);
		
    }

	
	colorMapChanged() {
        let valueSelected = this.value;
		console.log(valueSelected)
		eventBus.fireEvent(new ColorMapChangeEvent(valueSelected));
    }

	scaleFunctionChanged() {
		let valueSelected = this.value;
		console.log(valueSelected)
		eventBus.fireEvent(new ScaleFunctionChangeEvent(valueSelected));
	}

	invertColorChanged(event) {
		let target = event.target;
		let checked = target.checked;
		console.log(checked)
        eventBus.fireEvent(new InvertColorMapEvent(checked));
	}
    
	setModel(){

        this._center = FoVUtils.getCenterJ2000(global.gl.canvas);
        this.view.setModel(this._center);
		
	}

	

    get view(){
		return this._view;
	}

}

export default CtrlPanelPresenter;