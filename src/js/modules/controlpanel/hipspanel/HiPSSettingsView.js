// "use strict";
// /**
//  * @author Fabrizio Giordano (Fab77)
//  */

// import $ from "jquery";
// import HiPSDescriptor from "../../../model/HiPSDescriptor.js";
// import ColorMaps from "../../dataexplorer/model/ColorMaps.js";

// class HiPSSettingsView {
//     _imgFormats;
//     _fits;
//     _hipsName;
    

//     /**
//      * 
//      * @param {HiPSDescriptor} descriptor 
//      * @returns 
//      */
//     constructor(descriptor) {

//         this._fits = false;
        
//         this._imgFormats = descriptor.imgFormats;
//         if (this._imgFormats.includes("fits")){
//             this._fits = true;
//         }
//         this._hipsName = descriptor.surveyName;

//         this.init();

//         var _public = {
//             getHtml: ()=>{
//                 return this._html;
//             },
//             addCloseHandler: (handler) => {
                
//                 this._html.find("#close-settings").on("click", function(e){
//                     e.stopPropagation();
//                     handler();
//                 });

//             },
//             formatDropDown: () => {
//                 return $("#hips_frmt");
//             },
//             colorMapDropDown: () => {
//                 return $("#hips_cmap");
//             },
//             invertColorMap: () => {
//                 return $("#hips_inverse");
//             }
//             // ,
//             // addChangeHandler: (handler) => {
//             //     this._html.find("#change-settings").on("click", function(e){
//             //         e.stopPropagation();
//             //         let geom = $("#geom-select").children("option:selected").val();
//             //         let name = $("#name-select").children("option:selected").val();
//             //         // let hue = $("#hue-select").children("option:selected").val();
//             //         let hue = null;
//             //         let shapeColor = $("#shape-color").val();
                    
//             //         handler(geom, name, shapeColor, hue);
//             //     });

//             // }
//         }

//         return _public;
//     }

//     init() {
//         this._visible = false;
//         let _self = this;

//         let imgFormatOptions = "";
//         this._imgFormats.forEach( (format) => {
//             imgFormatOptions += "<option id='hips_frmt_opt'>"+format+"</option>";
//         });
        
//         let cmapOptions = "";
//         for (let ckey in ColorMaps) {
//             cmapOptions += "<option id='hips_cmap_opt'>"+ckey+"</option>";
//         }

//         let sfuncOptions = "";
//         let fitsLabel = "This HiPS doesn't provides FITS format";
//         if (this._fits) {
//             // TODO define scale functions into an object
//             fitsLabel = "This HiPS provides FITS format";
//             let sfuncOptions = "";
//             sfuncOptions += "<option id='hips_sfunc_opt' value='linear' selected>linear</option>";
//             sfuncOptions += "<option id='hips_sfunc_opt' value='log'>log</option>";
//             sfuncOptions += "<option id='his_sfunc_opt' value='sqrt'>sqrt</option>";
//         }
        
//         this._html = $(`
//             <div id='hips_settings'>${_self._hipsName}<button id='close-settings'>X</button>
//             <table>
//                 <tr>
//                     <td>image format:</td><td><select id='hips_frmt'>${imgFormatOptions}</select></td>
//                 </tr>
//                 <tr>
//                     <td>color map:</td><td><select id='hips_cmap'>${cmapOptions}</select></td>
//                 </tr>
//                 <tr>
//                     <td>inverse:</td><td><input type='checkbox' id='hips_inverse' ></td>
//                 </tr>
//             </table>
//             </div>
//         `);

//     }
// }

// export default HiPSSettingsView;

