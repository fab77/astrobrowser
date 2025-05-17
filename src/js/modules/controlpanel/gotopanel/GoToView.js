"use strict";
/**
 * @author Fabrizio Giordano (Fab77)
 */
import $ from "jquery";


class GoToView {

    constructor() {

        this.init();

        var _public = {
            getHtml: () => {
                return this._html;
            },
            toggle: () => {
                if (this._visible) {
                    this._html.css("display", "none");
                    this._visible = false;
                } else {
                    this._html.css("display", "block");
                    this._visible = true;
                }

            },
            close: () => {
                // if (this._visible){
                this._html.css("display", "none");
                this._visible = false;
                // }
            },
            getSearchButton: () => {
                return $('#goto_search');
            },
            getRADec: () => {
                return $('#gotoRADec');
            },
            getTargetName: () => {
                return $('#gotoName');
            },
            getNameResolver: () => {
                return $('#gotoNameResolver');
            }
        }

        return _public;

    }

    init() {
        this._visible = false;
        this._html = $(`
        <div id='gotoPanel' class='controlPanel'>
            <div><span>RA, Dec:</span>&nbsp;<input type='text' id='gotoRADec'/></div>
            <div><span>Name:</span>&nbsp;<input type='text' id='gotoName'/></div>
            <!-- <select id='gotoNameResolver' onmousedown='event.stopPropagation()'>
                <option value='simbad'>SIMBAD</option>
                <option value='ned'>NED</option>
            </select> -->
            <button class='button' id='goto_search'>search</button>
        </div>`);
        this._html.css("display", "none");
    }

}

export default GoToView;