"use strict";
/**
 * @author Fabrizio Giordano (Fab77)
 */
import fetch from 'cross-fetch';

// import Catalogue from "../../model/Catalogue.js";
import Catalogue from "../../modules/controlpanel/cataloguepanel/model/Catalogue.js";
import FoVUtils from "../../utils/FoVUtils.js";
import global from "../../Global.js";
import FootprintSet from "../../modules/controlpanel/footprintpanel/model/FootprintSet.js";
import TapRepo from "./TapRepo.js";
import TapMetadata from "./TapMetadata.js";
import TapMetadataList from "./TapMetadataList.js";
import AddMessageToMsgBoxEvent from '../../events/AddMessageToMsgBoxEvent.js';
import RemoveMessageToMsgBoxEvent from '../../events/RemoveMessageToMsgBoxEvent.js';
import eventBus from '../../events/EventBus.js';


class TapRepoSingleton {



    constructor() {

    }


    async addRepos(tapurl) {
        let tapRepo = new TapRepo(tapurl);
        let functions = this.getAvailableFunctions(tapRepo);
        // TODO https://archive.eso.org/tap_cat/capabilities to check capabilities (CIRCLE, INTERSECTS, POLYGON, ...)
        // need to create a TapRepo.js Object with properties
        let tablesurl = tapurl + "/tables";
        let u;
        if (global.useCORSProxy) {
            // tablesurl = tablesurl.replaceAll(":", "**");
            // tablesurl = tablesurl.replaceAll("/", "@@");
            // u = global.corsProxyUrl + "/" + tablesurl

            u = global.corsProxyUrl + "exturl?url=" + tablesurl
        } else {
            u = tapurl + "/tables";
        }
        if (u === undefined) {
            console.error("Repo URL not defined ", u);
            return;
        }

        return fetch(u, {
            method: 'GET',
            mode: 'cors',
            // headers: {
            //   'Access-Control-Allow-Origin':'*'
            // }
        }).then(res => res.text()
        ).then(xmlStr => {
            xmlStr = xmlStr.replaceAll('\n\t', '');
            xmlStr = xmlStr.replaceAll('\t', '');
            xmlStr = xmlStr.replaceAll('\n', '');
            const parser = new DOMParser();
            const doc = parser.parseFromString(xmlStr, "application/xml");

            if (doc.childElementCount > 1) {
                console.error("Error parsing TAP XML. More than 1 node from root");
                return null;
            }

            if (!doc.childNodes[0].nodeName.includes("tableset")) {


                // if (doc.childNodes[0].nodeName.includes("tableset") != "vod:tableset" && doc.childNodes[0].nodeName != "vosi:tableset"
                // || doc.childNodes[0].nodeName != "ns2:tableset") {
                console.error("Error parsing TAP XML. " + doc.childNodes[0].nodeName + " not recognised");
            }

            let obsList = [];
            let catalogueList = [];
            let notClassifiedList = [];

            for (let i = 0; i < doc.childNodes[0].childElementCount; i++) {
                let schema = doc.childNodes[0].childNodes[i];

                if (schema.nodeName != 'schema') {
                    continue;
                }

                for (let t = 0; t < schema.childElementCount; t++) {
                    let table = schema.childNodes[t];
                    if (table.nodeName == 'table') {

                        let dataset = this.parseTable(table, tablesurl);
                        if (dataset !== null) {

                            if (dataset.catalogue != null) {
                                catalogueList.push(dataset.catalogue);
                            }
                            if (dataset.footprint != null) {
                                obsList.push(dataset.footprint);
                            }
                            if (dataset.notClassified != null) {
                                notClassifiedList.push(dataset.notClassified);
                            }
                        }

                    }
                }

            }

            tapRepo.setCataloguesList(catalogueList);
            tapRepo.setObservationsList(obsList);
            tapRepo.setNotClassifiedList(notClassifiedList);
            return tapRepo;
        });

    }

    async getAvailableFunctions(tapRepo) {
        let capabilitiesURL = tapRepo.tapBaseUrl + "/capabilities";
        let u;
        if (global.useCORSProxy) {
            // capabilitiesURL = capabilitiesURL.replaceAll(":", "**");
            // capabilitiesURL = capabilitiesURL.replaceAll("/", "@@");
            // u = global.corsProxyUrl + "/" + capabilitiesURL

            u = global.corsProxyUrl + "exturl?url=" + capabilitiesURL
        } else {
            u = tapRepo.tapBaseUrl + "/capabilities";
        }
        if (u === undefined) {
            console.error("Capabilities URL not defined ", u);
            return;
        }

        return fetch(u, {
            method: 'GET',
            mode: 'cors',
        }).then(res => res.text()
        ).then(xmlStr => {
            xmlStr = xmlStr.replaceAll('\n\t', '');
            xmlStr = xmlStr.replaceAll('\t', '');
            xmlStr = xmlStr.replaceAll('\n', '');
            const parser = new DOMParser();
            const doc = parser.parseFromString(xmlStr, "application/xml");
            // console.log(doc);
            if (doc.childElementCount > 1) {
                console.error("Error parsing TAP XML. More than 1 node from root");
                return null;
            }

            let capabilities = [];
            if (!doc.childNodes[0].nodeName.includes("capabilities")) {
                console.error("Error parsing TAP XML. " + doc.childNodes[0].nodeName + " not recognised");
            }
            for (let i = 0; i < doc.childNodes[0].childElementCount; i++) {
                let capability = doc.childNodes[0].childNodes[i];

                if (capability.nodeName != 'capability') {
                    continue;
                }
                for (let t = 0; t < capability.childElementCount; t++) {
                    let child = capability.childNodes[t];
                    if (child.nodeName == 'language') {
                        capabilities = this.parseCapabilities(child);
                    }
                }

            }

            tapRepo.adqlFunctionList = capabilities;
            // return capabilities;

        });
    }

    parseCapabilities(node) {
        let functions = [];
        // node.getElementsByTagName("name");
        // node.getElementsByTagName("version");
        // node.getElementsByTagName("description");
        let featureNodeList = node.getElementsByTagName("languageFeatures")[0].getElementsByTagName("feature")
        for (let i = 0; i < featureNodeList.length; i++) {

            let fNode = featureNodeList[i];
            let f = fNode.getElementsByTagName("form");
            functions.push(f[0].innerHTML);
        }
        return functions;
    }

    parseTable(tablenode, tablesurl) {

        let tablename = tablenode.getElementsByTagName("name")[0].innerHTML;
        // console.log(tablename)
        let tabledesc = (tablenode.getElementsByTagName("description")[0] !== undefined) ? tablenode.getElementsByTagName("description")[0].innerHTML : null;
        // console.log(tabledesc)
        let metacolumns = tablenode.getElementsByTagName("column");



        let columns = [];
        let tapMetas = new TapMetadataList();
        let raColumn = undefined;
        let decColumn = undefined;
        let mainRAColumn = undefined;
        let mainDecColumn = undefined;
        let geometryColumn = undefined;
        let nameColumn = undefined;

        for (let mc = 0; mc < metacolumns.length; mc++) {

            let metacolumn = metacolumns[mc];
            let name = metacolumn.getElementsByTagName("name")[0].innerHTML;
            let description = (metacolumn.getElementsByTagName("description")[0] !== undefined) ? metacolumn.getElementsByTagName("description")[0].innerHTML : undefined;
            let unit = (metacolumn.getElementsByTagName("unit")[0] !== undefined) ? metacolumn.getElementsByTagName("unit")[0].innerHTML : undefined;
            let datatype = (metacolumn.getElementsByTagName("dataType")[0] !== undefined) ? metacolumn.getElementsByTagName("dataType")[0].innerHTML : undefined;
            let ucd = (metacolumn.getElementsByTagName("ucd")[0] !== undefined) ? metacolumn.getElementsByTagName("ucd")[0].innerHTML : undefined;
            let utype = (metacolumn.getElementsByTagName("utype")[0] !== undefined) ? metacolumn.getElementsByTagName("utype")[0].innerHTML : undefined;

            let tapMeta = new TapMetadata(name, description, unit, datatype, ucd, utype);
            tapMetas.addMetadata(tapMeta);

        }

        let catalogue = null;
        let footprint = null;
        let notClassified = null;
        if (tapMetas.pgSphereMetaColumns.length > 0 || tapMetas.sRegionMetaColumns.length > 0) {
            footprint = new FootprintSet(columns, geometryColumn, nameColumn, tablename, tabledesc, tablesurl, raColumn, decColumn, tapMetas);
        } else if (tapMetas.posEqRAMetaColumns.length > 0 && tapMetas.posEqDecMetaColumns.length > 0) {
            catalogue = new Catalogue(columns, mainRAColumn, mainDecColumn, nameColumn, tablename, tabledesc, tablesurl, tapMetas);
        } else {
            notClassified = "TODO: create NC entity for " + tablesurl + "#" + tablename;
        }

        return {
            "catalogue": catalogue,
            "footprint": footprint,
            "notClassified": notClassified
        }

    }


    /**
         * 
         * @param {TapRepo} tapRepo 
         * @param {Catalogue} model 
         */
    queryCatalogueByFoV(tapRepo, model) {

        // let tablesurl = tapRepo.tapBaseUrl + "/sync?request=doQuery&lang=ADQL&format=json&query=";


        let tapTable, tapRa, tapDec, tapGeom, tapName, fovPolyCartesian, fovPolyAstro, queryencoded;

        tapTable = model._name;
        tapRa = model._raColumn;
        tapDec = model._decColumn;
        tapName = (model._nameColumn !== undefined) ? model._nameColumn._name : undefined;
        fovPolyCartesian = FoVUtils.getFoVPolygon(global.pMatrix, global.camera, global.gl.canvas, global.defaultHips, global.rayPicker);
        fovPolyAstro = FoVUtils.getAstroFoVPolygon(fovPolyCartesian);
        let adqlQuery = undefined;

        if (tapRepo.adqlFunctionList.includes("POLYGON")) {
            adqlQuery = "select * " +
                "from " + tapTable + " where " +
                "1=CONTAINS(POINT('ICRS'," + tapRa._name + "," + tapDec._name + "), " +
                "POLYGON('ICRS', " + fovPolyAstro + "))";
        } else if (tapRepo.adqlFunctionList.includes("CIRCLE")) {

            let center = FoVUtils.getCenterJ2000(global.gl.canvas);
            let minFoV = global.getSelectedHiPS().getMinFoV();
            let radius = minFoV / 2;
            adqlQuery = "select * " +
                "from " + tapTable + " where " +
                "1=CONTAINS(POINT('ICRS'," + tapRa._name + "," + tapDec._name + "), " +
                "CIRCLE('ICRS', " + center._raDeg + ", " + center._decDeg + ", " + radius + "))";
        } else {
            adqlQuery = "select * " +
                "from " + tapTable + " where " +
                "1=CONTAINS(POINT('ICRS'," + tapRa._name + "," + tapDec._name + "), " +
                "POLYGON('ICRS', " + fovPolyAstro + "))";
        }

        queryencoded = encodeURI(adqlQuery);

        let tapUrl = tapRepo.tapBaseUrl
        let adql = queryencoded
        let u = global.corsProxyUrl + "adql?tapurl=" + tapUrl + "&query=" + adql

        const msgId = model._name + "_" + (new Date().getTime())
        eventBus.fireEvent(new AddMessageToMsgBoxEvent(msgId, "Loading data for " + model._name));

        return fetch(u, {
            method: 'GET',
            mode: 'cors',
            // headers: {
            //       'Access-Control-Allow-Origin':'*'
            //     }
        }).then(res => res.json()
        ).then(json => {

            let metadata = json.metadata;
            let data = json.data;

            console.log(data.length);

            let tapMetadataList = new TapMetadataList();
            for (let i = 0; i < metadata.length; i++) {

                let name = metadata[i].name;
                let description = (metadata[i].description !== undefined) ? metadata[i].description : undefined;
                let unit = (metadata[i].unit !== undefined) ? metadata[i].unit : undefined;
                let datatype = (metadata[i].datatype !== undefined) ? metadata[i].datatype : undefined;
                let ucd = (metadata[i].ucd !== undefined) ? metadata[i].ucd : undefined;
                let utype = (metadata[i].utype !== undefined) ? metadata[i].utype : undefined;

                let tapMeta = new TapMetadata(name, description, unit, datatype, ucd, utype);
                tapMetadataList.addMetadata(tapMeta);
            }

            if (data.length > 0) {
                model.addSources(data, tapMetadataList.metadataList);
            } else {
                console.log("No results found");
            }
            eventBus.fireEvent(new RemoveMessageToMsgBoxEvent(msgId));
        })

    }

    /**
         * 
         * @param {TapRepo} tapRepo  
         * @param {FootprintSet} model   
         */
    queryObservationByFoV(tapRepo, model) {

        let tablesurl = tapRepo.tapBaseUrl + "/sync?request=doQuery&lang=ADQL&format=json&query=";


        let tapTable, tapRa, tapDec, tapGeom, tapPgSphere, fovPolyCartesian, fovPolyAstro, queryencoded;

        tapTable = model._name;
        tapRa = model.raColumn;
        tapDec = model.decColumn;

        // tapGeom = model._geomColumn._name;
        tapPgSphere = undefined;
        if (model._pgSphereColumn !== undefined) {
            tapPgSphere = model._pgSphereColumn._name;
        }

        // tapName = (model._nameColumn !== undefined ) ? model._nameColumn._name : undefined;
        fovPolyCartesian = FoVUtils.getFoVPolygon(global.pMatrix, global.camera, global.gl.canvas, global.defaultHips, global.rayPicker);
        fovPolyAstro = FoVUtils.getAstroFoVPolygon(fovPolyCartesian);
        let adqlQuery = undefined;

        // not working anymore in esasky
        // if (tapPgSphere !== undefined && tapPgSphere !== null) {
        //     adqlQuery = "select * " +
        //         "from " + tapTable + " where " +
        //         "1=INTERSECTS(" + tapPgSphere + ", " +
        //         "POLYGON('ICRS', " + fovPolyAstro + "))";
        // } else {

        if (tapRepo.adqlFunctionList.includes("POLYGON")) {
            adqlQuery = "select * " +
                "from " + tapTable + " where " +
                "1=CONTAINS(POINT('ICRS'," + tapRa._name + "," + tapDec._name + "), " +
                "POLYGON('ICRS', " + fovPolyAstro + "))";
        } else if (tapRepo.adqlFunctionList.includes("CIRCLE")) {

            let center = FoVUtils.getCenterJ2000(global.gl.canvas);
            let minFoV = global.getSelectedHiPS().getMinFoV();
            let radius = minFoV / 2;
            adqlQuery = "select * " +
                "from " + tapTable + " where " +
                "1=CONTAINS(POINT('ICRS'," + tapRa._name + "," + tapDec._name + "), " +
                "CIRCLE('ICRS', " + center._raDeg + ", " + center._decDeg + ", " + radius + "))";
        } else { // for TAP repos with no capabilities exposed
            let center = FoVUtils.getCenterJ2000(global.gl.canvas);
            let minFoV = global.getSelectedHiPS().getMinFoV();
            let radius = minFoV / 2;
            adqlQuery = "select * " +
                "from " + tapTable + " where " +
                "1=CONTAINS(POINT('ICRS'," + tapRa._name + "," + tapDec._name + "), " +
                "CIRCLE('ICRS', " + center._raDeg + ", " + center._decDeg + ", " + radius + "))";
        }
        
        queryencoded = encodeURI(adqlQuery);

        let tapUrl = tapRepo.tapBaseUrl
        let adql = queryencoded
        let u = global.corsProxyUrl + "adql?tapurl=" + tapUrl + "&query=" + adql

        const msgId = model._name + "_" + (new Date().getTime())
        eventBus.fireEvent(new AddMessageToMsgBoxEvent(msgId, "Loading data for " + model._name));

        return fetch(u, {
            method: 'GET',
            mode: 'cors',
            // headers: {
            //       'Access-Control-Allow-Origin':'*'
            //     }
        }).then(res => res.json()
        ).then(json => {
            const metadata = json.metadata;
            const data = json.data;

            console.log(data.length);

                let tapMetadataList = new TapMetadataList();
                for (let i = 0; i < metadata.length; i++) {

                    let name = metadata[i].name;
                    let description = (metadata[i].description !== undefined) ? metadata[i].description : undefined;
                    let unit = (metadata[i].unit !== undefined) ? metadata[i].unit : undefined;
                    let datatype = (metadata[i].datatype !== undefined) ? metadata[i].datatype : undefined;
                    let ucd = (metadata[i].ucd !== undefined) ? metadata[i].ucd : undefined;
                    let utype = (metadata[i].utype !== undefined) ? metadata[i].utype : undefined;

                    let tapMeta = new TapMetadata(name, description, unit, datatype, ucd, utype);
                    tapMetadataList.addMetadata(tapMeta);
                }

                if (data.length > 0) {
                    model.addFootprints(data, tapMetadataList.metadataList);
                } else {
                    console.log("No results found");
                }
                eventBus.fireEvent(new RemoveMessageToMsgBoxEvent(msgId));
            
        });


        // let xhr = new XMLHttpRequest();

        // console.log(queryencoded);

        // var _self = this;
        // // TODO CONVERT TO PROMISE!
        // xhr.open('GET', tablesurl + queryencoded, true);
        // xhr.responseType = 'json';
        // xhr.onload = () => {
        //     var status = xhr.status;
        //     if (status === 200) {
        //         if (xhr.response == null) {
        //             console.log("No data received:");
        //             console.log(xhr.response);
        //             return;
        //         }
        //         var metadata = xhr.response.metadata;
        //         var data = xhr.response.data;

        //         // console.log(metadata);
        //         console.log(data.length);

        //         // let columnsmeta = [];
        //         let tapMetadataList = new TapMetadataList();
        //         for (let i = 0; i < metadata.length; i++) {

        //             let name = metadata[i].name;
        //             let description = (metadata[i].description !== undefined) ? metadata[i].description : undefined;
        //             let unit = (metadata[i].unit !== undefined) ? metadata[i].unit : undefined;
        //             let datatype = (metadata[i].datatype !== undefined) ? metadata[i].datatype : undefined;
        //             let ucd = (metadata[i].ucd !== undefined) ? metadata[i].ucd : undefined;
        //             let utype = (metadata[i].utype !== undefined) ? metadata[i].utype : undefined;

        //             // let column = new Column(name, description, unit, datatype, ucd, utype, i);
        //             // columnsmeta.push(column);
        //             let tapMeta = new TapMetadata(name, description, unit, datatype, ucd, utype);
        //             tapMetadataList.addMetadata(tapMeta);
        //         }

        //         if (data.length > 0) {
        //             // model.addFootprints(data, columnsmeta);
        //             model.addFootprints(data, tapMetadataList.metadataList);
        //         } else {
        //             console.log("No results found");
        //         }
        //         eventBus.fireEvent(new RemoveMessageToMsgBoxEvent(msgId));
        //     } else {
        //         console.log('Something went wrong:');
        //         console.log(xhr.response);
        //     }
        // };


        // xhr.send();

    }

    // /**
    //  * 
    //  * @param {TapRepo} tapRepo  
    //  * @param {FootprintSet} model   
    //  */
    // queryObservationByFoV(tapRepo, model) {




    //     let tablesurl = tapRepo.tapBaseUrl + "/sync?request=doQuery&lang=ADQL&format=json&query=";


    //     let tapTable, tapRa, tapDec, tapGeom, tapPgSphere, fovPolyCartesian, fovPolyAstro, queryencoded;

    //     tapTable = model._name;
    //     tapRa = model.raColumn;
    //     tapDec = model.decColumn;

    //     const msgId = model._name + "_" + (new Date().getTime())
    //     eventBus.fireEvent(new AddMessageToMsgBoxEvent(msgId, "Loading data for " + model._name));

    //     // tapGeom = model._geomColumn._name;
    //     tapPgSphere = undefined;
    //     if (model._pgSphereColumn !== undefined) {
    //         tapPgSphere = model._pgSphereColumn._name;
    //     }

    //     // tapName = (model._nameColumn !== undefined ) ? model._nameColumn._name : undefined;
    //     fovPolyCartesian = FoVUtils.getFoVPolygon(global.pMatrix, global.camera, global.gl.canvas, global.defaultHips, global.rayPicker);
    //     fovPolyAstro = FoVUtils.getAstroFoVPolygon(fovPolyCartesian);
    //     let adqlQuery = undefined;

    //     // not working anymore in esasky
    //     // if (tapPgSphere !== undefined && tapPgSphere !== null) {
    //     //     adqlQuery = "select * " +
    //     //         "from " + tapTable + " where " +
    //     //         "1=INTERSECTS(" + tapPgSphere + ", " +
    //     //         "POLYGON('ICRS', " + fovPolyAstro + "))";
    //     // } else {

    //     if (tapRepo.adqlFunctionList.includes("POLYGON")) {
    //         adqlQuery = "select * " +
    //             "from " + tapTable + " where " +
    //             "1=CONTAINS(POINT('ICRS'," + tapRa._name + "," + tapDec._name + "), " +
    //             "POLYGON('ICRS', " + fovPolyAstro + "))";
    //     } else if (tapRepo.adqlFunctionList.includes("CIRCLE")) {

    //         let center = FoVUtils.getCenterJ2000(global.gl.canvas);
    //         let minFoV = global.getSelectedHiPS().getMinFoV();
    //         let radius = minFoV / 2;
    //         adqlQuery = "select * " +
    //             "from " + tapTable + " where " +
    //             "1=CONTAINS(POINT('ICRS'," + tapRa._name + "," + tapDec._name + "), " +
    //             "CIRCLE('ICRS', " + center._raDeg + ", " + center._decDeg + ", " + radius + "))";
    //     } else { // for TAP repos with no capabilities exposed
    //         let center = FoVUtils.getCenterJ2000(global.gl.canvas);
    //         let minFoV = global.getSelectedHiPS().getMinFoV();
    //         let radius = minFoV / 2;
    //         adqlQuery = "select * " +
    //             "from " + tapTable + " where " +
    //             "1=CONTAINS(POINT('ICRS'," + tapRa._name + "," + tapDec._name + "), " +
    //             "CIRCLE('ICRS', " + center._raDeg + ", " + center._decDeg + ", " + radius + "))";
    //     }
    //     // }




    //     // ESASky with pgsphere FoV (in case I want to handle it)
    //     // let adqlQuery = "select "
    //     // adqlQuery += " * " +
    //     //     "from "+tapTable+" where " +
    //     //     "1=INTERSECTS(fov, " +
    //     //     "POLYGON('ICRS', "+fovPolyAstro+"))";

    //     queryencoded = encodeURI(adqlQuery);

    //     let xhr = new XMLHttpRequest();

    //     console.log(queryencoded);

    //     var _self = this;
    //     // TODO CONVERT TO PROMISE!
    //     xhr.open('GET', tablesurl + queryencoded, true);
    //     xhr.responseType = 'json';
    //     xhr.onload = () => {
    //         var status = xhr.status;
    //         if (status === 200) {
    //             if (xhr.response == null) {
    //                 console.log("No data received:");
    //                 console.log(xhr.response);
    //                 return;
    //             }
    //             var metadata = xhr.response.metadata;
    //             var data = xhr.response.data;

    //             // console.log(metadata);
    //             console.log(data.length);

    //             // let columnsmeta = [];
    //             let tapMetadataList = new TapMetadataList();
    //             for (let i = 0; i < metadata.length; i++) {

    //                 let name = metadata[i].name;
    //                 let description = (metadata[i].description !== undefined) ? metadata[i].description : undefined;
    //                 let unit = (metadata[i].unit !== undefined) ? metadata[i].unit : undefined;
    //                 let datatype = (metadata[i].datatype !== undefined) ? metadata[i].datatype : undefined;
    //                 let ucd = (metadata[i].ucd !== undefined) ? metadata[i].ucd : undefined;
    //                 let utype = (metadata[i].utype !== undefined) ? metadata[i].utype : undefined;

    //                 // let column = new Column(name, description, unit, datatype, ucd, utype, i);
    //                 // columnsmeta.push(column);
    //                 let tapMeta = new TapMetadata(name, description, unit, datatype, ucd, utype);
    //                 tapMetadataList.addMetadata(tapMeta);
    //             }

    //             if (data.length > 0) {
    //                 // model.addFootprints(data, columnsmeta);
    //                 model.addFootprints(data, tapMetadataList.metadataList);
    //             } else {
    //                 console.log("No results found");
    //             }
    //             eventBus.fireEvent(new RemoveMessageToMsgBoxEvent(msgId));
    //         } else {
    //             console.log('Something went wrong:');
    //             console.log(xhr.response);
    //         }
    //     };


    //     xhr.send();

    // }

    addCatalogue(catalogue) {
        this._sourceCatalogues.push(catalogue);
    }

    removeCatalogue(in_catalogueName) {
        var i;
        for (i = 0; i < this._activeSourceCatalogues.length; i++) {
            if (this._activeSourceCatalogues[i]._name == in_catalogueName) {
                this._activeSourceCatalogues[i].clearSources();
                this._activeSourceCatalogues.splice(i, 1);
                break;
            }
        }
    }

    get catalogues() {
        return this._activeSourceCatalogues;
    }

    addFootprintSet(footprintset) {
        this._footprintsCatalogues.push(footprintset);
    }

    removeFootprintSet(footprintsetname) {
        var i;
        for (i = 0; i < this._activeFootprintsCatalogues.length; i++) {
            if (this._activeFootprintsCatalogues[i]._name == footprintsetname) {
                this._activeFootprintsCatalogues[i].clearFootprints();
                this._activeFootprintsCatalogues.splice(i, 1);
                break;
            }
        }
    }

    get footprints() {
        return this._activeFootprintsCatalogues;
    }
}



export const tapRepoSingleton = new TapRepoSingleton();
