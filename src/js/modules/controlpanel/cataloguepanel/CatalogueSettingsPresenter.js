"use strict";
/**
 * @author Fabrizio Giordano (Fab77)
 */

 import CloseCatalogueSettingsEvent from './events/CloseCatalogueSettingsEvent.js';
 import CatalogueSettingsChangeEvent from './events/CatalogueSettingsChangeEvent.js';
 import eventBus from '../../../events/EventBus.js';


class CatalogueSettingsPresenter {

    constructor (view, catalogue, tapRepo) {
        this._view = view;
        this._model = catalogue;
        this._tapRepo = tapRepo;
        var _self = this;
        this._view.addCloseHandler( function () {
            eventBus.fireEvent(new CloseCatalogueSettingsEvent());
        });
        this._view.addChangeHandler( function (ra, dec, name, shape, color, hue) {
            // console.log(ra, dec, name, shape, color), hue;
            // eventBus.fireEvent(new CatalogueSettingsChangeEvent(ra, dec, name, shape, color, hue, _self._model._name));
            eventBus.fireEvent(new CatalogueSettingsChangeEvent(ra, dec, name, shape, color, hue, _self._model, _self._tapRepo));
            
        });
    }

    get view(){
        return this._view;
    }
}

export default CatalogueSettingsPresenter;