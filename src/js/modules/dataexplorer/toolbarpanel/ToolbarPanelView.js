"use strict";
/**
 * @author Fabrizio Giordano (Fab)
 */

import $ from "jquery";

class ToolbarPanelView {
    _html;
    _image;
    _fits;
    _headerPanelVisible;

    constructor() {

        this.init();
        let self = this;

        var _public = {
            getHtml: () => {
                return this._html;
            },
            setModel: (image, fits) => { // ??? probably not neded here. Handled in the presenter

                this._fits = fits;
                this._image = image;
            },
            fitsHeaderButton: () => {
                return $("#de_show_fits_header");
            },
            fitsExportButton: () => {
                return $("#de_save_fits");
            },
            imageExportButton: () => {
                return $("#de_save_png");
            },
            closeDataExplorerButton: () => {
                return $("#de_view_close");
            },
            closeFITSHeaderButton: () => {
                return $("#de_fits_header_popup_close")
            },
            fillFitsHeaderPopup: (header) => {
                let str = "";

                str += " <div id='de_fits_header_popup_top'><button class='button' id='de_fits_header_popup_close'>x</button></div>";
                header.forEach((value, key) => {
                    str += key + ": " + value + "<br>";
                });
                // $("#de_fits_header_popup").text(str);
                $("#de_fits_header_popup").html(str);
                self.dragElement(document.getElementById("de_fits_header_popup"));
                $("#de_fits_header_popup_close").on("click", function () {
                    $("#de_fits_header_popup").css("display", "none");
                    self._headerPanelVisible = false;
                });

            },
            setDownloadFits: (url) => {
                $("#test").attr("href", url);
            },
            toggleFITSPanel: () => {
                if (this._headerPanelVisible) {
                    $("#de_fits_header_popup").css("display", "none");
                    this._headerPanelVisible = false;
                } else {
                    $("#de_fits_header_popup").css("display", "block");
                    this._headerPanelVisible = true;
                }
            }

        }
        return _public;
    }


    closeFITSHeaderPopup() {
        $("#de_fits_header_popup").css("display", "none");
        this._headerPanelVisible = false;
    }
    //Make the DIV element draggagle:
    // dragElement(document.getElementById("mydiv"));

    dragElement(elmnt) {
        var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        if (document.getElementById(elmnt.id + "header")) {
            /* if present, the header is where you move the DIV from:*/
            document.getElementById(elmnt.id + "header").onmousedown = dragMouseDown;
        } else {
            /* otherwise, move the DIV from anywhere inside the DIV:*/
            elmnt.onmousedown = dragMouseDown;
        }

        function dragMouseDown(e) {
            e = e || window.event;
            e.preventDefault();
            // get the mouse cursor position at startup:
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.onmouseup = closeDragElement;
            // call a function whenever the cursor moves:
            document.onmousemove = elementDrag;
        }

        function elementDrag(e) {
            e = e || window.event;
            e.preventDefault();
            // calculate the new cursor position:
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;
            // set the element's new position:
            elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
            elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
        }

        function closeDragElement() {
            /* stop moving when mouse button is released:*/
            document.onmouseup = null;
            document.onmousemove = null;
        }
    }

    init() {
        this._headerPanelVisible = false;
        this._html = $(
            "<button class='button' id='de_show_fits_header'>FITS header</button> &nbsp; "
            + " <a href='' id='test' download='fabviewer.fits'><button class='button' id='de_save_fits'>export FITS</button></a> &nbsp; "
            + " <button class='button' id='de_save_png'>export PNG</button>"
            + "<button class='button' id='de_view_close'>x</button></div>"
            + " <div id='de_fits_header_popup'>"
            + " </div>"
        );

    }

}
export default ToolbarPanelView;