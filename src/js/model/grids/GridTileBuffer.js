// "use strict";
// /**
//  * @author Fabrizio Giordano (Fab77)
//  */
// import GridTile from './GridTile.js';
// // import AllSkyTile from './AllSkyTile.js';
// import HiPSDescriptor from '../HiPSDescriptor.js';
// import HealpixGrid from './HealpixGrid.js';
// class GridTilesBuffer {

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
//      * @param {HealpixGrid} hips 
//      */
//     constructor(descriptor, format, shaderProgram, samplerIdx, hips) {

//         this._descriptor = descriptor;
//         this._format = format;
//         this._shaderprogram = shaderProgram;
//         this._samplerIdx = samplerIdx;
//         this._allsky = (descriptor.minOrder >= 3);

//         this._curorder = undefined;
//         this._curpixels;
        
//         this._tiles = new Map();
//         this._tilesCache = new Map();

//         this._hips = hips;

//     }

//     getTiles() {
//         return this._tiles;
//     }

//     purgeTile(tileid) {
//         // console.log("Removing tile "+tileid);
//         let tile = this._tiles.get(tileid);
//         this._tilesCache.set(tileid, tile);
//         this._tiles.delete(tileid);
//     }

//     purgeChildrenTiles() {
//         for (const [key, value] of this._tiles.entries()) {
//             let order = parseInt(key.split("#")[0]);
//             if (order > this._curorder) {
//                 this._tiles.delete(key);
//             }
//         }
//     }

//     childLoaded(parenttileno, parentorder, childtileno) {

//         if (this._tiles.has(parentorder + "#" + parenttileno)) {
//             let parentTile = this._tiles.get(parentorder + "#" + parenttileno);
//             if (parentTile !== undefined) {
//                 parentTile.addChild(childtileno);
//             }
            
//         }
//     }

//     garbageCollector() {
//         // iterate over this._parent4Children and remove all loaded
//         for (let [order, value] of this._parent4Children) {
//             for (let [parent, children] of value) {
//                 if (children.size == 4) {
//                     this._tiles.delete(order + "#" + parent);
//                     this._parent4Children.get(order).delete(parent);
//                 }
//             }
//         }
//     }

//     clearAll() {
//         this._tiles = new Map();
//     }

//     updateTiles(pixels, order) {

//         if (order > this._hips.maxOrder) {
//             order = this._hips.maxOrder;
//         }

//         if (this._curorder !== undefined && this._curorder > order) {
//             this._curorder = order;
//             this.purgeChildrenTiles();
//         }
        
//         this._curorder = order;
//         this._curpixels = pixels;

//         for (let p = 0; p < pixels.length; p++) {
//             // TODO idea: each Tile shoud be a Promise. It gets added when the texture loading is done. Than, move here the check for parent deletion            
//             if (!this._tiles.has(order + "#" + pixels[p])) {
//                 let tile;
//                 if (this._tilesCache.has(order + "#" + pixels[p])) {
//                     tile = this._tilesCache.get(order + "#" + pixels[p]);
//                     this._tilesCache.delete(order + "#" + pixels[p]);

//                     this._tiles.set(order + "#" + pixels[p], tile);
                    
//                 } else if (this._allsky && order < 3) {
//                     if (this._allskyImage !== undefined) {
//                         tile = new AllSkyTile(pixels[p], this._descriptor, this._format, order, this._shaderprogram, this, this._hips, this._samplerIdx, this._allskyImage);
//                     }
//                 } else {
                    
//                     tile = new GridTile(pixels[p], this._descriptor, this._format, order, this._shaderprogram, this, this._hips, this._samplerIdx);
                    
//                 }

//                 this._tiles.set(order + "#" + pixels[p], tile);

//             }
//         }
//     }

    

// }


// export default GridTilesBuffer;