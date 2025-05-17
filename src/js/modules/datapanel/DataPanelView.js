import $ from "jquery";

import { TabulatorFull as Tabulator } from 'tabulator-tables';
import TapMetadataList from "../../repos/tap/TapMetadataList.js";

class DataPanelView {

    _html;
    _rootDomId;
    _dataMap;

    constructor(rootDomId) {

        this._rootDomId = rootDomId;
        this._dataMap = new Map();
        this.init();
        let self = this;

        let _public = {
            getHtml: () => {
                return this._html;
            },
            urlSanifier: (url) => {
                let sanified = url.replace('https://', '').replace('http://', '').replaceAll("/", "_").replaceAll(".", "_");
                return sanified;
            },
            /**
             * 
             * @param {*} tableName 
             * @param {TapMetadataList} metadata 
             * @param {*} footprints 
             */
            addNewTable(tableName, metadata, footprints, fpset, removeRowHandler, footprintHighlighted) {

                const tabID = _public.urlSanifier(tableName);
                $("#" + self._rootDomId).append("<label for='" + tabID + "'>" + tableName + "</label><div id='" + tabID + "'></div>");

                // metadata columns definition
                let tableColumns = [];
                for (let m = 0; m < metadata.length; m++) {

                    tableColumns.push({
                        title: metadata[m]._name,
                        field: metadata[m]._name,
                        // width: 350,
                        hozAlign: "left",
                        formatter: "plaintext"
                    })
                }

                // delete column
                tableColumns.push({
                    title: "Actions",
                    field: "actions",
                    width: 25,
                    formatter: "image",
                    formatterParams: {
                        height: "20px",
                        width: "20px",
                        // urlPrefix: "media/"
                        urlPrefix: "images/"
                    },
                    cellClick: function(e, cell){
                        // console.log(cell.getRow())
                        removeRowHandler(cell._cell.row.data.fpset, cell._cell.row.data.footprint)
                        cell.getRow().delete();
                        
                    }
                })

                // model columns
                tableColumns.push({
                    title: "fpset",
                    field: "fpset",
                    visible: false
                })
                tableColumns.push({
                    title: "footprint",
                    field: "footprint",
                    visible: false
                })



                // adding data 
                let tableData = [];
                for (let f = 0; f < footprints.length; f++) {
                    let row = {};
                    for (let m = 0; m < metadata.length; m++) {
                        row[metadata[m]._name] = footprints[f]._details[m]
                    }
                    row["actions"] = "trash-bin.png"
                    row["fpset"] = fpset;
                    row["footprint"] = footprints[f];
                    tableData.push(row)
                }


                let tableHeight = 250;
                if ((tableData.length * 40) < 250) {
                    tableHeight = tableData.length * 50;
                }
                let table = new Tabulator("#" + tabID, {
                    maxHeight: 250, // set height of table (in CSS or here), this enables the Virtual DOM and improves render speed dramatically (can be any valid css height value)
                    data: tableData, //assign data to table
                    layout: "fitColumns", //fit columns to width of table (optional)
                    columns: tableColumns,
                });

                table.on("rowMouseEnter", function(e, row){
                    footprintHighlighted(row._row.data.fpset, row._row.data.footprint, true)
                });

                table.on("rowMouseLeave", function(e, row){
                    footprintHighlighted(row._row.data.fpset, row._row.data.footprint, false)
                });

                self._dataMap.set(tableName, table)

            },
            /**
             * 
             * @param {*} tableName 
             * @param {TapMetadataList} metadata 
             * @param {*} footprint 
             */
            addEntry2Table(tableName, metadata, footprint, fpset) {
                let table = self._dataMap.get(tableName)
                let row = {};
                for (let m = 0; m < metadata.length; m++) {
                    row[metadata[m]._name] = footprint._details[m]
                }
                row["actions"] = "trash-bin.png"
                row["fpset"] = fpset;
                row["footprint"] = footprint;
                table.addData([row]);
                const numRows = table.getDataCount();
                let tableHeight = 250;
                if ((numRows.length * 40) < 250) {
                    tableHeight = numRows.length * 50;
                }

            },
            removeEntryFromTable(tableName, footprint) {

            },
            removeTable(tableName) {
                
                self._dataMap.delete(tableName)
                const tabID = _public.urlSanifier(tableName);
                $("#"+tabID).remove();
                $('label[for=' + tabID + ']').remove();
            }
        }

        return _public;
    }

    init() {
        this._html = "";
    }


}

export default DataPanelView;