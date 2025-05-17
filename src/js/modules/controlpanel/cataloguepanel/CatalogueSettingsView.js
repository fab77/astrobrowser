"use strict";
/**
 * @author Fabrizio Giordano (Fab77)
 */

 import $ from "jquery";

class CatalogueSettingsView {
    
    _catalogue;
    _ra;
    _dec;
    _name;
    _size;
    _color;
    constructor(catalogue) {

        this._catalogue = catalogue;
        this.init();

        var _public = {
            getHtml: ()=>{
                return this._html;
            },
            addCloseHandler: (handler) => {
                
                this._html.find("#close-settings").on("click", function(e){
                    e.stopPropagation();
                    handler();
                });

            },
            addChangeHandler: (handler) => {
                this._html.find("#change-settings").on("click", function(e){
                    e.stopPropagation();
                    let ra = $("#ra-select").children("option:selected").val();
                    let dec = $("#dec-select").children("option:selected").val();
                    let name = $("#name-select").children("option:selected").val();
                    let hue = $("#hue-select").children("option:selected").val();
                    let shape = $("#size-select").children("option:selected").val();
                    let shapeColor = $("#shape-color").val();

                    handler(ra, dec, name, shape, shapeColor, hue);
                });

            }
        }

        return _public;
    }

    init() {
        this._visible = false;
        
        let raSelectBox = "<select id='ra-select'>";
        for (let column of this._catalogue._columns ) {
            if (column.name == this._catalogue._raColumn.name) {
                raSelectBox += "<option value='"+column.name+"' selected>"+column.name+"</option>";
            } else {
                raSelectBox += "<option value='"+column.name+"'>"+column.name+"</option>";
            }
        }
        raSelectBox += "</select>";

        let decSelectBox = "<select id='dec-select'>";
        for (let column of this._catalogue._columns ) {
            if (column.name == this._catalogue._decColumn.name) {
                decSelectBox += "<option value='"+column.name+"' selected>"+column.name+"</option>";
            } else {
                decSelectBox += "<option value='"+column.name+"'>"+column.name+"</option>";
            }
        }
        decSelectBox += "</select>";

        let nameFound = false;
        let nameSelectBox = "<select id='name-select'>";
        for (let column of this._catalogue._columns ) {
            if (this._catalogue._nameColumn !== undefined && column.name == this._catalogue._nameColumn.name) {
                nameFound = true;
                nameSelectBox += "<option value='"+column.name+"' selected>"+column.name+"</option>";
            } else {
                nameSelectBox += "<option value='"+column.name+"'>"+column.name+"</option>";
            }
        }
        if (!nameFound) {
            nameSelectBox += "<option value='--' selected>--</option>";
        }
        nameSelectBox += "</select>";

        let sizeFound = false;
        let sizeSelectBox = "<select id='size-select'>";
        for (let column of this._catalogue._columns ) {
            // TODO handle the case when datatype is undefined
            
            if (column.datatype !== undefined && ["SHORT", "LONG", "INT", "FLOAT", "DOUBLE", "INTEGER", "BIGINT"].includes(column.datatype.toUpperCase())) {
                if (this._catalogue._sizeColumn !== undefined && column.name == this._catalogue._sizeColumn.name) {
                    sizeFound = true;
                    sizeSelectBox += "<option value='"+column.name+"' selected>"+column.name+"</option>";
                } else {
                    sizeSelectBox += "<option value='"+column.name+"'>"+column.name+"</option>";
                }
            }
        
                
        }
        if (!sizeFound) {
            sizeSelectBox += "<option value='--' selected>--</option>";
        }
        sizeSelectBox += "</select>";

        let colorFound = false;
        let hueSelectBox = "<select id='hue-select'>";
        for (let column of this._catalogue._columns ) {
            // TODO handle the case when datatype is undefined
            
            if (column.datatype !== undefined && ["SHORT", "LONG", "INT", "FLOAT", "DOUBLE", "INTEGER", "BIGINT"].includes(column.datatype.toUpperCase())) {
                
                if (this._catalogue._shapeColumn !== undefined && column.name == this._catalogue._shapeColumn.name) {
                    colorFound = true;
                    hueSelectBox += "<option value='"+column.name+"' selected>"+column.name+"</option>";
                } else {
                    hueSelectBox += "<option value='"+column.name+"'>"+column.name+"</option>";
                }

            }    
        
        }
        if (!colorFound) {
            hueSelectBox += "<option value='--' selected>--</option>";
        }
        hueSelectBox += "</select>";



        this._html = $("<div class='cat-settings'>"+this._catalogue.name+"<button id='close-settings'>X</button>" +
                        "<table>" +
                        "<tr><td>RA</td><td>"+raSelectBox+"</td></tr>" +
                        "<tr><td>Dec</td><td>"+decSelectBox+"</td></tr>" +
                        "<tr><td>Name</td><td>"+nameSelectBox+"</td></tr>" +
                        "<tr><td>Shape size</td><td>"+sizeSelectBox+"</td></tr>" +
                        "<tr><td>Shape hue</td><td>"+hueSelectBox+"</td></tr>" +
                        "<tr><td><input type='color' id='shape-color' value='"+this._catalogue._shapeColor+"'></input></td></tr>" +
                        "</table><button id='change-settings'>change</button></div>");

    }
}

export default CatalogueSettingsView;