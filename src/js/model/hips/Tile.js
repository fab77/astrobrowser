// "use strict";
// /**
//  * @author Fabrizio Giordano (Fab77)
//  */

// import { Healpix, Pointing, Vec3 } from "healpixjs";
// import { HiPSProjection } from "wcslight";

// import global from '../../Global.js';
// import RayPickingUtils from '../../utils/RayPickingUtils.js';
// import ColorMaps from "../../modules/dataexplorer/model/ColorMaps.js";
// import Canvas2D from "../../modules/dataexplorer/model/Canvas2D.js";
// import { hipsShaderProgram } from '../../shaders/HiPSShaderProgram.js';

// /**
//  * Tile represents 1 Norder0 tile. It is divided into 64 regions of Norder3 that get refreshed independently
//  * images from Norder0 are following the healpix tessellation:
//  * 0  1  4  5  ...
//  * 2  3  6  7  ...
//  * 8  9  12 13 ...
//  * 10 11 14 15 ...
//  * ...
//  * whilest Allsky follows an incremental tessellation:
//  * 0  1  2  3  ... 27
//  * 28 29 30 31 ... 54
//  * ...
//  */
// class Tile {

//     constructor(tileno, descriptor, format, order, shaderprogram, tilebuffer, hips, samplerIdx) {


        
//         Tile.MAX_REFORDER = 17;
//         Tile.TILE_ORDER_JUMP = 6;


//         this._children = new Set();
//         this._hips = hips;
//         this._tilebuffer = tilebuffer;
//         this._tileno = tileno;
//         this._format = format;
//         this._baseurl = descriptor.url;

//         this._maxorder = descriptor.maxOrder;
//         this._minorder = descriptor.minOrder;
//         this._order = order;
//         // if (this._maxorder < this._order) {
//         //     this._order = this._maxorder;
//         // }
//         this._parentTile = null;

//         this._isVisible = true;
//         this._isActive = true;
//         // this._isLoaded = false;
//         this._shaderprogram = shaderprogram;

//         this.opacity = 1.00 * 100.0 / 100.0;

//         this._hipsShaderIndex = samplerIdx; // <== used for multi hips 
//         // this._hipsShaderIndex = 0;
//         this._pixels = [];

//         this._texture = undefined;

//         // this.initModelBuffer2(); // <-- slow! transform in promise or callback
//         if (this._order != 0) {
//             setTimeout(this.amIStillInFoV, 3000, this);
//         }

//         this.vertexPositionBuffer = global.gl.createBuffer();
//         this.vertexIndexBuffer = global.gl.createBuffer();

//         this.initImage();

//     }

//     initImage() {

//         this._image = new Image();
//         this._downloading = true;
//         this._imageLoaded = false;

//         let dirnumber = Math.floor(this._tileno / 10000) * 10000;
//         this._texurl = this._baseurl + "/Norder";
//         if (this._maxorder < this._order) {
//             let tileno = this._tileno >> 2;
//             dirnumber = Math.floor(tileno / 10000) * 10000;
//             this._texurl += this._maxorder + "/Dir" + dirnumber + "/Npix" + tileno + "." + this._format;
//         } else {
//             this._texurl += this._order + "/Dir" + dirnumber + "/Npix" + this._tileno + "." + this._format;
//         }


//         this._image.onload = () => {
//             // this.textureLoaded(this._image);
//             this.imageLoaded();

//         };
//         this._image.onerror = () => {
//             this._imageLoaded = false;
//             this._downloading = false;
//         };


//         /* TODO this wont work since the image is rendered in webgl. 
//             To the click event this is what I should do:
//             - get coords (spherical) of mouse click
//             - get (using healpixjs) pixno related to mouse coords
//             - convert (spherical) coords to i,j and get pixel value
//         */
//         // this._image.addEventListener('click', () => {
//         //     console.log("Clicked on image");
//         // }, false);

//         this._image.setAttribute('crossorigin', 'anonymous');
//         this._image.setAttribute('crossOrigin', 'anonymous');
//         this._image.crossOrigin = "Anonymous";

//         this.loadTexture3();

//     }

//     imageLoaded() {
//         this._imageLoaded = true;
//         this._downloading = false;

//         this.textureLoaded();
//         this.initModelBuffer2();
//         this.initIndexBuffer();
//     }

//     getRefOrder() {
//         switch (this._order) {
//             case 0:
//             case 1:
//             case 2:
//             case 3:
//             case 4:
//                 return this._order + 7;
//             case 5:
//             case 6:
//                 return this._order + 6;
//             case 7:
//             case 8:
//                 return this._order + 5;
//             default:
//                 return this._order + 4;
//         }
//     }

//     textureLoaded() {

//         global.gl.useProgram(this._shaderprogram);

//         this._texture = global.gl.createTexture();
//         global.gl.activeTexture(global.gl.TEXTURE0 + this._hipsShaderIndex);
//         global.gl.pixelStorei(global.gl.UNPACK_FLIP_Y_WEBGL, true);
//         // global.gl.pixelStorei(global.gl.UNPACK_FLIP_Y_WEBGL, false);
//         global.gl.bindTexture(global.gl.TEXTURE_2D, this._texture);

//         // global.gl.texImage2D(global.gl.TEXTURE_2D, 0, global.gl.RGBA, global.gl.RGBA, global.gl.UNSIGNED_BYTE, this._image);

//         // from WW
//         global.gl.texParameteri(global.gl.TEXTURE_2D, global.gl.TEXTURE_WRAP_S, global.gl.CLAMP_TO_EDGE);
//         global.gl.texParameteri(global.gl.TEXTURE_2D, global.gl.TEXTURE_WRAP_T, global.gl.CLAMP_TO_EDGE);

//         global.gl.texParameteri(global.gl.TEXTURE_2D, global.gl.TEXTURE_MIN_FILTER, global.gl.LINEAR);
//         global.gl.texParameteri(global.gl.TEXTURE_2D, global.gl.TEXTURE_MAG_FILTER, global.gl.LINEAR);

//         global.gl.uniform1i(this._shaderprogram.samplerUniform, this._hipsShaderIndex);

//         if (!global.gl.isTexture(this._texture)) {
//             console.log("error in texture");
//         }

//         // global.gl.bindTexture(global.gl.TEXTURE_2D, null);
//         // this._textureLoaded = true;


//     }

//     async initModelBuffer2() {

//         // return new Promise(() => {
//         let facesVec3Array = new Array();
//         this._pixels = [];
//         let healpix;

//         // let reforder = ((this._order + Tile.TILE_ORDER_JUMP) > 10) ? 10 : (this._order + Tile.TILE_ORDER_JUMP);
//         let reforder = this.getRefOrder();

//         healpix = new Healpix(2 ** reforder);

//         let orighealpix = new Healpix(2 ** this._order);
//         let origxyf = orighealpix.nest2xyf(this._tileno);

//         let orderjump = reforder - this._order;
//         let dxmin = origxyf.ix * Math.pow(2, orderjump);
//         let dxmax = (origxyf.ix * Math.pow(2, orderjump)) + Math.pow(2, orderjump);
//         let dymin = origxyf.iy * Math.pow(2, orderjump);
//         let dymax = (origxyf.iy * Math.pow(2, orderjump)) + Math.pow(2, orderjump);

//         // let dxmin = origxyf.ix << orderjump;
//         // let dxmax = (origxyf.ix << orderjump) + (1 << orderjump);
//         // let dymin = origxyf.iy << orderjump;
//         // let dymax = (origxyf.iy << orderjump) + (1 << orderjump);


//         for (let dx = dxmin; dx < dxmax; dx++) {
//             for (let dy = dymin; dy < dymax; dy++) {
//                 let ipix3 = healpix.xyf2nest(dx, dy, origxyf.face);
//                 this._pixels.push(ipix3);
//             }
//         }


//         this.vertexPosition = new Float32Array(20 * this._pixels.length);


//         // let step = 1 / Math.pow(2, orderjump);
//         let step = 1 / (1 << orderjump);
//         let uindex = 0;
//         let vindex = 0;
//         // this.textureCoordinates = new Float32Array(8 * this._pixels.length);


//         for (let p = 0; p < this._pixels.length; p++) {
//             facesVec3Array = healpix.getBoundaries(this._pixels[p]);
//             let xyf = healpix.nest2xyf(this._pixels[p]);
//             uindex = xyf.iy - origxyf.iy * Math.pow(2, orderjump);
//             vindex = xyf.ix - origxyf.ix * Math.pow(2, orderjump);

//             // uindex = xyf.iy - (origxyf.iy << orderjump);
//             // vindex = xyf.ix - (origxyf.ix << orderjump);

//             this.vertexPosition[20 * p] = facesVec3Array[0].x;
//             this.vertexPosition[20 * p + 1] = facesVec3Array[0].y;
//             this.vertexPosition[20 * p + 2] = facesVec3Array[0].z;
//             this.vertexPosition[20 * p + 3] = step + (step * uindex);
//             this.vertexPosition[20 * p + 4] = 1 - (step + step * vindex);

//             this.vertexPosition[20 * p + 5] = facesVec3Array[1].x;
//             this.vertexPosition[20 * p + 6] = facesVec3Array[1].y;
//             this.vertexPosition[20 * p + 7] = facesVec3Array[1].z;
//             this.vertexPosition[20 * p + 8] = step + (step * uindex);
//             this.vertexPosition[20 * p + 9] = 1 - (step * vindex);

//             this.vertexPosition[20 * p + 10] = facesVec3Array[2].x;
//             this.vertexPosition[20 * p + 11] = facesVec3Array[2].y;
//             this.vertexPosition[20 * p + 12] = facesVec3Array[2].z;
//             this.vertexPosition[20 * p + 13] = step * uindex;
//             this.vertexPosition[20 * p + 14] = 1 - (step * vindex);

//             this.vertexPosition[20 * p + 15] = facesVec3Array[3].x;
//             this.vertexPosition[20 * p + 16] = facesVec3Array[3].y;
//             this.vertexPosition[20 * p + 17] = facesVec3Array[3].z;
//             this.vertexPosition[20 * p + 18] = step * uindex;
//             this.vertexPosition[20 * p + 19] = 1 - (step + step * vindex);

//         }



//         global.gl.bindBuffer(global.gl.ARRAY_BUFFER, this.vertexPositionBuffer);
//         global.gl.bufferData(global.gl.ARRAY_BUFFER, this.vertexPosition, global.gl.STATIC_DRAW);

//         global.gl.activeTexture(global.gl.TEXTURE0 + this._hipsShaderIndex);
//         global.gl.bindTexture(global.gl.TEXTURE_2D, this._texture);
//         global.gl.texImage2D(global.gl.TEXTURE_2D, 0, global.gl.RGBA, global.gl.RGBA, global.gl.UNSIGNED_BYTE, this._image);
//         this._textureLoaded = true;


//     }


//     async initIndexBuffer() {



//         this.vertexIndices = new Uint16Array(6 * this._pixels.length);
//         let baseFaceIndex = 0;

//         for (let j = 0; j < this._pixels.length; j++) {

//             this.vertexIndices[6 * j] = baseFaceIndex;
//             this.vertexIndices[6 * j + 1] = baseFaceIndex + 1;
//             this.vertexIndices[6 * j + 2] = baseFaceIndex + 2;


//             this.vertexIndices[6 * j + 3] = baseFaceIndex + 2;
//             this.vertexIndices[6 * j + 4] = baseFaceIndex + 3;
//             this.vertexIndices[6 * j + 5] = baseFaceIndex;

//             // baseFaceIndex = baseFaceIndex + 4;
//             baseFaceIndex = baseFaceIndex + 4;

//         }


//         global.gl.bindBuffer(global.gl.ELEMENT_ARRAY_BUFFER, this.vertexIndexBuffer);
//         global.gl.bufferData(global.gl.ELEMENT_ARRAY_BUFFER, this.vertexIndices, global.gl.STATIC_DRAW);
//         this.vertexIndexBuffer.itemSize = 1;
//         this.vertexIndexBuffer.numItems = this.vertexIndices.length;


//     }




//     // /**
//     //  * 
//     //  * @param {ColorMaps} colorMap 
//     //  */
//     // changeColorMap(colorMap) {
//     //     // TODO
//     //     this._image;
//     // }


//     loadTexture3() {

//         var _self = this;
//         if (this._format == 'fits') {
//             let hp = new HiPSProjection();
//             this._downloading = true;
//             hp.initFromFile(_self._texurl).then((res) => {
//                 if (res !== undefined && res.data !== undefined) {
//                     let canvas2d = new Canvas2D(res.data, res.header, res.outproj);
//                     _self._image.src = canvas2d.getBrowseImage();
//                     // _self._imageLoaded = true;
//                     // _self._downloading = false;
//                 }
//                 // new HiPSProjection(_self._texurl).then((res) => {
//                 //     // let canvas = res.canvas2d;
//                 //     // canvas.process();
//                 //     // _self._image.src = canvas.getCanvas2DBrowse();
//                 //     if (res !== undefined && res.fitsdata !== undefined) {
//                 //         let canvas2d = new Canvas2D(res.fitsdata, res.fitsheader, res.outproj);
//                 //         _self._image.src = canvas2d.getBrowseImage();
//                 //         // _self._image.onmousedown = function () {
//                 //         //     console.log("yuppie");
//                 //         // };
//                 //     }

//             }).catch(function (err) {
//                 _self._imageLoaded = false;
//                 _self._downloading = false;
//                 console.log("[Tile.js] FITS " + err);
//             });
//         } else {
//             this._image.src = this._texurl;
//             // this._image.addEventListener('error', (err) => {
//             //     console.log("[Tile.js] Image not loaded A", err);
//             //     this._imageLoaded = false;
//             //     this._downloading = false;
//             // }, false);

//             // this._image.onmousedown = function () {
//             //     console.log("yuppie");
//             // };
//         }

//     }



//     amIStillInFoV(caller) {
//         var _self = caller;
//         this._poller = setInterval(function () {

//             // if (_self._hips.getCurrentHealpixOrder() != _self._order) {
//             //     clearInterval(_self._poller);
//             //     _self._isVisible = false;

//             // } else {
//             let geomhealpix = new Healpix(Math.pow(2, _self._order));
//             let pixels = [];
//             let maxX = global.gl.canvas.width;
//             let maxY = global.gl.canvas.height;

//             let xy = [];
//             let neighbours = [];
//             let intersectionWithModel;
//             let intersectionPoint = null;
//             let currP, currPixNo;

//             var i = 0;
//             for (i = 0; i <= maxX; i += maxX / 10) {
//                 var j = 0;
//                 for (j = 0; j <= maxY; j += maxY / 10) {

//                     intersectionWithModel = {
//                         "intersectionPoint": null,
//                         "pickedObject": null
//                     };

//                     xy = [i, j];


//                     intersectionWithModel = RayPickingUtils.getIntersectionPointWithSingleModel(xy[0], xy[1], _self._hips);
//                     intersectionPoint = intersectionWithModel.intersectionPoint;

//                     if (intersectionPoint.length > 0) {
//                         currP = new Pointing(new Vec3(intersectionPoint[0], intersectionPoint[1], intersectionPoint[2]));

//                         currPixNo = geomhealpix.ang2pix(currP);
//                         if (currPixNo >= 0) {
//                             neighbours = geomhealpix.neighbours(currPixNo);
//                             if (pixels.indexOf(currPixNo) == -1) {
//                                 pixels.push(currPixNo);
//                             }
//                             var k = 0;
//                             for (k = 0; k < neighbours.length; k++) {
//                                 if (pixels.indexOf(neighbours[k]) == -1) {
//                                     if (neighbours[k] >= 0) {
//                                         pixels.push(neighbours[k]);
//                                     }
//                                 }
//                             }
//                         }
//                     }
//                 }

//             }

//             if (!pixels.includes(_self._tileno)) {
//                 // TODO CALL clearInterval somewhere!!!!!
//                 clearInterval(_self._poller);
//                 _self._isVisible = false;
//                 // _self._tilebuffer.purgeTile(_self._order+"#"+_self._tileno);
//             }
//             // }


//         }, 3000);

//     }

//     get isVisible() {
//         return this._isVisible;
//     }

//     get isLoaded() {
//         return this._textureLoaded;
//     }


//     addChild(childTileno) {
//         this._children.add(childTileno);
//         if (this._children.size == 4 && this._order != 0) {
//             clearInterval(this._poller);
//             // this._tilebuffer.purgeTile(this._order+"#"+this._tileno);
//         }
//     }

//     abort() {

//         this._tilebuffer._tiles.delete(this._order + "#" + this._tileno);
//         this._tilebuffer._tilesCache.delete(this._order + "#" + this._tileno);

//     }

//     set parentTile(ptile) {
//         this._parentTile = ptile
//     }

//     get parentTile() {
//         return this._parentTile;
//     }

//     get order() {
//         return this._order;
//     }

//     get tileno() {
//         return this._tileno;
//     }

//     get key() {
//         return this._order + "#" + this._tileno;
//     }

//     draw() {

//         global.gl.bindBuffer(global.gl.ARRAY_BUFFER, this.vertexPositionBuffer);

//         global.gl.vertexAttribPointer(hipsShaderProgram.locations.vertexPositionAttribute, 3, global.gl.FLOAT, false, 5 * 4, 0);

//         global.gl.vertexAttribPointer(hipsShaderProgram.locations.textureCoordAttribute, 2, global.gl.FLOAT, false, 5 * 4, 3 * 4);

//         global.gl.bindBuffer(global.gl.ELEMENT_ARRAY_BUFFER, this.vertexIndexBuffer);

//         global.gl.enableVertexAttribArray(hipsShaderProgram.locations.vertexPositionAttribute);
//         global.gl.enableVertexAttribArray(hipsShaderProgram.locations.textureCoordAttribute);


//         if (this._order < Tile.MAX_REFORDER) {
//             global.gl.activeTexture(global.gl.TEXTURE0 + this._hipsShaderIndex);
//             global.gl.bindTexture(global.gl.TEXTURE_2D, this._texture);
//             global.gl.uniform1f(hipsShaderProgram.locations.textureAlpha, this.opacity);
//             // global.gl.uniform1i(hipsShaderProgram.locations.clorMapIdx, this.colorMapIdx);

//             // GL_PRIMITIVE_RESTART_FIXED_INDEX num elem (one GL_PRIMITIVE_RESTART_FIXED_INDEX every 2 triangles <= 1 texture)
//             let primno = (this.vertexIndices.length / 6) * 2 * 3;
//             global.gl.drawElements(global.gl.TRIANGLES, primno, global.gl.UNSIGNED_SHORT, 0);
//         } else {
//             for (var i = 0; i < this._pixels.length; i++) {

//                 global.gl.activeTexture(global.gl.TEXTURE0 + this._hipsShaderIndex);
//                 global.gl.bindTexture(global.gl.TEXTURE_2D, this._texture);
//                 global.gl.uniform1f(hipsShaderProgram.locations.textureAlpha, this.opacity);
//                 // global.gl.uniform1i(hipsShaderProgram.locations.clorMapIdx, this.colorMapIdx);

//                 global.gl.drawElements(global.gl.TRIANGLES, 6, global.gl.UNSIGNED_SHORT, 12 * i);
//             }
//         }

//         global.gl.disableVertexAttribArray(hipsShaderProgram.locations.vertexPositionAttribute);
//         global.gl.disableVertexAttribArray(hipsShaderProgram.locations.textureCoordAttribute);
//     }

// }

// export default Tile;