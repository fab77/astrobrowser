import { Xyf } from 'healpixjs';
import global from '../../Global.js';

/**
 * the idea is to have one TileBuffer per HiPS, 
 * in order to permit the multi-HiPS and handling
 * limit on orders (global.order > hips.order)
 */
class HPXGeometryCache {

    _geometry;

    constructor() {

        this._orderGeometry = [];
        // this._geometry = new Map(); // <Xyf, [vertexPosition(20)]


        // let minutesToLiveInCache = 1;
        // this._cacheAliveMilliSeconds = minutesToLiveInCache * 60 * 1000;
        // setInterval(() => { this.cacheCleaner() }, 10000)

    }

    

    /**
     * 
     * @param {number} order 
     * @param {Xyf} xyf 
     */
    getGeometry(order, xyf) {
        if (this._orderGeometry[order] === undefined) {
            this._orderGeometry[order] = new Map()
            return null;
        }
        
        // if (!this._orderGeometry[order].has(xyf)) {
            // const vtp = this.setupPositionAndTexture(order, orderjump, parentXyf, x, y);
            // this._orderGeometry[order].get(xyf).push(vtp)
        // }

        return this._orderGeometry[order].get(xyf)

    }

    addGeometry(order, xyf, vecTexPosArray){
        if (this._orderGeometry[order] === undefined) {
            this._orderGeometry[order] = new Map()
        }
        this._orderGeometry[order].set(xyf, vecTexPosArray)

    }



}

export const hpxGeometryCache = new HPXGeometryCache();
