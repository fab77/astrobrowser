"use strict";

import eventBus from "../../../events/EventBus.js";
import GoToEvent from "./events/GoToEvent.js";
import GoToView from "./GoToView.js";

import sesameService from "./services/SesameService.js";
/**
 * @author Fabrizio Giordano (Fab77)
 */

class GoToPresenter {

    _view;

    /**
     * 
     * @param {GoToView} view 
     */
    constructor(view) {
        this._view = view;
        var _self = this;
        // console.log(this._view.getSearchButton());
        this._view.getTargetName().keydown(function(event) {
            event.stopPropagation();
        });

        this._view.getSearchButton().on("click", () => {

            if (_self._view.getRADec().val() !== undefined && _self._view.getRADec().val() != '') {

                // TODO parse _self._view.getRADec().val()
                let raDec = _self._view.getRADec().val().replace(/  +/g, ' ').split(" ");
                eventBus.fireEvent(new GoToEvent(raDec[0], raDec[1]));

            } else if (_self._view.getTargetName().val() !== undefined && _self._view.getTargetName().val() != '') {
                let nmResolver = _self._view.getNameResolver().val();
                let tName = _self._view.getTargetName().val();
                sesameService.queryByTargetName(tName).then((radecdeg) => {

                    eventBus.fireEvent(new GoToEvent(radecdeg.ra, radecdeg.dec));

                }
                );
                // TODO call name resolver service and compute coordinates
                // and than eventBus.fireEvent(new GoToEvent(raDec[0], raDec[1]));
            }
        });

    }

    get view() {
        return this._view;
    }

}

export default GoToPresenter;