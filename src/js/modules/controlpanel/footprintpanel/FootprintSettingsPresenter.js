"use strict";
/**
 * @author Fabrizio Giordano (Fab77)
 */
import CloseFootprintSettingsEvent from './events/CloseFootprintSettingsEvent.js';
import FootprintSettingsChangeEvent from './events/FootprintSettingsChangeEvent.js';
import eventBus from '../../../events/EventBus.js';

class FootprintSettingsPresenter {
    
    constructor (view, footprintset, tapRepo) {
        this._view = view;
        this._model = footprintset;
        this._tapRepo = tapRepo;
        var _self = this;
        this._view.addCloseHandler( function () {
            eventBus.fireEvent(new CloseFootprintSettingsEvent());
        });
        this._view.addChangeHandler( function (geom, name, color, hue) {
            console.log(geom, name, color, hue);
            eventBus.fireEvent(new FootprintSettingsChangeEvent(geom, name, color, hue, _self._model, _self._tapRepo));
            
        });
    }

    get view(){
        return this._view;
    }
    
}

export default FootprintSettingsPresenter;

