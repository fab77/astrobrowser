// "use strict";
// /**
//  * @author Fabrizio Giordano (Fab77)
//  */
// import Tile from './Tile.js';
// import AllSkyTile from './AllSkyTile.js';
// import { loadAllskyImage } from "./AllskyImageLoader.js";
// import HiPSDescriptor from '../HiPSDescriptor.js';
// import HiPS from './HiPS4.js';
// class TilesBuffer {

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

//         this._hips = hips;

//     }

//     getTiles() {
//         return this._tiles;
//     }

//     // purgeTile(tileid) {
//     //     // console.log("Removing tile "+tileid);
//     //     let tile = this._tiles.get(tileid);
//     //     if (tile !== undefined) {
//     //         this._tilesCache.set(tileid, tile);
//     //         this._tiles.delete(tileid);
//     //     }
        
//     // }

//     // purgeChildrenTiles() {
//     //     for (const [key, value] of this._tiles.entries()) {
//     //         let order = parseInt(key.split("#")[0]);
//     //         if (order > this._curorder) {

//     //             if (value !== undefined)  {
//     //                 this._tilesCache.set( key, value);
//     //                 this._tiles.delete(key);
//     //                 // console.log("removing child "+key);
//     //             } 
//     //             // else {
//     //             //     console.log("child "+key+ " is undefined");
//     //             // }
                

//     //         }
//     //     }
//     // }

//     // purgeParent (parentTileno, orden) {
//     //     if (orden > 0) {
//     //         if (this._tiles.has((orden-1) + "#" + parentTileno) &&
//     //             this._tiles.has(orden + "#" + (parentTileno<<2)) && 
//     //             this._tiles.has(orden + "#" + ((parentTileno<<2) + 1))&& 
//     //             this._tiles.has(orden + "#" + ((parentTileno<<2) + 2))&& 
//     //             this._tiles.has(orden + "#" + ((parentTileno<<2) + 3))
//     //             ) {
                
//     //             let parentTile = this._tiles.get( (orden-1) + "#" + parentTileno);
//     //             if (parentTile !== undefined) {
//     //                 // console.log("removing parent "+(orden-1) + "#" + parentTileno+": "+parentTile);
//     //                 this._tilesCache.set( (orden-1) + "#" + parentTileno, parentTile);
//     //                 this._tiles.delete( (orden-1) + "#" + parentTileno);
//     //             } 
                
                
//     //         }
//     //     }
//     // }
    
//     clearAll() {
//         this._tiles = new Map();
//     }

//     addTileIntoCache(tileno, order, isParent) {
//         if (order <= 0) {
//             return;
//         }
//         let key = order+"#"+tileno;
//         let tile = this._tilesCache.has(key) ?  this._tilesCache.get(key) : this._tiles.get(key);
//         this._tiles.delete(key);
//         if (tile === undefined) {
//             tile = new Tile(tileno, this._descriptor, this._format, order, this._shaderprogram, this, this._hips, this._samplerIdx);
//             this._tilesCache.set(key, tile);
//         }
//         if (isParent) {
//             if (tile.parent !== undefined) {
//                 tile.parent.abort();
//             }
//         }
        
//     }

//     updateTiles(pixels, in_order) {

//         if (in_order > this._hips.maxOrder) {
//             in_order = this._hips.maxOrder;
//         }


//         let initLev0 = false;
//         if (this._level0Cache.size == 0 && in_order == 0) {
//             initLev0 = true;
//         }
//         // if (this._curorder !== undefined && in_order < this._curorder) {
//         //     this._curorder = in_order;
//         //     this.purgeChildrenTiles();
//         // }
        
//         this._curorder = in_order;
//         this._curpixels = pixels;
        

//         for (let p = 0; p < pixels.length; p++) {
//             let key = in_order + "#" + pixels[p];
            
//             if (this._tiles.has(key)){
//                 continue;
//             }
//             // TODO idea: each Tile shoud be a Promise. It gets added when the texture loading is done. Than, move here the check for parent deletion            
            
//             let tile;
//             if  (this._tilesCache.has(key)){
//                 tile  = this._tilesCache.get(key);
//                 let parentPixno = pixels[p] >> 2;
//                 this.addTileIntoCache(parentPixno, (in_order-1), true);
//                 let childPixno0 = pixels[p] << 2;
//                 let childPixno1 = childPixno0 + 1;
//                 let childPixno2 = childPixno0 + 2;
//                 let childPixno3 = childPixno0 + 3;
//                 this.addTileIntoCache(childPixno0, (in_order+1), false);
//                 this.addTileIntoCache(childPixno1, (in_order+1), false);
//                 this.addTileIntoCache(childPixno2, (in_order+1), false);
//                 this.addTileIntoCache(childPixno3, (in_order+1), false);
//             } else  if (this._allsky && in_order < 3) {
//                 if (this._allskyImage !== undefined) { //  ??
//                     tile = new AllSkyTile(pixels[p], this._descriptor, this._format, in_order, this._shaderprogram, this, this._hips, this._samplerIdx, this._allskyImage);
//                     // tile.loadParent();
//                     // tile.loadChildren();
//                 }
//             } else {
//                 tile = new Tile(pixels[p], this._descriptor, this._format, in_order, this._shaderprogram, this, this._hips, this._samplerIdx);
//                 let parentPixno = pixels[p] >> 2;
//                 this.addTileIntoCache(parentPixno, (in_order-1), true);
//                 let childPixno0 = pixels[p] << 2;
//                 let childPixno1 = childPixno0 + 1;
//                 let childPixno2 = childPixno0 + 2;
//                 let childPixno3 = childPixno0 + 3;
//                 this.addTileIntoCache(childPixno0, (in_order+1), false);
//                 this.addTileIntoCache(childPixno1, (in_order+1), false);
//                 this.addTileIntoCache(childPixno2, (in_order+1), false);
//                 this.addTileIntoCache(childPixno3, (in_order+1), false);

//             }
//             if (initLev0) {
//                 this._level0Cache.set(key, tile);
//             }
//             this._tiles.set(key, tile);
//         }
//         console.log(this._tiles);
//     }

    

// }


// export default TilesBuffer;