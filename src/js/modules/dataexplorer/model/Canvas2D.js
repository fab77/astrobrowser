"use strict";
/**
 * Summary. (bla bla bla)
 *
 * Description. (bla bla bla)
 * 
 * @link   github https://github.com/fab77/wcslight
 * @author Fabrizio Giordano <fabriziogiordano77@gmail.com>
 */

import ColorMaps from './ColorMaps.js';
import pkg from 'canvas';
const { createCanvas } = pkg;
import fs from 'fs';
import { ParseUtils } from 'jsfitsio';

class Canvas2D {

    _imgData;
    _physicalvalues;
    _width;
    _height;
    _min;
    _max;
    _currmin;
    _currmax;
    _colormap;
    _tfunction;
    _projection;
    _canvas;

    /**
     * 
     * @param {*} pvmin minimum phisical value
     * @param {*} pvmax maximum phisical value
     * @param {*} data [] of [] of decimal values
     */
    constructor(pixelvalues, fitsheader, projection, tfunction = "linear", colormap = "grayscale", inverse = false) {

        // initial settings use to reset the image to its initial status
        this._orig_tfunction = tfunction;
        this._orig_colormap = colormap;
        this._orig_inverse = inverse;
        this._orig_min = fitsheader[0].get("DATAMIN");
        this._orig_max = fitsheader[0].get("DATAMAX");

        this._currmin = this._orig_min;
        this._currmax = this._orig_max;

        this._bzero = fitsheader[0].get("BZERO") || 0.0;
        this._bscale = fitsheader[0].get("BSCALE") || 1.0;
        this._blank = fitsheader[0].get("BLANK");
        this._bitpix = fitsheader[0].get("BITPIX");

        let bytesXelem = Math.abs(this._bitpix / 8);
        // this._width = pixelvalues[0].length / bytesXelem;
        this._width = pixelvalues.get(0)[0].length  / bytesXelem;
        
        // this._height = pixelvalues.length;
        this._height = pixelvalues.get(0).length;

        this._physicalvalues = [];
        // this._pixelvalues = pixelvalues;
        this._pixelvalues = pixelvalues.get(0);
        this._RGBvalues = [];

        this._inverse = inverse;

        this._tfunction = tfunction;
        this._colormap = colormap;

        this._projection = projection;

        this.initRGBImage();
        this.process();
        this.normalize();
        this.applyColorAndTransferFunction();
    }

    initRGBImage() {
        /** https://flaviocopes.com/canvas-node-generate-image/ */
        let width = this._width;
        let height = this._height;
        this._canvas = createCanvas(width, height)
        this._canvasCtx = this._canvas.getContext('2d')

        this._imgData = this._canvasCtx.createImageData(this._canvas.width, this._canvas.height);

    }

    normalize() {

        // let minMaxRange = this._origmax - this._origmin;
        let minMaxRange = this._currmax - this._currmin;
        this._normvalues = [];

        for (let j = 0; j < this._height; j++) {
            this._normvalues[j] = new Array(this._width);
            for (let i = 0; i < this._width; i++) {
                // this._normvalues[j][i] = (this._physicalvalues[j][i] - this._origmin) / minMaxRange;
                this._normvalues[j][i] = (this._physicalvalues[j][i] - this._currmin) / minMaxRange;
            }
        }
    }

    applyColorAndTransferFunction() {
        let rgbval;
        let values = [];

        // this._currmin = this.appylyTransferFunction2Val(this._normvalues[0][0]);
        // this._currmax = this._currmin;

        this._currmin = NaN;
        this._currmax = NaN;

        for (let j = 0; j < this._height; j++) {
            values[j] = new Array(this._width);
            for (let i = 0; i < this._width; i++) {
                values[j][i] = this.appylyTransferFunction2Val(this._normvalues[j][i]);
                if (!isNaN(values[j][i])) {
                    if (isNaN(this._currmin) || values[j][i] < this._currmin) {
                        this._currmin = values[j][i];
                    }
                    if (isNaN(this._currmax) || values[j][i] > this._currmax) {
                        this._currmax = values[j][i];
                    }
                }
            }
        }

        for (let j = 0; j < this._height; j++) {
            for (let i = 0; i < this._width; i++) {

                rgbval = this.colorPixel(values[j][i]);
                let rgbpos = ((this._width - j) * this._width + i) * 4;
                this._imgData.data[rgbpos] = rgbval.r;
                this._imgData.data[rgbpos + 1] = rgbval.g;
                this._imgData.data[rgbpos + 2] = rgbval.b;
                this._imgData.data[rgbpos + 3] = 0xff; // alpha
            }

        }
        this._canvasCtx.putImageData(this._imgData, 0, 0);
    }
    /**
     * function to be called after minmax or transfer function has changed to update the 
     * this._processedData containing pixels values
     */
    process() {

        this._physicalvalues = new Array(this._height);
        let bytesXelem = Math.abs(this._bitpix / 8);

        // this._currmin = this.appylyTransferFunction2Val(this._currmin);
        // this._currmax = this.appylyTransferFunction2Val(this._currmax);

        // this._origmin = undefined;
        // this._origmax = undefined;

        for (let j = 0; j < this._height; j++) {
            this._physicalvalues[j] = new Array(this._width);
            for (let i = 0; i < this._width; i++) {
                let val;
                // let rgbval;
                let pixval = ParseUtils.extractPixelValue(0, this._pixelvalues[j].slice(i * bytesXelem, (i + 1) * bytesXelem), this._bitpix);

                // let rgbpos = ( (this._width - j) * this._width + i ) * 4;


                if (this._blank !== undefined && pixval === this._blank) {
                    val = NaN;
                    // rgbval = NaN;
                } else {

                    val = this.pixel2Physical(pixval);
                    this._physicalvalues[j][i] = val;
                    if (this._orig_min === undefined || val < this._orig_min) {
                        this._orig_min = val;
                    }
                    if (this._orig_max === undefined || val > this._orig_max) {
                        this._orig_max = val;
                    }

                    // let tfval = this.appylyTransferFunction2Val(val);
                    // rgbval = this.colorPixel(tfval);

                }

                // this._imgData.data[rgbpos] = rgbval.r;
                // this._imgData.data[rgbpos+1] = rgbval.g;
                // this._imgData.data[rgbpos+2] = rgbval.b;
                // this._imgData.data[rgbpos+3] = 0xff; // alpha

            }
        }
        // this._canvasCtx.putImageData(this._imgData, 0, 0);
        this._currmin = this._orig_min;
        this._currmax = this._orig_max;
    }

    pixel2Physical(value) {
        let pval = this._bzero + this._bscale * value;
        return pval;
    }

    getBrowseImage() {
        return this._canvas.toDataURL();
    }

    reset() {

        this._tfunction = this._orig_tfunction;
        this._colormap = this._orig_colormap;
        this._inverse = this._orig_inverse;
        this._currmin = this._orig_min;
        this._currmax = this._orig_max;
        this.process();

    }

    appylyTransferFunction2Val(val) {
        if (this._tfunction == "linear") {
            return val;
        } else if (this._tfunction == "log") {
            if (val > 0) {
                return Math.log(val);
            }
        } else if (this._tfunction == "sqrt") {
            if (val > 0) {
                return Math.sqrt(val);
            }
        }
        return NaN;
    }

    appylyTransferFunction(tfunction) {
        this._tfunction = tfunction;
        let f;

        if (this._tfunction == 'linear') {
            f = function linearval(inval) { return inval };
        } else if (this._tfunction == 'log') {
            f = Math.log;
        } else if (this._tfunction == 'sqrt') {
            f = Math.sqrt;
        }
        // else {
        //     throw new TransferFunctionNotDefined(tFunction);
        // }
        this.initRGBImage();
        this._currmin = f(this._currmin);
        // TODO check the case when in log and val are < 0
        if (this._currmin === NaN) {
            this._currmin = 0;
        }
        this._currmax = f(this._currmax);
        let val;
        let rgbval;
        for (let j = 0; j < this._height; j++) {

            for (let i = 0; i < this._width; i++) {

                let rgbpos = ((this._width - j) * this._width + i) * 4;
                if (this._blank !== undefined && pixval === this._blank) {
                    val = NaN;
                    rgbval = NaN;
                } else {
                    val = this._physicalvalues[j][i];;
                    val = f(val);

                    rgbval = this.colorPixel(val);

                }
                this._physicalvalues[j][i] = val;
                this._imgData.data[rgbpos] = rgbval.r;
                this._imgData.data[rgbpos + 1] = rgbval.g;
                this._imgData.data[rgbpos + 2] = rgbval.b;
                this._imgData.data[rgbpos + 3] = 0xff; // alpha

            }
        }

        this._canvasCtx.putImageData(this._imgData, 0, 0);

    }

    setInverseColorMap(inverted) {
        this._inverse = inverted;
    }

    setColorMap(cmap) {

        if (cmap == "grayscale") {
            this._colormap = "grayscale";
        } else if (cmap == "planck") {
            this._colormap = "planck";
        } else if (cmap == "eosb") {
            this._colormap = "eosb";
        } else if (cmap == "rainbow") {
            this._colormap = "rainbow";
        } else if (cmap == "cmb") {
            this._colormap = "cmb";
        } else if (cmap == "cubehelix") {
            this._colormap = "cubehelix";
        }
        //  else {
        //     throw new ColorMapNotDefined(cmap);
        // }
    }

    setTransferFunction(tFunction) {

        if (tFunction == "linear") {
            this._tfunction = "linear";
        } else if (tFunction == "log") {
            this._tfunction = "log";
        } else if (tFunction == "sqrt") {
            this._tfunction = "sqrt";
        }
        // else {
        //     throw new TransferFunctionNotDefined(tFunction);
        // }

    }



    writeToFile(path, filename) {
        const buffer = this._canvas.toBuffer('image/png');
        fs.writeFileSync(path + '/' + filename + '.png', buffer);
    }

    colorPixel(v) {

        if (isNaN(v)) {
            if (this._inverse) {
                return {
                    r: 255,
                    g: 255,
                    b: 255
                };
            }
            return {
                r: 0,
                g: 0,
                b: 0
            };
        }

        // // TODO Check that. Probably better to use normalized values on [0, 1]
        // // and this._currentpvmin and this._currentpvmax
        // if ( v < 0 ) v = -v;
        let colormap_idx = ((v - this._currmin) / (this._currmax - this._currmin)) * 256;


        let idx = Math.round(colormap_idx);

        // if (idx<0){
        // 	idx = -idx;
        // }

        if (this._colormap == 'grayscale') {
            if (this._inverse) {
                return {
                    r: (255 - idx),
                    g: (255 - idx),
                    b: (255 - idx)
                };
            }

            return {
                r: idx,
                g: idx,
                b: idx
            };
        } else {
            let colorMap = ColorMaps[this._colormap];
            if (this._inverse) {
                return {
                    r: (255 - colorMap.r[idx]),
                    g: (255 - colorMap.g[idx]),
                    b: (255 - colorMap.b[idx])
                };
            }

            return {
                r: colorMap.r[idx],
                g: colorMap.g[idx],
                b: colorMap.b[idx]
            };
        }

    }

    getValueByRaDec(ra, dec) {
        let [i, j] = this._projection.world2pix(ra, dec);
        return this.getValueByPixelCoords(i, j);
    }

    getValueByPixelCoords(i, j) {
        let [cx, cy] = this.ij2canvasxy(i, j);
        return this.getValueByCanvasCoords(cx, cy);
    }

    getValueByCanvasCoords(cx, cy) {
        return this._physicalvalues[cy][cx];
    }

    getRaDecByCanvasCoords(cx, cy) {
        // let [i, j] = this.canvasxy2ij(cx, cy);
        // return this.getRaDecByPixelCoords(i, j);
        let i = cx;
        let j = cy;
        return this._projection.pix2world(i, j);
    }

    getRaDecByPixelCoords(i, j) {
        let [ra, dec] = this._projection.pix2world(i, j);
        return [ra, dec];
    }



}

export default Canvas2D;