"use strict";
/**
 * @author Fabrizio Giordano (Fab)
 */

import $ from "jquery";

import { WCSLight } from 'wcslight';
import ColorMaps from '../model/ColorMaps.js';
import {getMaxDecimals4AstroCoords, getMaxDecimals4PixelValue} from '../../../Constants.js';
 
class CtrlPanelView {

    _html;
    _selectedColorMap;
    
    constructor(){
        
        this.init();
    
        var _public = {
            getHtml: ()=>{
                return this._html;
            },
            setModel : (pxSize, raDeg, decDeg, radius, projectionName)=> {
                
                    $("#de_cRA").text(raDeg.toFixed(getMaxDecimals4AstroCoords()));
                    $("#de_cDec").text(decDeg.toFixed(getMaxDecimals4AstroCoords()));
                    $("#de_radius").text(radius);
                    $("#de_pxSize").text(pxSize);
                    $("#de_projection").text(projectionName);
                
            },
            colorMapDropDown: ()  => {
                return  $("#de_colorMap");
            }, 
            scaleFunctionDropDown: ()  => {
                return  $("#de_sfunc");
            }, 
            invertColorMap: ()  => {
                return  $("#de_inverse");
            },
            refreshPixelDetails: (pxvalue, imgi, imgj, raDec) => {
                $("#de_i").text(imgi);
                $("#de_j").text(imgj);

                // $("#de_ra").text(raDec[0].toFixed(getMaxDecimals4AstroCoords()));
                // $("#de_dec").text(raDec[1].toFixed(getMaxDecimals4AstroCoords()));
                $("#de_ra").text(raDec.astro.raDeg.toFixed(getMaxDecimals4AstroCoords()));
                $("#de_dec").text(raDec.astro.decDeg.toFixed(getMaxDecimals4AstroCoords()));
                
                $("#de_pxvalue").text(pxvalue.toFixed(getMaxDecimals4PixelValue()));
            }

        }
        return _public;
    }		

    init(){
        let projList = WCSLight.getAvaillableProjections();
        let projOptions = "";
        for (let p in projList) {
            projOptions += "<option id='de_proj_opt'>"+projList[p]+"</option>";
        }

        let cmapOptions = "";
        for (let ckey in ColorMaps) {
            cmapOptions += "<option id='de_map_opt'>"+ckey+"</option>";
        }

        // TODO define scale functions into an object
        let sfuncOptions = "";
        sfuncOptions += "<option id='de_sfunc_opt' value='linear' selected>linear</option>";
        sfuncOptions += "<option id='de_sfunc_opt' value='log'>log</option>";
        sfuncOptions += "<option id='de_sfunc_opt' value='sqrt'>sqrt</option>";
        

        this._visible = false;
        this._html = $(
          "<div id='de_params_container'>"
        + "     <table id='de_param_table'>"
        + "     <tr><td>central RA (deg):</td><td><span id='de_cRA'></span></td></tr>" 
        + "     <tr><td>central Dec (deg):</td><td><span id='de_cDec'></span></td></tr>" 
        + "     <tr><td>Radius (deg):</td><td><span id='de_radius'></span></td></tr>" 
        + "     <tr><td>Pixel size (deg):</td><td><span id='de_pxSize'></span></td></tr>" 
        + "     <tr><td>Projection:</td><td><span id='de_projection'></span></td></tr>" 
        + "     </table>"
        + "</div>"

        + "<br>"
        + "<hr>"
        + "<br>"

        + "Analysis"
        + "<div id='de_colorMap_container'>"
        + "     <span>Color map:</span>"
        + "     <select id='de_colorMap'>"+ cmapOptions + "<select>"
        + "</div>"

        + "<div id='de_scaleFunction_container'>"
        + "     <span>Scale function:</span>"
        + "     <select id='de_sfunc'>"+ sfuncOptions+ "<select>"
        + "</div>"
        
        + "<div id='de_inverse_container'>"
        + "     <span>Inverse:</span>"
        + "     <input type='checkbox' id='de_inverse' >"
        + "</div>"

        + "<br>"
        + "<hr>"
        + "<br>"
        
        + "<div id='de_pixel_container'>"
        + "     <table id='de_pixel_table'>"
        + "     <tr><td>Image coords (i, j):</td><td><span id='de_i'>-</span>,<span id='de_j'>-</span></td></tr>"
        + "     <tr><td>WCS coords (RA, Dec):</td><td><span id='de_ra'>-</span>,<span id='de_dec'>-</span></td></tr>"
        + "     <tr><td>Pixel value:</td><td><span id='de_pxvalue'>-</span></td></tr>"
        + "     </table>"
        + "</div>"

        // + "<div id='de_projection_container'>"
        // + "     <span>Projection:</span>"
        // + "     <select id='de_proj'>"+ projOptions + "<select>"
        // + "</div>"
        
        
        );
    }

}

export default  CtrlPanelView;