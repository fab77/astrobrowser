import Tile from "../hipsnew/Tile2.js";

/**
 * the idea is to have one TileBuffer per HiPS, 
 * in order to permit the multi-HiPS and handling
 * limit on orders (global.order > hips.order)
 */
class TileBuffer {

    _tiles;
    _ancestorTiles;
    _cachedTiles;
    _activeHiPS;

    constructor() {
        this._tiles = new Map();;
        this._cachedTiles = new Map();
        this._activeHiPS = new Map();
        
        this._galTiles = new Map();;
        this._galCachedTiles = new Map();
        this._galActiveHiPS = new Map();

        let minutesToLiveInCache = 1;
        this._cacheAliveMilliSeconds = minutesToLiveInCache * 60 * 1000; 

        setInterval( () => { this.cacheCleaner() }, 10000)
    }


    addHiPS(hips) {
        if (this._activeHiPS.has(hips)) {
            console.error("HiPS already present in TileBuffer")
            return;
        }
        this._activeHiPS.set(hips, new Map());
    }

    addGalHiPS(hips) {
        if (this._galActiveHiPS.has(hips)) {
            console.error("HiPS already present in TileBuffer")
            return;
        }
        this._galActiveHiPS.set(hips, new Map());
    }

    addTile(order, tileno) {
        for (const [hips, tiles] of Object.entries(this._activeHiPS)) {
            this.getTile(tileno, order, hips);
        }
    }
    
    addGalTile(order, tileno) {
        for (const [hips, tiles] of Object.entries(this._galActiveHiPS)) {
            this.getTile(tileno, order, hips);
        }
    }

    getTile(tileno, order, hips) {
        const tileKey = order + "#" + tileno + "#" + hips.baseURL;

        if (!this._tiles.has(tileKey)) {
            if (this._cachedTiles.has(tileKey)) {
                let tile = this._cachedTiles.get(tileKey)
                this._tiles.set(tileKey, tile);
                this._cachedTiles.delete(tileKey);
                tile.resetCacheTime0()
            } else {
                const tile = new Tile(tileno, order, hips);
                this._tiles.set(tileKey, tile);
            }
        }
        return this._tiles.get(tileKey);
    }

    getGalTile(tileno, order, hips) {
        const tileKey = order + "#" + tileno + "#" + hips.baseURL;

        if (!this._galTiles.has(tileKey)) {
            if (this._galCachedTiles.has(tileKey)) {
                let tile = this._galCachedTiles.get(tileKey)
                this._galTiles.set(tileKey, tile);
                this._galCachedTiles.delete(tileKey);
                tile.resetCacheTime0()
            } else {
                const tile = new Tile(tileno, order, hips);
                this._galTiles.set(tileKey, tile);
            }
        }
        return this._galTiles.get(tileKey);
    }

    moveTileToCache(tileno, order, hips){
        const tileKey = order + "#" + tileno + "#" + hips.baseURL;

        if (this._tiles.has(tileKey)) {
            // console.log(`moveTileToCache: ${tileKey}`)
            let tile = this._tiles.get(tileKey)
            tile.setCacheTime0()
            this._cachedTiles.set(tileKey, tile);
            this._tiles.delete(tileKey);
        }
        if (this._galTiles.has(tileKey)) {
            // console.log(`moveTileToCache: ${tileKey}`)
            let tile = this._galTiles.get(tileKey)
            tile.setCacheTime0()
            this._galCachedTiles.set(tileKey, tile);
            this._galTiles.delete(tileKey);
        }
    }

    cacheCleaner(){
        // console.log(this._cachedTiles)
        const now = new Date().getTime()
        for (const [tileKey, tile] of this._cachedTiles ) {
            if (!tile.inView && (now - tile.cacheTime0 > this._cacheAliveMilliSeconds) ){
                tile.destroyIntervals()
                this._cachedTiles.delete(tileKey)
            }
        }
        for (const [tileKey, tile] of this._galCachedTiles ) {
            if (!tile.inView && (now - tile.cacheTime0 > this._cacheAliveMilliSeconds) ){
                tile.destroyIntervals()
                this._galCachedTiles.delete(tileKey)
            }
        }
        // console.log(this._cachedTiles)
    }


}

export const newTileBuffer = new TileBuffer();
