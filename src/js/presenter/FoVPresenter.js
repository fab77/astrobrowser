"use strict";
/**
 * @author Fabrizio Giordano (Fab77)
 */

import FoVView from '../view/FoVView.js';

class FoVPresenter {

	_view;
	
	/**
	 * 
	 * @param {FoVView} view 
	 */
	constructor(view){
		// this._view = view;
		this._view = new FoVView();
		
	}
	
	get view(){
        return this._view;
    }
	
	updateFoV(in_fovObj){
		this.view.setModel(in_fovObj);
	}
	
	
}

export default FoVPresenter;