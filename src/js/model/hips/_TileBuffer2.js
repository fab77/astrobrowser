// "use strict";
// /**
//  * @author Fabrizio Giordano (Fab77)
//  */
// import Tile from './Tile.js';
// import AllSkyTile from './AllSkyTile.js';
// import { loadAllskyImage } from "./AllskyImageLoader.js";
// import HiPSDescriptor from '../HiPSDescriptor.js';
// import HiPS from './HiPS4.js';
// import global from '../../Global.js';
// class TilesBuffer2 {

//     _tiles;
//     _cache;
//     _shaderprogram;
//     _descriptor;
//     _format;

//     /**
//      * 
//      * @param {HiPSDescriptor} descriptor 
//      * @param {*} format 
//      * @param {*} shaderProgram 
//      * @param {*} samplerIdx 
//      * @param {HiPS} hips 
//      */
//     constructor(descriptor, format, shaderProgram, samplerIdx, hips) {

//         this._descriptor = descriptor;
//         this._format = format;
//         this._shaderprogram = shaderProgram;
//         this._samplerIdx = samplerIdx;
//         this._allsky = (descriptor.minOrder >= 3);

//         this._curorder = undefined;
//         this._curpixels;
//         if (this._allsky) {
//             this._allskyImage = undefined;
//             // TODO load AllSky file
//             let texturl = this._descriptor.url + "/Norder3/Allsky." + format;
//             loadAllskyImage(texturl).then((image) => {
//                 this._allskyImage = image;
//                 this.updateTiles(this._curpixels, this._curorder);

//             }).catch(function (err) {
//                 console.log("[TilesBuffer] " + err);
//             });
//         }
//         this._tiles = new Map();
//         this._tilesCache = new Map();
//         this._level0Cache = new Map();

//         this._availableTiles = new Map();

//         this._hips = hips;

//         this.loadLevel0();

//         setInterval(this.updateAvailableTiles, 3000, this);
//         // setTimeout(this.updateAvailableTiles(), 3000);
//         this.updateAvailableTiles(this);
//     }

//     getTiles() {
//         // return this._tiles;
//         return this._availableTiles;
//     }


//     clearAll() {
//         this._tiles = new Map();
//     }



//     updateAvailableTiles(caller) {

//         if (global.debug) {
//             console.log("Updating visible tiles");
//         }

//         let tmp = new Map();
//         for (const [key, tile] of caller._tiles.entries()) {
//             if (!tile.isVisible) {
//                 tile = null;
//                 caller._tiles.delete(key);
//                 continue;
//             }
//             if (tile.isLoaded) {
//                 tmp.set(key, tile);
//             }
//         }
//         caller._availableTiles = tmp;
//         if (global.debug) {
//             console.log(caller._availableTiles);
//         }

//     }

//     addTileIntoCache(tileno, order, isParent) {
//         if (order <= 0) {
//             return;
//         }
//         let key = order + "#" + tileno;
//         let tile = this._tilesCache.has(key) ? this._tilesCache.get(key) : this._tiles.get(key);
//         this._tiles.delete(key);

//         if (tile === undefined) {
//             if (this._allsky && in_order < 3) {
//                 tile = new AllSkyTile(tileno, this._descriptor, this._format, order, this._shaderprogram, this, this._hips, this._samplerIdx, this._allskyImage);
//             } else {
//                 tile = new Tile(tileno, this._descriptor, this._format, order, this._shaderprogram, this, this._hips, this._samplerIdx);
//             }

//             this._tilesCache.set(key, tile);
//         }
//         if (isParent) {
//             if (tile.parent !== undefined) {
//                 tile.parent.abort();
//             }
//         }

//     }


//     loadLevel0() {

//         let tile;
//         for (let p = 0; p < 12; p++) {
//             let key = "0#" + p;
//             if (this._allsky) {
//                 tile = new AllSkyTile(p, this._descriptor, this._format, 0, this._shaderprogram, this, this._hips, this._samplerIdx, this._allskyImage);
//             } else {
//                 tile = new Tile(p, this._descriptor, this._format, 0, this._shaderprogram, this, this._hips, this._samplerIdx);
//             }
//             this._level0Cache.set(key, tile);
//             this._tiles.set(key, tile);
//         }
//     }

//     updateTiles(pixels, in_order) {

//         if (in_order > this._hips.maxOrder) {
//             in_order = this._hips.maxOrder;
//         }

//         this._curorder = in_order;
//         this._curpixels = pixels;


//         for (let p = 0; p < pixels.length; p++) {
//             let key = in_order + "#" + pixels[p];

//             if (this._tiles.has(key)) {
//                 continue;
//             }
//             // TODO idea: each Tile shoud be a Promise. It gets added when the texture loading is done. Than, move here the check for parent deletion            

//             let tile;
//             if (this._tilesCache.has(key)) {
//                 tile = this._tilesCache.get(key);
//             } else if (this._allsky && in_order < 3) {
//                 if (this._allskyImage !== undefined) { //  ??
//                     tile = new AllSkyTile(pixels[p], this._descriptor, this._format, in_order, this._shaderprogram, this, this._hips, this._samplerIdx, this._allskyImage);
//                 }
//             } else {
//                 tile = new Tile(pixels[p], this._descriptor, this._format, in_order, this._shaderprogram, this, this._hips, this._samplerIdx);
//             }
//             let parentPixno = pixels[p] >> 2;
//             this.addTileIntoCache(parentPixno, (in_order - 1), true);
//             let childPixno0 = pixels[p] << 2;
//             let childPixno1 = childPixno0 + 1;
//             let childPixno2 = childPixno0 + 2;
//             let childPixno3 = childPixno0 + 3;
//             this.addTileIntoCache(childPixno0, (in_order + 1), false);
//             this.addTileIntoCache(childPixno1, (in_order + 1), false);
//             this.addTileIntoCache(childPixno2, (in_order + 1), false);
//             this.addTileIntoCache(childPixno3, (in_order + 1), false);

//             this._tiles.set(key, tile);
//         }
//         // console.log("tiles");
//         // console.log(this._tiles);

//         // console.log("availabletiles");
//         // console.log(this._availableTiles);
//     }



// }


// export default TilesBuffer2;