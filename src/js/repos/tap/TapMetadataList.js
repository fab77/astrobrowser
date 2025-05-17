"use strict";

import TapMetadata from "./TapMetadata.js";

/**
 * @author Fabrizio Giordano (Fab77)
 */

class TapMetadataList {

    _posEqRAMetaColumns; // TapMetadata with ucd.includes('pos.eq.ra')
    
    _posEqDecMetaColumns; // TapMetadata with ucd.includes('pos.eq.dec') 
    
    /**
     * TapMetadata with at least one of the below list:
     * - ucd.includes('pos.outline;obs.field')
     * - utype.includes('obscore....) -> (OBSCore)
     * - utype.includes('regiobscore....) -> (OBSCore?)
     * - name='stc_s' -> (only for ESASky)
     * - name='s_region' -> (OBSCore)
     */
    _sRegionMetaColumns; 
    
    _pgSphereMetaColumns; // TapMetadata with ucd.includes('pos.outline.meta.pgsphere') 

    _metadataList; // list of all TapMetadata

    constructor(){
        this._metadataList = [];
        this._posEqRAMetaColumns = [];
        this._posEqDecMetaColumns = [];
        this._sRegionMetaColumns = [];
        this._pgSphereMetaColumns = [];
    }

    /**
     * 
     * @param {TapMetadata} tapMetadata 
     */
    addMetadata(tapMetadata){
        let length = this._metadataList.push(tapMetadata);
        let idx = length - 1;
        tapMetadata.index = idx;

        if (tapMetadata.ucd !== undefined && tapMetadata.ucd !== null && tapMetadata.ucd.includes("pos.eq.ra")){
            this._posEqRAMetaColumns.push(tapMetadata);
        } else if (tapMetadata.ucd !== undefined && tapMetadata.ucd !== null && tapMetadata.ucd.includes("pos.eq.dec")){
            this._posEqDecMetaColumns.push(tapMetadata);
        }

        if (tapMetadata.ucd !== undefined && tapMetadata.ucd !== null && tapMetadata.ucd.includes("pos.outline;meta.pgsphere")){
            this._pgSphereMetaColumns.push(tapMetadata);
        }

        if ((tapMetadata.uType !== undefined && tapMetadata.uType !== null && tapMetadata.uType.includes("Char.SpatialAxis.Coverage.Support.Area")) ||
            (tapMetadata.datatype !== undefined && tapMetadata.datatype !== null && tapMetadata.datatype.includes("adql:REGION")) ||
            (tapMetadata.ucd !== undefined && tapMetadata.ucd !== null && tapMetadata.ucd.includes("pos.outline;obs.field")) ||
            (tapMetadata.name !== undefined && tapMetadata.name !== null && tapMetadata.name == "stc_s")){ // <-- last one for ESASky not OBSCore standard
                this._sRegionMetaColumns.push(tapMetadata);
        }
    }

    get metadataList() {
        return this._metadataList;
    }

    get pgSphereMetaColumns () {
        return this._pgSphereMetaColumns;
    }

    get sRegionMetaColumns () {
        return this._sRegionMetaColumns;
    }

    get posEqRAMetaColumns () {
        return this._posEqRAMetaColumns;
    }

    get posEqDecMetaColumns () {
        return this._posEqDecMetaColumns;
    }

}

export default TapMetadataList;