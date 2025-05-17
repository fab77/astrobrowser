// "use strict";
// /**
//  * @author Fabrizio Giordano (Fab77)
//  */
// import Tile from './Tile.js';
// import AllSkyTile from './AllSkyTile.js';
// import { loadAllskyImage } from "./AllskyImageLoader.js";
// import HiPSDescriptor from '../HiPSDescriptor.js';
// // import HiPS from './HiPS4.js';
// import HiPS from './HiPS.js';
// import global from '../../Global.js';
// import {visibleTilesManager} from '../grids/VisibleTilesManager.js'
// class TilesBuffer3 {

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
//     constructor(descriptor, format, shaderProgram, samplerIdx, order, hips) {

//         this._descriptor = descriptor;
//         this._format = format;
//         this._shaderprogram = shaderProgram;
//         this._samplerIdx = samplerIdx;
//         this._allsky = (descriptor.minOrder >= 3);
//         this._keep0OrderTiles = true;

//         this._curorder = order;
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

//         setInterval(this.updateAvailableTiles, 1000, this);
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
//         let ko;
//         for (const [key, tile] of caller._tiles.entries()) {
//             ko = key.split("#")[0];

//             if (!tile.isVisible) {
//                 if (ko == 0 && this._keep0OrderTiles) continue;
//                 // tile = null;
//                 caller._tiles.delete(key);
//                 continue;
//             }
//             if (tile.isLoaded) {
//                 tmp.set(key, tile);
//             }
//         }
//         caller._availableTiles = tmp;

//         for (const [key, tile] of caller._tilesCache.entries()) {
//             if (!tile.isVisible) {
//                 caller._tilesCache.delete(key);
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


//     purge(order) {

//         // each tile should check every 1/2 seconds:
//         // - if it is no more in the FoV => move it into cache
//         // - if it is not in the field of view => remove from cache after 1/2 seconds
//         // - if its order does not correspond to the visible one => move it to the cache only if:
//         //      - if its order < current order => move to the cache if all children are active or superseeded
//         //      - if its order > current order => move to the cache if the parent is active 
//         let ko = undefined;
//         for (let [key, ctile] of this._tiles) {
//             ko = key.split("#")[0];

//             if (ko == 0 && this._keep0OrderTiles) continue;

//             if (Math.abs(ko - order) >= 2) {
//                 ctile.abort(); // <-- TODO
//                 this._tiles.delete(key);
//                 if (this._tilesCache.has(key)) this._tilesCache.delete(key);
//             }
//         }
//     }

//     cleanCache(order) {

//         let ko = undefined;
//         for (let [key, ctile] of this._tilesCache) {
//             ko = key.split("#")[0];

//             if (ko == 0 && this._keep0OrderTiles) continue;

//             if (order - ko >= 2 && ctile._children.size == 4) {
//                 ctile.abort(); // <-- TODO
//                 this._tilesCache.delete(key);
//             } else if (ko - order >= 2 && ctile.parentTile) {
//                 ctile.abort(); // <-- TODO
//                 this._tilesCache.delete(key);
//             }

//         }
//     }
//     // updateTiles(hips) {


//     //     const self = this;
//     //     const tilesNoByOrder = visibleTilesManager.visibleTilesByOrder;
//     //     const tilesOrder = tilesNoByOrder.order;
//     //     tilesNoByOrder.pixels.forEach( (tileNo) => {

//     //         // TODO remove parent only after all children have been loaded!!!
//     //         const parentPixno = pixels[p] >> 2;
//     //         const po = in_order - 1;
//     //         let parentTile = null;

//     //         const pkey = po + "#" + parentPixno;
//     //         if (self._tiles.has(pkey) && !self._tilesCache.has(pkey)) {
//     //             if (po > 0) {
//     //                 self._tilesCache.set(pkey, self._tiles.get(pkey));
//     //                 self._tiles.delete(pkey);
//     //             }
//     //             parentTile = self._tilesCache.get(pkey);
//     //         }


//     //         const tileKey = tilesOrder*"#"+tileNo;
//     //         if (self._tiles.has(tileKey)) {
//     //             return;
//     //         }
//     //         if (self._tilesCache.has(tileKey)) {
//     //             let tile = self._tilesCache.get(tileKey);
                
//     //             tile.parentTile = parentTile;
                
//     //             self._tiles.set(tileKey, tile);
//     //             self._tilesCache.delete(tileKey);
//     //             return;
//     //         } else {
//     //             let tile = undefined;
//     //             if (self._allsky && tilesOrder < 3) {
//     //                 if (self._allskyImage !== undefined) { //  ??
//     //                     tile = new AllSkyTile(tileNo, self._descriptor, self._format, tilesOrder, self._shaderprogram, self, hips, self._samplerIdx, self._allskyImage);
//     //                 }
//     //             } else {
//     //                 tile = new Tile(tileNo, hips._descriptor, hips._format, tilesOrder, hips.shaderprogram, self, hips, hips.samplerIdx);
//     //             }

//     //             if (tile) {
//     //                 self._tiles.set(tileKey, tile);
//     //                 tile.parentTile = parentTile;
//     //             }
//     //         }
//     //     });



//     //     // TODO Check if this._hips.maxOrder is always set
//     //     if (in_order > this._hips.maxOrder) {
//     //         in_order = this._hips.maxOrder;
//     //     }

//     //     this.purge(in_order);
//     //     this.cleanCache(in_order);



//     // }
//     updateTiles(pixels, in_order) {

//         // TODO Check if this._hips.maxOrder is always set
//         if (in_order > this._hips.maxOrder) {
//             in_order = this._hips.maxOrder;
//         }

//         this.purge(in_order);
//         this.cleanCache(in_order);

//         // Zoom in
//         if (in_order - this._curorder > 0) {
//             this._curorder = in_order;
//             this._curpixels = pixels;

//             for (let p = 0; p < pixels.length; p++) {
//                 let key = in_order + "#" + pixels[p];

//                 // TODO remove parent only after all children have been loaded!!!
//                 let parentPixno = pixels[p] >> 2;
//                 let po = in_order - 1;
//                 let parentTile = null;

//                 let pkey = po + "#" + parentPixno;
//                 if (this._tiles.has(pkey) && !this._tilesCache.has(pkey)) {
//                     if (po > 0) {
//                         this._tilesCache.set(pkey, this._tiles.get(pkey));
//                         this._tiles.delete(pkey);
//                     }
//                     parentTile = this._tilesCache.get(pkey);
//                 }



//                 if (this._tiles.has(key)) {
//                     continue;
//                 }

//                 if (this._tilesCache.has(key)) {
//                     let tile = this._tilesCache.get(key);
//                     tile.parentTile = parentTile;
//                     this._tiles.set(key, tile);
//                     this._tilesCache.delete(key);
//                     continue;
//                 }

//                 let tile = undefined;
//                 if (this._allsky && in_order < 3) {
//                     if (this._allskyImage !== undefined) { //  ??
//                         tile = new AllSkyTile(pixels[p], this._descriptor, this._format, in_order, this._shaderprogram, this, this._hips, this._samplerIdx, this._allskyImage);
//                     }
//                 } else {
//                     tile = new Tile(pixels[p], this._descriptor, this._format, in_order, this._shaderprogram, this, this._hips, this._samplerIdx);
//                 }

//                 if (tile) {
//                     this._tiles.set(key, tile);
//                     tile.parentTile = parentTile;
//                 }

//             }
//             // Zoom Out
//         } else if (this._curorder - in_order > 0) {
//             this._curorder = in_order;
//             this._curpixels = pixels;

//             for (let p = 0; p < pixels.length; p++) {
//                 let key = in_order + "#" + pixels[p];

//                 let childPixno0 = pixels[p] << 2;
//                 let children = [childPixno0, childPixno0 + 1, childPixno0 + 2, childPixno0 + 3];
//                 let co = in_order + 1;

//                 // TODO remove children only after current tile's been loaded!!!
//                 for (let cpixno of children) {
//                     let ckey = co + "#" + cpixno;
//                     if (this._tiles.has(ckey) && !this._tilesCache.has(ckey)) {
//                         this._tilesCache.set(ckey, this._tiles.get(ckey));
//                         this._tiles.delete(ckey);
//                     }
//                 }

//                 if (this._tiles.has(key)) {
//                     continue;
//                 }

//                 if (this._tilesCache.has(key)) {
//                     let tile = this._tilesCache.get(key);
//                     this._tiles.set(key, tile);
//                     this._tilesCache.delete(key);
//                     continue;
//                 }

//                 let tile = undefined;
//                 if (this._allsky && in_order < 3) {
//                     if (this._allskyImage !== undefined) { //  ??
//                         tile = new AllSkyTile(pixels[p], this._descriptor, this._format, in_order, this._shaderprogram, this, this._hips, this._samplerIdx, this._allskyImage);
//                     }
//                 } else {
//                     tile = new Tile(pixels[p], this._descriptor, this._format, in_order, this._shaderprogram, this, this._hips, this._samplerIdx);
//                 }

//                 if (tile) {
//                     this._tiles.set(key, tile);
//                 }

//             }
//         } else { // camera rotated
//             this._curorder = in_order;
//             this._curpixels = pixels;
//             for (let p = 0; p < pixels.length; p++) {
//                 let key = in_order + "#" + pixels[p];
//                 if (this._tiles.has(key)) {
//                     continue;
//                 }

//                 if (this._tilesCache.has(key)) {
//                     let tile = this._tilesCache.get(key);
//                     this._tiles.set(key, tile);
//                     this._tilesCache.delete(key);
//                     continue;
//                 }

//                 let tile = undefined;
//                 if (this._allsky && in_order < 3) {
//                     if (this._allskyImage !== undefined) { //  ??
//                         tile = new AllSkyTile(pixels[p], this._descriptor, this._format, in_order, this._shaderprogram, this, this._hips, this._samplerIdx, this._allskyImage);
//                     }
//                 } else {
//                     tile = new Tile(pixels[p], this._descriptor, this._format, in_order, this._shaderprogram, this, this._hips, this._samplerIdx);
//                 }

//                 if (tile) {
//                     this._tiles.set(key, tile);
//                 }
//             }
//         }



//     }



// }


// export default TilesBuffer3;