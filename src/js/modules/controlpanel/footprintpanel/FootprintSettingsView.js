"use strict";
/**
 * @author Fabrizio Giordano (Fab77)
 */

 import $ from "jquery";

class FootprintSettingsView {
    _footprintset;
    _ra;
    _dec;
    _name;
    _size;
    _color;
    constructor(footprintset) {

        this._footprintset = footprintset;
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
                    let geom = $("#geom-select").children("option:selected").val();
                    let name = $("#name-select").children("option:selected").val();
                    // let hue = $("#hue-select").children("option:selected").val();
                    let hue = null;
                    let shapeColor = $("#shape-color").val();
                    
                    handler(geom, name, shapeColor, hue);
                });

            }
        }

        return _public;
    }

    init() {
        this._visible = false;
        
        let geomSelectBox = "<select id='geom-select'>";
        for (let column of this._footprintset._columns ) {
            if (column._name == this._footprintset._geomColumn._name) {
                geomSelectBox += "<option value='"+column._name+"' selected>"+column._name+"</option>";
            } else {
                geomSelectBox += "<option value='"+column._name+"'>"+column._name+"</option>";
            }
        }
        geomSelectBox += "</select>";

        let nameFound = false;
        let nameSelectBox = "<select id='name-select'>";
        for (let column of this._footprintset._columns ) {
            if (this._footprintset._nameColumn !== undefined && column._name == this._footprintset._nameColumn._name) {
                nameFound = true;
                nameSelectBox += "<option value='"+column._name+"' selected>"+column._name+"</option>";
            } else {
                nameSelectBox += "<option value='"+column._name+"'>"+column._name+"</option>";
            }
        }
        if (!nameFound) {
            nameSelectBox += "<option value='--' selected>--</option>";
        }
        nameSelectBox += "</select>";

        // TODO SHAPE HUE in the shader
        // let colorFound = false;
        // let colorSelectBox = "<select id='hue-select'>";
        // for (let column of this._footprintset._columns ) {
        //     if (["SHORT", "LONG", "INT", "FLOAT", "DOUBLE", "INTEGER", "BIGINT"].includes(column._datatype.toUpperCase())) {
                
        //         if (this._footprintset._shapeColumn !== undefined && column._name == this._footprintset._shapeColumn._name) {
        //             colorFound = true;
        //             colorSelectBox += "<option value='"+column._name+"' selected>"+column._name+"</option>";
        //         } else {
        //             colorSelectBox += "<option value='"+column._name+"'>"+column._name+"</option>";
        //         }

        //     }    
        // }
        // if (!colorFound) {
        //     colorSelectBox += "<option value='--' selected>--</option>";
        // }
        // colorSelectBox += "</select>";



        this._html = $("<div class='fs-settings'>"+this._footprintset._name+"<button id='close-settings'>X</button>" +
                        "<table>" +
                        "<tr><td>Geometry</td><td>"+geomSelectBox+"</td></tr>" +
                        "<tr><td>Name</td><td>"+nameSelectBox+"</td></tr>" +
                        "<tr><td><input type='color' id='shape-color' value='"+this._footprintset._shapeColor+"'></input></td></tr>" +
                        // "<tr><td>Shape hue</td><td>"+colorSelectBox+"</td></tr>" +
                        "</table><button id='change-settings'>change</button></div>");

    }
}

export default FootprintSettingsView;

