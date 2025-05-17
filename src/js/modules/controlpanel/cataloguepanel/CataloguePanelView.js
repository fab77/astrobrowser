
"use strict";
/**
 * @author Fabrizio Giordano (Fab77)
 */

import $ from "jquery";
import { TabulatorFull as Tabulator } from 'tabulator-tables';



class CataloguePanelView {

    _html;
    _visible;
    _rootDomId;
    _dataTables;


    constructor() {

        this._dataTables = new Map();
        this.init();

        var _public = {
            getHtml: () => {
                return this._html;
            },
            // TODO move this into Utils
            urlSanifier: (url) => {
                let sanified = url.replace('https://', '').replace('http://', '').replaceAll("/", "_").replaceAll(".", "_");
                return sanified;
            },
            addTapRepo: (tapRepo, tableData, catalogueSelectionHandler, catalogueSettingsHandler) => {

                const tapUrl = tapRepo.tapBaseUrl;
                const tapID = _public.urlSanifier(tapUrl);

                $("#" + this._rootDomId).append("<label for='" + tapID + "'>" + tapUrl + "</label><div id='" + tapID + "'></div>");

                let tableHeight = 250;
                if ((tableData.length * 35) < 200) {
                    tableHeight = tableData.length * 35;
                }

                let table = new Tabulator("#" + tapID, {
                    height: tableHeight, // set height of table (in CSS or here), this enables the Virtual DOM and improves render speed dramatically (can be any valid css height value)
                    data: tableData, //assign data to table
                    layout: "fitColumns", //fit columns to width of table (optional)
                    columns: [ //Define Table Columns
                        {
                            title: "#", field: "selected", width: 15,
                            formatter: (cell) => {
                                const value = cell.getValue();
                                if (value) {
                                    return `<input type="checkbox" checked/>`;
                                } else {
                                    return `<input type="checkbox" />`;
                                }
                            },
                        },
                        {
                            title: "Name",
                            field: "name",
                            width: 350,
                            hozAlign: "left",
                            formatter: "plaintext",
                            headerFilter:"input"
                        },
                        {
                            title: "Settings", field: "settings", width: 25, formatter: "image", formatterParams: {
                                height: "20px",
                                width: "20px",
                                // urlPrefix: "media/",
                                urlPrefix: "images/",
                                urlSuffix: ".png",
                            }
                        },
                        {
                            title: "Model",
                            field: "model",
                            visible: false
                        }
                    ],
                });

                this._dataTables.set(tapUrl, table);
                table.on("cellClick", function (e, cell) {
                    //e - the click event object
                    //cell - cell component
                    if (e.target.type == 'checkbox') {
                        catalogueSelectionHandler(tapRepo, cell._cell.row.data.model, e.target.checked)
                    } else if (e.target.nodeName == 'IMG') {
                        // console.log("IMAGE");
                        catalogueSettingsHandler(cell._cell.row.data.model, tapRepo)
                    }
                });
            },
            clear: () => {
                $('#cataloguePanel').html('');
            },
            toggle: () => {
                this._html.toggle();
            },
            close: () => {
                // if (this._visible) {
                this._html.css("display", "none");
                this._visible = false;
                // }
            }
        }

        return _public;
    }

    init() {
        this._rootDomId = "cataloguePanel";
        this._visible = false;
        this._html = $("<div id='" + this._rootDomId + "' class='controlPanel'></div>");
        this._html.css("display", "none");


    }



}

export default CataloguePanelView;