import { Healpix } from "healpixjs";
import { HiPSProjection } from "wcslight";

import global from '../../Global.js';
import { hipsShaderProgram } from '../../shaders/HiPSShaderProgram.js';
import { newTileBuffer } from './TileBuffer.js';
import { fovHelper } from './FoVHelper.js';

class AncestorTile {

    _hips;
    _tileno;
    _baseurl;
    _order;

    constructor(tileno, order, hips) {

        this._ready = false;
        this._hips = hips;
        this._tileno = tileno;

        this._format = hips.format;
        this._baseurl = hips.baseURL;
        this._maxorder = hips.maxOrder;
        this._minorder = hips.minOrder;

        this._isGalacticHips = hips.isGalacticHips;

        this._order = order;

        this.opacity = 1.00;

        this._hipsShaderIndex = 0;
        this._pixels = [];

        this._texture = undefined;

        this.initImage();
    }

    destroyIntervals(){
        clearInterval(this._amIStillInFoV_requsetID);
    }

    initImage() {

        this._image = new Image();

        let dirnumber = Math.floor(this._tileno / 10000) * 10000;
        this._texurl = this._baseurl + "/Norder";
        this._texurl += this._order + "/Dir" + dirnumber + "/Npix" + this._tileno + "." + this._format;

        this._image.onload = () => {
            this.imageLoaded();

        };
        this._image.onerror = () => {
            console.error("File not found? {}", this._texurl)
        };

        this._image.setAttribute('crossorigin', 'anonymous');
        this._image.src = this._texurl;

    }

    imageLoaded() {

        this.textureLoaded();
        this.initModelBuffer();
        global.gl.activeTexture(global.gl.TEXTURE0 + this._hipsShaderIndex);
        global.gl.bindTexture(global.gl.TEXTURE_2D, this._texture);
        global.gl.texImage2D(global.gl.TEXTURE_2D, 0, global.gl.RGBA, global.gl.RGBA, global.gl.UNSIGNED_BYTE, this._image);
        this._textureLoaded = true;
        this._ready = true;

    }



    textureLoaded() {

        hipsShaderProgram.enableProgram();

        this._texture = global.gl.createTexture();
        global.gl.activeTexture(global.gl.TEXTURE0 + this._hipsShaderIndex);
        global.gl.pixelStorei(global.gl.UNPACK_FLIP_Y_WEBGL, true);
        global.gl.bindTexture(global.gl.TEXTURE_2D, this._texture);

        // from WW
        global.gl.texParameteri(global.gl.TEXTURE_2D, global.gl.TEXTURE_WRAP_S, global.gl.CLAMP_TO_EDGE);
        global.gl.texParameteri(global.gl.TEXTURE_2D, global.gl.TEXTURE_WRAP_T, global.gl.CLAMP_TO_EDGE);
        
        // global.gl.texParameteri(global.gl.TEXTURE_2D, global.gl.TEXTURE_WRAP_S, global.gl.CLAMP_TO_BORDER);
        // global.gl.texParameteri(global.gl.TEXTURE_2D, global.gl.TEXTURE_WRAP_T, global.gl.CLAMP_TO_BORDER);

        global.gl.texParameteri(global.gl.TEXTURE_2D, global.gl.TEXTURE_MIN_FILTER, global.gl.LINEAR);
        global.gl.texParameteri(global.gl.TEXTURE_2D, global.gl.TEXTURE_MAG_FILTER, global.gl.LINEAR);

        global.gl.uniform1i(hipsShaderProgram.shaderProgram.samplerUniform, this._hipsShaderIndex);

        if (!global.gl.isTexture(this._texture)) {
            console.log("error in texture");
        }

    }

    initModelBuffer() {

        this.vertexPosition = [];
        this.vertexPositionBuffer = [];
        this.vertexIndices = [];
        this.vertexIndexBuffer = [];

        let reforder = fovHelper.getRefOrder(this._order);

        let orighealpix = global.getHealpix(this._order)
        // let orighealpix = new Healpix(2 ** this._order);
        let origxyf = orighealpix.nest2xyf(this._tileno);

        let orderjump = reforder - this._order;

        // let dxmin = origxyf.ix * Math.pow(2, orderjump);
        // let dxmax = (origxyf.ix * Math.pow(2, orderjump)) + Math.pow(2, orderjump);
        // let dymin = origxyf.iy * Math.pow(2, orderjump);
        // let dymax = (origxyf.iy * Math.pow(2, orderjump)) + Math.pow(2, orderjump);

        let dxmin = origxyf.ix << orderjump;
        let dxmax = (origxyf.ix << orderjump) + (1 << orderjump);
        let dymin = origxyf.iy << orderjump;
        let dymax = (origxyf.iy << orderjump) + (1 << orderjump);

        let healpix = global.getHealpix(reforder)
        // let healpix = new Healpix(2 ** reforder);

        this._pixels = [];
        // this.setupPositionAndTexture4Quadrant2(dxmin, dxmax / 2, dymin, dymax / 2, 0, healpix, orderjump, origxyf);
        // this.setupPositionAndTexture4Quadrant2(dxmax / 2, dxmax, dymin, dymax / 2, 1, healpix, orderjump, origxyf);
        // this.setupPositionAndTexture4Quadrant2(dxmin, dxmax / 2, dymax / 2, dymax, 2, healpix, orderjump, origxyf);
        // this.setupPositionAndTexture4Quadrant2(dxmax / 2, dxmax, dymax / 2, dymax, 3, healpix, orderjump, origxyf);

        this.setupPositionAndTexture4Quadrant(dxmin, dxmax / 2, dymin, dymax / 2, 0, healpix, orderjump, origxyf);
        this.setupPositionAndTexture4Quadrant(dxmax / 2, dxmax, dymin, dymax / 2, 1, healpix, orderjump, origxyf);
        this.setupPositionAndTexture4Quadrant(dxmin, dxmax / 2, dymax / 2, dymax, 2, healpix, orderjump, origxyf);
        this.setupPositionAndTexture4Quadrant(dxmax / 2, dxmax, dymax / 2, dymax, 3, healpix, orderjump, origxyf);

        // let pixelsXQuadrant = this._pixels.length / 4;
        let pixelsXQuadrant = this.vertexPosition[0].length / 20;
        this.vertexIndices = this.computeVertexIndices(pixelsXQuadrant);
        this.vertexIndexBuffer = global.gl.createBuffer();
        global.gl.bindBuffer(global.gl.ELEMENT_ARRAY_BUFFER, this.vertexIndexBuffer);
        global.gl.bufferData(global.gl.ELEMENT_ARRAY_BUFFER, this.vertexIndices, global.gl.STATIC_DRAW);

        // global.gl.activeTexture(global.gl.TEXTURE0 + this._hipsShaderIndex);
        // global.gl.bindTexture(global.gl.TEXTURE_2D, this._texture);
        // global.gl.texImage2D(global.gl.TEXTURE_2D, 0, global.gl.RGBA, global.gl.RGBA, global.gl.UNSIGNED_BYTE, this._image);
        // this._textureLoaded = true;

    }



    computeVertexIndices(pixelsXQuadrant) {
        let vertexIndices = new Uint16Array(6 * pixelsXQuadrant);
        let baseFaceIndex = 0;
        for (let j = 0; j < pixelsXQuadrant; j++) {

            vertexIndices[6 * j] = baseFaceIndex;
            vertexIndices[6 * j + 1] = baseFaceIndex + 1;
            vertexIndices[6 * j + 2] = baseFaceIndex + 2;

            vertexIndices[6 * j + 3] = baseFaceIndex + 2;
            vertexIndices[6 * j + 4] = baseFaceIndex + 3;
            vertexIndices[6 * j + 5] = baseFaceIndex;

            baseFaceIndex = baseFaceIndex + 4;

        }
        return vertexIndices;
    }

    setupPositionAndTexture4Quadrant2(dxmin, dxmax, dymin, dymax, qidx, healpix, orderjump, origxyf) {

        let facesVec3Array = new Array();
        this.vertexPosition[qidx] = new Float32Array(20 * (dxmax - dxmin) * (dymax - dymin));

        let step = 1 / (1 << orderjump);
        let uindex = 0;
        let vindex = 0;
        let p = 0;

        for (let dx = dxmin; dx < dxmax; dx++) {
            for (let dy = dymin; dy < dymax; dy++) {
                // let ipix3 = healpix.xyf2nest(dx, dy, origxyf.face);
                // this._pixels.push(ipix3);
                // facesVec3Array = healpix.getBoundaries(ipix3)

                facesVec3Array = healpix.getPointsForXyfNoStep(dx, dy, origxyf.face);
                // let xyf = healpix.nest2xyf(ipix3);
                // uindex = xyf.iy - origxyf.iy * Math.pow(2, orderjump);
                // vindex = xyf.ix - origxyf.ix * Math.pow(2, orderjump);
                uindex = dy - (origxyf.iy << orderjump);
                vindex = dx - (origxyf.ix << orderjump);

                // uindex = xyf.iy - (origxyf.iy << orderjump);
                // vindex = xyf.ix - (origxyf.ix << orderjump);

                this.vertexPosition[qidx][20 * p] = facesVec3Array[0].x;
                this.vertexPosition[qidx][20 * p + 1] = facesVec3Array[0].y;
                this.vertexPosition[qidx][20 * p + 2] = facesVec3Array[0].z;
                this.vertexPosition[qidx][20 * p + 3] = step + (step * uindex);
                this.vertexPosition[qidx][20 * p + 4] = 1 - (step + step * vindex);

                this.vertexPosition[qidx][20 * p + 5] = facesVec3Array[1].x;
                this.vertexPosition[qidx][20 * p + 6] = facesVec3Array[1].y;
                this.vertexPosition[qidx][20 * p + 7] = facesVec3Array[1].z;
                this.vertexPosition[qidx][20 * p + 8] = step + (step * uindex);
                this.vertexPosition[qidx][20 * p + 9] = 1 - (step * vindex);

                this.vertexPosition[qidx][20 * p + 10] = facesVec3Array[2].x;
                this.vertexPosition[qidx][20 * p + 11] = facesVec3Array[2].y;
                this.vertexPosition[qidx][20 * p + 12] = facesVec3Array[2].z;
                this.vertexPosition[qidx][20 * p + 13] = step * uindex;
                this.vertexPosition[qidx][20 * p + 14] = 1 - (step * vindex);

                this.vertexPosition[qidx][20 * p + 15] = facesVec3Array[3].x;
                this.vertexPosition[qidx][20 * p + 16] = facesVec3Array[3].y;
                this.vertexPosition[qidx][20 * p + 17] = facesVec3Array[3].z;
                this.vertexPosition[qidx][20 * p + 18] = step * uindex;
                this.vertexPosition[qidx][20 * p + 19] = 1 - (step + step * vindex);
                p++;
            }
        }

        this.vertexPositionBuffer[qidx] = global.gl.createBuffer();
        global.gl.bindBuffer(global.gl.ARRAY_BUFFER, this.vertexPositionBuffer[qidx]);
        global.gl.bufferData(global.gl.ARRAY_BUFFER, this.vertexPosition[qidx], global.gl.STATIC_DRAW);

    }


    setupPositionAndTexture4Quadrant(dxmin, dxmax, dymin, dymax, qidx, healpix, orderjump, origxyf) {

        let facesVec3Array = new Array();
        this.vertexPosition[qidx] = new Float32Array(20 * (dxmax - dxmin) * (dymax - dymin));

        let step = 1 / (1 << orderjump);
        let uindex = 0;
        let vindex = 0;
        let p = 0;

        for (let dx = dxmin; dx < dxmax; dx++) {
            for (let dy = dymin; dy < dymax; dy++) {
                let ipix3 = healpix.xyf2nest(dx, dy, origxyf.face);
                this._pixels.push(ipix3);

                facesVec3Array = healpix.getBoundaries(ipix3);
                // let xyf = healpix.nest2xyf(ipix3);
                // uindex = xyf.iy - origxyf.iy * Math.pow(2, orderjump);
                // vindex = xyf.ix - origxyf.ix * Math.pow(2, orderjump);
                uindex = dy - (origxyf.iy << orderjump);
                vindex = dx - (origxyf.ix << orderjump);

                // uindex = xyf.iy - (origxyf.iy << orderjump);
                // vindex = xyf.ix - (origxyf.ix << orderjump);

                this.vertexPosition[qidx][20 * p] = facesVec3Array[0].x;
                this.vertexPosition[qidx][20 * p + 1] = facesVec3Array[0].y;
                this.vertexPosition[qidx][20 * p + 2] = facesVec3Array[0].z;
                this.vertexPosition[qidx][20 * p + 3] = step + (step * uindex);
                this.vertexPosition[qidx][20 * p + 4] = 1 - (step + step * vindex);

                this.vertexPosition[qidx][20 * p + 5] = facesVec3Array[1].x;
                this.vertexPosition[qidx][20 * p + 6] = facesVec3Array[1].y;
                this.vertexPosition[qidx][20 * p + 7] = facesVec3Array[1].z;
                this.vertexPosition[qidx][20 * p + 8] = step + (step * uindex);
                this.vertexPosition[qidx][20 * p + 9] = 1 - (step * vindex);

                this.vertexPosition[qidx][20 * p + 10] = facesVec3Array[2].x;
                this.vertexPosition[qidx][20 * p + 11] = facesVec3Array[2].y;
                this.vertexPosition[qidx][20 * p + 12] = facesVec3Array[2].z;
                this.vertexPosition[qidx][20 * p + 13] = step * uindex;
                this.vertexPosition[qidx][20 * p + 14] = 1 - (step * vindex);

                this.vertexPosition[qidx][20 * p + 15] = facesVec3Array[3].x;
                this.vertexPosition[qidx][20 * p + 16] = facesVec3Array[3].y;
                this.vertexPosition[qidx][20 * p + 17] = facesVec3Array[3].z;
                this.vertexPosition[qidx][20 * p + 18] = step * uindex;
                this.vertexPosition[qidx][20 * p + 19] = 1 - (step + step * vindex);
                p++;
            }
        }

        this.vertexPositionBuffer[qidx] = global.gl.createBuffer();
        global.gl.bindBuffer(global.gl.ARRAY_BUFFER, this.vertexPositionBuffer[qidx]);
        global.gl.bufferData(global.gl.ARRAY_BUFFER, this.vertexPosition[qidx], global.gl.STATIC_DRAW);

    }

    loadImage() {

        let _self = this;
        if (this._format == 'fits') {
            let hp = new HiPSProjection();
            hp.initFromFile(_self._texurl).then((res) => {
                if (res !== undefined && res.data !== undefined) {
                    let canvas2d = new Canvas2D(res.data, res.header, res.outproj);
                    _self._image.src = canvas2d.getBrowseImage();

                }

            }).catch(function (err) {
                console.log("[Tile.js] FITS " + err);
            });
        } else {
            this._image.src = this._texurl;
        }

    }


    draw(visibleOrder, visibleTilesMap, pMatrix, vMatrix, mMatrix, colorMapIdx) {

        if (!this._ready) {
            return false;
        }

        let quadrantsToDraw = new Set([0, 1, 2, 3]);
        if (visibleOrder > this._order) {
            quadrantsToDraw = this.drawChildren(visibleOrder, visibleTilesMap, pMatrix, vMatrix, mMatrix, colorMapIdx);
        }

        hipsShaderProgram.enableShaders(pMatrix, vMatrix, mMatrix, colorMapIdx);
        // TODO check if the enable below can be moved into hipsShaderProgram.enableShaders
        global.gl.enableVertexAttribArray(hipsShaderProgram.locations.vertexPositionAttribute);
        global.gl.enableVertexAttribArray(hipsShaderProgram.locations.textureCoordAttribute);

        global.gl.activeTexture(global.gl.TEXTURE0 + this._hipsShaderIndex);
        global.gl.bindTexture(global.gl.TEXTURE_2D, this._texture);
        global.gl.uniform1f(hipsShaderProgram.locations.textureAlpha, this.opacity);

        global.gl.bindBuffer(global.gl.ELEMENT_ARRAY_BUFFER, this.vertexIndexBuffer);
        let elemno = this.vertexIndices.length;

        quadrantsToDraw.forEach((qidx) => {
            global.gl.bindBuffer(global.gl.ARRAY_BUFFER, this.vertexPositionBuffer[qidx]);

            global.gl.vertexAttribPointer(hipsShaderProgram.locations.vertexPositionAttribute, 3, global.gl.FLOAT, false, 5 * 4, 0);
            global.gl.vertexAttribPointer(hipsShaderProgram.locations.textureCoordAttribute, 2, global.gl.FLOAT, false, 5 * 4, 3 * 4);

            global.gl.drawElements(global.gl.TRIANGLES, elemno, global.gl.UNSIGNED_SHORT, 0);
        });


        global.gl.disableVertexAttribArray(hipsShaderProgram.locations.vertexPositionAttribute);
        global.gl.disableVertexAttribArray(hipsShaderProgram.locations.textureCoordAttribute);
        
    }


    drawChildren(visibleOrder, visibleTilesMap, pMatrix, vMatrix, mMatrix, colorMapIdx) {

        let quadrantsToDraw = new Set([0, 1, 2, 3]);
        let childrenOrder = this._order + 1;
        if (!visibleTilesMap.has(childrenOrder)) {
            return;
        }
        for (let c = 0; c < 4; c++) {
            let childTileNo = (this._tileno << 2) + c;
            if (visibleTilesMap.get(childrenOrder).includes(childTileNo)) {
                let childTile = undefined
                if (this._isGalacticHips){
                    childTile = newTileBuffer.getGalTile(childTileNo, childrenOrder, this._hips);
                } else {
                    childTile = newTileBuffer.getTile(childTileNo, childrenOrder, this._hips);
                }
                childTile.draw(visibleOrder, visibleTilesMap, pMatrix, vMatrix, mMatrix, colorMapIdx);
                if (childTile._ready) {
                    quadrantsToDraw.delete(childTile._tileno - (this._tileno << 2));
                }

            }
        }
        return quadrantsToDraw;
    }

}

export default AncestorTile;