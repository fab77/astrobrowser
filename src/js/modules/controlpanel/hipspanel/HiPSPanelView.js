
import $ from "jquery";
import ColorMaps from "../../dataexplorer/model/ColorMaps.js";
import { TabulatorFull as Tabulator } from 'tabulator-tables';

class HiPSPanelView {

    _html;
    _visible;
    _dataTables;

    constructor() {

        this._dataTables = new Map();

        this.init();

        const _public = {
            getHtml: () => {
                return this._html;
            },
            // TODO move this into Utils
            urlSanifier: (url) => {
                let sanified = url.replace('https://', '').replace('http://', '').replaceAll("/", "_").replaceAll(".", "_");
                return sanified;
            },
            addHiPSNode: (hipsNodeUrl, tableData, hipsSelectionHandler, cutoutFormHandler, caller) => {
                const hipsNodeId = _public.urlSanifier(hipsNodeUrl);
                $("#" + this._hipsNodesId).append("<label for='" + hipsNodeId + "'>" + hipsNodeUrl + "</label><div id='" + hipsNodeId + "'></div>");

                let tableHeight = 250;
                if ((tableData.length * 40) < 200) {
                    tableHeight = tableData.length * 40;
                }

                let table = new Tabulator("#" + hipsNodeId, {
                    height: tableHeight, // set height of table (in CSS or here), this enables the Virtual DOM and improves render speed dramatically (can be any valid css height value)
                    width: '550px',
                    data: tableData, //assign data to table
                    // layout: "fitColumns", //fit columns to width of table (optional)
                    columns: [ //Define Table Columns
                        {
                            title: "#",
                            field: "selected",
                            width: 15,
                            formatter: (cell) => {
                                const value = cell.getValue();
                                if (value) {
                                    // return `<input type="checkbox" checked/>`;
                                    return `<input name="hips_selection" type="radio" checked/>`;
                                } else {
                                    // return `<input type="checkbox" />`;
                                    return `<input name="hips_selection" type="radio" />`;
                                }
                            },

                        },
                        {
                            title: "Name",
                            field: "name",
                            width: 131,
                            hozAlign: "left",
                            formatter: "textarea",
                            headerFilter:"input"
                        },
                        {
                            title: "Image format",
                            field: "image_format",
                            width: 112,
                            hozAlign: "left",
                            formatter: "textarea",
                            headerFilter:"input"
                        },
                        {
                            title: "CoordFrame",
                            field: "coord_sys",
                            width: 95,
                            hozAlign: "left",
                            formatter: "plaintext",
                            headerFilter:"input"
                        },
                        {
                            title: "em_min",
                            field: "em_min",
                            width: 95,
                            hozAlign: "left",
                            formatter: "plaintext",
                            headerFilter:"input",
                            sorter: "number"
                        },
                        {
                            title: "em_max",
                            field: "em_max",
                            width: 95,
                            hozAlign: "left",
                            formatter: "plaintext",
                            headerFilter:"input",
                            sorter: "number"
                        },
                        // {
                        //     title: "Data Explorer",
                        //     field: "data_explorer",
                        //     width: 25,
                        //     formatter: (cell, formatterParams) => {
                        //         if (cell.getValue() !== undefined ){
                        //             return "<img src='images/"+cell.getValue()+"' style='height: 20px; width: 20px;'>"
                        //         }else{
                        //             return "";
                        //         }
                        //     },
                        // },
                        {
                            title: "Descriptor",
                            field: "descriptor",
                            visible: false
                        },
                        {
                            title: "HiPS",
                            field: "hips",
                            visible: false
                        }
                    ],
                });

                this._dataTables.set(hipsNodeId, table);
                table.on("cellClick", function (e, cell) {
                    //e - the click event object
                    //cell - cell component
                    if (e.target.type == 'checkbox' || e.target.type == 'radio') {
                        hipsSelectionHandler(cell._cell.row.data.descriptor, e.target.checked, cell._cell.row.data.id, cell._cell.row.data.hips, hipsNodeId, caller)
                        cell._cell.row.moveToRow(0, true)
                        // cell._cell.row.move(1, true)
                    } 
                    // else if (e.target.nodeName == 'IMG') {
                    //     cutoutFormHandler(cell._cell.row.data.descriptor, caller)
                    // }
                });

            },
            hipsActivated: (rowId, hips, hipsNodeId) => {
                let table = this._dataTables.get(hipsNodeId);
                table.updateRow(rowId, { hips: hips });
            },
            // openCutoutForm: (html) => {
            //     $("#" + this._cutoutForm).append(html);

            // },
            openDataExplorer: (html) => {
                $("#" + this._rootDomId).append(html);

            },

            toggle: () => {
                this._html.toggle();
            },
            close: () => {
                // if (this._visible){
                this._html.css("display", "none");
                this._visible = false;
                // }
            },
            colorMapDropDown: () => {
                return $("#hips_cmap");
            },
            invertColorMap: () => {
                return $("#hips_inverse");
            },

            filterField: () => {
                return $("#filter-field");
            },
            filterType: () => {
                return $("#filter-type");
            },
            filterValue: () => {
                return $("#filter-value");
            },
            clearFilter: () => {
                return $("#filter-clear");
            },
            filterTable: (filter, typeVal, value) => {
                console.log("filtering")
                console.log(filter, typeVal, value)
                this._dataTables.forEach((table) => table.setFilter(filter, typeVal, value) );   
            },
            clearFilterClicked: () => {
                console.log("clearing filter")
                $("#filter-field").val("")
                $("#filter-type").val("=")
                $("#filter-value").val("")
                this._dataTables.forEach((table) => table.clearFilter() );   
            }


        }

        return _public;
    }

    

    init() {
        this._rootDomId = "hipsRootPanel";
        this._hipsNodesId = "hipsNodesPanel";
        this._hipsGeneralOptions = "hipsOptionsPanel";
        // this._cutoutForm = "cutoutForm";

        this._visible = false;

        let cmapOptions = "";
        for (let ckey in ColorMaps) {
            if (ckey == 'native') {
                cmapOptions += "<option id='hips_cmap_opt' selected>" + ckey + "</option>";
            } else {
                cmapOptions += "<option id='hips_cmap_opt'>" + ckey + "</option>";
            }

        }


        this._html = $(`
            <div class='controlPanel' id='${this._rootDomId}'>
                <div id='${this._hipsNodesId}' ></div>
                <div id='${this._hipsGeneralOptions}'>
                    <div>
                        <select id="filter-field">
                            <option></option>
                            <option>em_min</option>
                            <option>em_max</option>
                        </select>
                        <select id="filter-type">
                            <option value="=">=</option>
                            <option value="<"><</option>
                            <option value="<="><=</option>
                            <option value=">">></option>
                            <option value=">=">>=</option>
                            <option value="!=">!=</option>
                        </select>
                        <input id="filter-value" type="text" placeholder="value to filter">
                        <button id="filter-clear">Clear Filter</button>
                    </div>
                    Color Map: <select id='hips_cmap'>${cmapOptions}</select> &nbsp;
                    inverse: <input type='checkbox' id='hips_inverse' > 
                    <br/>
                    <!-- <button type='button'>add HiPS node</button>&nbsp; -->
                    <!-- <button type='button'>add HiPS URL</button> -->
                </div>
            </div>`);
        // this._html = $(`
        //     <div class='controlPanel' id='${this._rootDomId}'>
        //         <div id='${this._hipsNodesId}' ></div>
        //         <div id='${this._hipsGeneralOptions}'>
        //             Color Map: <select id='hips_cmap'>${cmapOptions}</select> &nbsp;
        //             inverse: <input type='checkbox' id='hips_inverse' > 
        //             <br/>
        //             <button type='button'>add HiPS node</button>&nbsp;
        //             <button type='button'>add HiPS URL</button>
        //         </div>
        //         <div id='${this._cutoutForm}'></div>
        //     </div>`);
        this._html.css("display", "none");
    }



}

export default HiPSPanelView;