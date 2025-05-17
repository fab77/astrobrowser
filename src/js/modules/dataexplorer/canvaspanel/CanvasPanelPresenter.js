"use strict";
/**
 * @author Fabrizio Giordano (Fab)
 */


class CanvasPanelPresenter {

    _model; 

    constructor(in_view) {

        this.init(in_view);
		let self = this;

		var _public = {

			refreshModel: (image)=>{
				this.setModel(image);
			},
			clear: () => {
				this.clearView();
			}, 
			showLoading: (show) => {
				this.showLoadingInView(show);
			},
			showNoDataFound: () => {
				self._view.showNoDataFound();
			}
		}
        this.addButtonsClickHandlers();
		return _public;
	}


    init(_view){

		this._view = _view;

	}
	
    addButtonsClickHandlers() {
        
    }
	
	setModel(model){

        this._model = model;
        this.view.setModel(this._model);
		
	}

	clearView() {
		this.view.clear();
	}

	showLoadingInView(show){
		this.view.showLoading(show);
	}
    
    get view(){
		return this._view;
	}

}

export default CanvasPanelPresenter;