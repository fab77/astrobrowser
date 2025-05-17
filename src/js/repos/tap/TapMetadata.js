"use strict";
/**
 * @author Fabrizio Giordano (Fab77)
 */

class TapMetadata {

    _name;
    _description;
    _unit;
    _dataType;
    _ucd;
    _uType;
    _index;

    /**
     * 
     * @param {String} name 
     * @param {String} description 
     * @param {String} unit 
     * @param {String} datatype 
     * @param {String} ucd 
     * @param {String} utype 
     */
    constructor(name, description, unit, datatype, ucd, utype){
        this._name = name;
        this._description = description;
        this._unit = unit;
        this._dataType = datatype;
        this._ucd = ucd;
        this._uType = utype;
    }

    get name() {
        return this._name;
    }

    get description() {
        return this._description;
    }

    get unit() {
        return this._unit;
    }

    get datatype() {
        return this._dataType;
    }

    get ucd() {
        return this._ucd;
    }

    get uType() {
        return this._uType;
    }

    
    /**
     * @param {Integer} idx
     */
    set index(idx) {
        this._index = idx;
    }

    get index() {
        return this._index;
    }

}

export default TapMetadata;