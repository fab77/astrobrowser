
"use strict";
/**
 * @author Fabrizio Giordano (Fab)
 */

import $ from "jquery";

class CanvasPanelView {

    constructor() {
        this.init();

        var _public = {
            getHtml: () => {
                return this._html;
            },
            setModel: (imageData) => {

                $('#canvas_img').attr('src', imageData)

            },
            clear: () => {
                $('#canvas_img').attr('src', '')
            },
            showLoading: (show) => {
                if (show) {
                    $('#canvas_loading').html("Loading ... ")
                } else {
                    $('#canvas_loading').html("")
                }
                
            },
            showNoDataFound: () => {
                $('#canvas_loading').html("No FITS found in input.")
            },
            addSomeHandler: (handler) => {
                this._html.find("#???").on("click", handler);
            }
        }
        return _public;
    }

    init() {
        this._html = "<img id='canvas_img'/><span id='canvas_loading'></span> ";
    }

}

export default CanvasPanelView;