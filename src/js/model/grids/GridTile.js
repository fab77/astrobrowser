// "use strict";
// /**
//  * @author Fabrizio Giordano (Fab77)
//  */

//  import Healpix from "../../../../../healpixjs/src/Healpix.js";
//  import global from '../../Global.js';
//  import RayPickingUtils from '../../utils/RayPickingUtils.js';
//  import { Pointing, Vec3 } from '../../../../../healpixjs/src/Healpix.js';
//  import HiPSProjection from "../../../../../wcslight/src/projections/HiPSProjection.js";
// import ColorMaps from "../../modules/dataexplorer/model/ColorMaps.js";
// import Canvas2D from "../../modules/dataexplorer/model/Canvas2D.js";

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
// class GridTile {

//     constructor (tileno, descriptor, format, order, shaderprogram, tilebuffer, hips, samplerIdx) {


//         Tile.MIN_REFORDER = 4;
//         Tile.MAX_REFORDER = 7;
        
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

        
//         this._isVisible = true;
//         this._isActive = true;
//         this._shaderprogram = shaderprogram;

//         this.opacity = 1.00 * 100.0/100.0;
//         // this.opacity = 0.5;
        
//         this._hipsShaderIndex = samplerIdx; // <== used for multi hips 
//         // this._hipsShaderIndex = 0;
//         this._pixels = [];

//         this._texture = undefined;
        
//         this.initModelBuffer(); // <-- slow! transform in promise or callback

//         this.initTextureBuffer(); // <-- slow! transform in promise or callback

//         this.initIndexBuffer();

//         this._downloading = false;
//         this._imageLoaded = false;
        
//         this.initImage();

//         this.loadTexture3();

//         // this.loadTexture2();
        
//         if (this._order != 0 ) {
//             setTimeout(this.amIStillInFoV(), 3000);
//         }
        

//     }


//     textureLoaded(image) {
            
//         global.gl.useProgram(this._shaderprogram);

//         this._texture = global.gl.createTexture();
        
//         global.gl.activeTexture(global.gl.TEXTURE0+this._hipsShaderIndex);
        
//         global.gl.pixelStorei(global.gl.UNPACK_FLIP_Y_WEBGL, true);
//         // global.gl.pixelStorei(global.gl.UNPACK_FLIP_Y_WEBGL, false);
        
//         global.gl.bindTexture(global.gl.TEXTURE_2D, this._texture);

//         global.gl.texImage2D(global.gl.TEXTURE_2D, 0, global.gl.RGBA, global.gl.RGBA, global.gl.UNSIGNED_BYTE, image);
        
//         global.gl.texParameteri(global.gl.TEXTURE_2D, global.gl.TEXTURE_WRAP_S, global.gl.CLAMP_TO_EDGE);
//         global.gl.texParameteri(global.gl.TEXTURE_2D, global.gl.TEXTURE_WRAP_T, global.gl.CLAMP_TO_EDGE);
            
//         if (this._order < Tile.MAX_REFORDER) {
//             global.gl.texParameteri(global.gl.TEXTURE_2D, global.gl.TEXTURE_MIN_FILTER, global.gl.LINEAR);
//         } else {
//             global.gl.generateMipmap(global.gl.TEXTURE_2D);
//             // TODO check which mipmap filtering is better. The one active or the commented alternative
//             global.gl.texParameteri(global.gl.TEXTURE_2D, global.gl.TEXTURE_MIN_FILTER, global.gl.LINEAR_MIPMAP_NEAREST);
//             // global.gl.texParameteri(global.gl.TEXTURE_2D, global.gl.TEXTURE_MIN_FILTER, global.gl.LINEAR_MIPMAP_LINEAR);
//             //	DO NOT DELETE _self.in_gl.texParameteri(_self.in_gl.TEXTURE_2D, _self.in_gl.TEXTURE_MAG_FILTER, _self.in_gl.NEAREST);
//             //	DO NOT DELETE _self.in_gl.texParameteri(_self.in_gl.TEXTURE_2D, _self.in_gl.TEXTURE_MIN_FILTER, _self.in_gl.NEAREST);
//         }

//         global.gl.uniform1i(this._shaderprogram.samplerUniform, this._hipsShaderIndex);

//         if (!global.gl.isTexture(this._texture)){
//             console.log("error in texture");
//         }

//         global.gl.bindTexture(global.gl.TEXTURE_2D, null);          

//         let parentno = this._tileno >> 2;

//         if (this._order > 0) {
//             let parentorder = this._order - 1;
//             this._tilebuffer.childLoaded(parentno, parentorder, this._tileno);
//         }
//         // console.log("["+this._tileno + "] Texuture applied to GL");
//         // this._tilesList.set(this._order + "#" + this._tileno, this);
//     }

//     amIStillInFoV() {
//         var _self = this;
//         this._poller = setInterval(function() {

//             if ( _self._hips.getCurrentHealpixOrder() != _self._order) {
//                 clearInterval(_self._poller);
//                 _self._tilebuffer.purgeTile(_self._order+"#"+_self._tileno);
//             } else {
//                 let geomhealpix = new Healpix(Math.pow(2, _self._order));
//                 let pixels = [];
//                 let maxX = global.gl.canvas.width;
//                 let maxY = global.gl.canvas.height;
    
//                 let xy = [];
//                 let neighbours = [];
//                 let intersectionWithModel;
//                 let intersectionPoint = null;
//                 let currP, currPixNo;
            
//                 var i = 0;
//                 for (i =0; i <= maxX; i+=maxX/10){
//                     var j = 0;
//                     for (j =0; j <= maxY; j+=maxY/10){
                        
//                         intersectionWithModel = {
//                                 "intersectionPoint": null,
//                                 "pickedObject": null
//                             };
                        
//                         xy = [i,j];
    
                        
//                         intersectionWithModel = RayPickingUtils.getIntersectionPointWithSingleModel(xy[0], xy[1], _self._hips);
//                         intersectionPoint = intersectionWithModel.intersectionPoint;
    
//                         if (intersectionPoint.length > 0){
//                             currP = new Pointing(new Vec3(intersectionPoint[0], intersectionPoint[1], intersectionPoint[2]));
    
//                             currPixNo = geomhealpix.ang2pix(currP);
//                             if (currPixNo >= 0){
//                                 neighbours = geomhealpix.neighbours(currPixNo);
//                                 if (pixels.indexOf(currPixNo) == -1){
//                                     pixels.push(currPixNo);
//                                 }
//                                 var k = 0;
//                                 for (k=0; k<neighbours.length; k++){
//                                     if (pixels.indexOf(neighbours[k]) == -1){
//                                         if(neighbours[k] >= 0){
//                                             pixels.push(neighbours[k]);	
//                                         }
//                                     }
//                                 }	
//                             }
//                         }
//                     }
    
//                 }
    
//                 if (!pixels.includes(_self._tileno)) {
//                     // TODO CALL clearInterval somewhere!!!!!
//                     clearInterval(_self._poller);
//                     _self._tilebuffer.purgeTile(_self._order+"#"+_self._tileno);
//                 }
//             }

            
//         }, 3000);

//     }

//     addChild(childTileno) {
//         this._children.add(childTileno);
//         if (this._children.size == 4 && this._order != 0) {
//             clearInterval(this._poller);
//             this._tilebuffer.purgeTile(this._order+"#"+this._tileno);
//         }
//     }

//     initModelBuffer () {
		
		
// 		let facesVec3Array  = new Array();
//         this._pixels = [];
//         let healpix;

//         if (this._order < Tile.MAX_REFORDER) {
//             // UNCOMMENT this - only test
//             // healpix = new Healpix(Math.pow(2, Tile.REFORDER));

//             let reforder = (this._order < Tile.MIN_REFORDER) ? Tile.MIN_REFORDER : this._order+1;
//             healpix = new Healpix(Math.pow(2, reforder));
            
//         } else {
//             healpix = new Healpix(Math.pow(2, this._order));
//         }
        
// 		if (this._order < Tile.MAX_REFORDER){

//             let orighealpix = new Healpix(Math.pow(2, this._order));
//             let xyf = orighealpix.nest2xyf(this._tileno);
            
//             // UNCOMMENT this - only test
//             // let healpix3 = new Healpix(Math.pow(2, Tile.REFORDER));
//             // let orderjump = Tile.REFORDER - this._order;
//             let reforder = (this._order < Tile.MIN_REFORDER) ? Tile.MIN_REFORDER : this._order+1;
//             let healpix3 = new Healpix(Math.pow(2, reforder));
//             let orderjump = reforder - this._order;
            
//             for (let dx = xyf.ix * Math.pow(2, orderjump); dx < (xyf.ix * Math.pow(2, orderjump)) + Math.pow(2, orderjump); dx++) {
//                 for (let dy = xyf.iy * Math.pow(2, orderjump); dy < (xyf.iy * Math.pow(2, orderjump)) + Math.pow(2, orderjump); dy++) {
//                     let ipix3 = healpix3.xyf2nest(dx, dy, xyf.face);
//                     this._pixels.push(ipix3);
//                 }
//             }
            
//         } else {
            
//             this._pixels.push(this._tileno);
            
//         }

//         this.vertexPosition = new Float32Array(12*this._pixels.length);

//         for (let p = 0; p < this._pixels.length; p++) {
//             facesVec3Array = healpix.getBoundaries(this._pixels[p]);
//             // let xyf = healpix.nest2xyf(this._pixels[p]);

//             this.vertexPosition[12*p] = facesVec3Array[0].x ;
//             this.vertexPosition[12*p+1] = facesVec3Array[0].y;
//             this.vertexPosition[12*p+2] = facesVec3Array[0].z;
            
//             this.vertexPosition[12*p+3] = facesVec3Array[1].x;
//             this.vertexPosition[12*p+4] = facesVec3Array[1].y;
//             this.vertexPosition[12*p+5] = facesVec3Array[1].z;
            
//             this.vertexPosition[12*p+6] = facesVec3Array[2].x;
//             this.vertexPosition[12*p+7] = facesVec3Array[2].y;
//             this.vertexPosition[12*p+8] = facesVec3Array[2].z;
            
//             this.vertexPosition[12*p+9] = facesVec3Array[3].x;
//             this.vertexPosition[12*p+10] = facesVec3Array[3].y;
//             this.vertexPosition[12*p+11] = facesVec3Array[3].z;
//         }

// 		this.vertexPositionBuffer = global.gl.createBuffer();
// 		global.gl.bindBuffer(global.gl.ARRAY_BUFFER, this.vertexPositionBuffer);
// 		global.gl.bufferData(global.gl.ARRAY_BUFFER, this.vertexPosition, global.gl.STATIC_DRAW);
// 		this.vertexPositionBuffer.itemSize = 3;
// 		this.vertexPositionBuffer.numItems = this.vertexPosition.length;

// 	}

//     initTextureBuffer() {
//         this.textureCoordinates = new Float32Array(8*this._pixels.length);

//         if (this._order < Tile.MAX_REFORDER) {

//             let orighealpix = new Healpix(Math.pow(2, this._order));
//             let xyforig = orighealpix.nest2xyf(this._tileno);
			
//             // UNCOMMENT this - only test
//             // let healpix3 = new Healpix(Math.pow(2, Tile.REFORDER));
//             // let orderjump = Tile.REFORDER - this._order;
//             let reforder = (this._order < Tile.MIN_REFORDER) ? Tile.MIN_REFORDER : this._order+1;
//             let healpix3 = new Healpix(Math.pow(2, reforder));
//             let orderjump = reforder - this._order;

// 			let step=1/Math.pow(2, orderjump);
//             let uindex = 0;
// 			let vindex = 0;
// 			for (let i=0; i < this._pixels.length; i++){

// 				let xyf = healpix3.nest2xyf(this._pixels[i]); 
				
//                 vindex = xyf.ix - xyforig.ix * Math.pow(2, orderjump); // <= this probably is Math.pow(2, orderjump);
// 				uindex = xyf.iy - xyforig.iy * Math.pow(2, orderjump);

//                 this.textureCoordinates[8*i] = (step + (step * uindex)).toFixed(9);
// 				this.textureCoordinates[8*i+1] = (1 - (step + step * vindex)).toFixed(9);

// 				this.textureCoordinates[8*i+2] = (step + (step * uindex)).toFixed(9);
// 				this.textureCoordinates[8*i+3] = (1 - (step * vindex)).toFixed(9);

// 				this.textureCoordinates[8*i+4] = (step * uindex).toFixed(9);
// 				this.textureCoordinates[8*i+5] = (1 - (step * vindex)).toFixed(9);
				
//                 this.textureCoordinates[8*i+6] = (step * uindex).toFixed(9);
// 				this.textureCoordinates[8*i+7] = (1 - (step + step * vindex)).toFixed(9);

// 			}
//         } else if (this._maxorder < this._order ) {
            
//             let orighealpix = new Healpix(Math.pow(2, this._order));
//             let xyforig = orighealpix.nest2xyf(this._tileno);
			
            
//             // let healpix3 = new Healpix(Math.pow(2, this._maxorder));
//             let orderjump = this._order - this._maxorder;
            
//             let step=1/Math.pow(2, orderjump);
//             let uindex = 0;
// 			let vindex = 0;
// 			for (let i=0; i < this._pixels.length; i++){

// 				let xyf = orighealpix.nest2xyf(this._pixels[i]); 
				
//                 vindex = xyf.ix - xyforig.ix * Math.pow(2, orderjump); // <= this probably is Math.pow(2, orderjump);
// 				uindex = xyf.iy - xyforig.iy * Math.pow(2, orderjump);

//                 this.textureCoordinates[8*i] = (step + (step * uindex)).toFixed(9);
// 				this.textureCoordinates[8*i+1] = (1 - (step + step * vindex)).toFixed(9);

// 				this.textureCoordinates[8*i+2] = (step + (step * uindex)).toFixed(9);
// 				this.textureCoordinates[8*i+3] = (1 - (step * vindex)).toFixed(9);

// 				this.textureCoordinates[8*i+4] = (step * uindex).toFixed(9);
// 				this.textureCoordinates[8*i+5] = (1 - (step * vindex)).toFixed(9);
				
//                 this.textureCoordinates[8*i+6] = (step * uindex).toFixed(9);
// 				this.textureCoordinates[8*i+7] = (1 - (step + step * vindex)).toFixed(9);

// 			}

//         } else {
            
//             // UV mapping: 1, 0],[1, 1],[0, 1],[0, 0]
//             this.textureCoordinates[0] = 1.0;
//             this.textureCoordinates[1] = 0.0;
//             this.textureCoordinates[2] = 1.0;
//             this.textureCoordinates[3] = 1.0;
//             this.textureCoordinates[4] = 0.0;
//             this.textureCoordinates[5] = 1.0;
//             this.textureCoordinates[6] = 0.0;
//             this.textureCoordinates[7] = 0.0;

//         }

//         this.vertexTextureCoordBuffer = global.gl.createBuffer();
// 		global.gl.bindBuffer(global.gl.ARRAY_BUFFER, this.vertexTextureCoordBuffer); 
// 		global.gl.bufferData(global.gl.ARRAY_BUFFER, this.textureCoordinates, global.gl.STATIC_DRAW);
// 		this.vertexTextureCoordBuffer.itemSize = 2;
// 		this.vertexTextureCoordBuffer.numItems = this.textureCoordinates.length;

//     }    

//     initIndexBuffer() {
//         let MAX_UNSIGNED_SHORT = 65535;
// 		this.vertexIndices = new Uint16Array(6*this._pixels.length);
// 	    let baseFaceIndex = 0;

//         // let p = 0;
//         // for (let i = 0; i < this._pixels.length; i++) {
//         //     this.vertexIndices[p] = baseFaceIndex;
// 	    // 	this.vertexIndices[++p] = baseFaceIndex + 1;
// 	    // 	this.vertexIndices[++p] = baseFaceIndex + 2;
	    	
// 	    // 	this.vertexIndices[++p] = baseFaceIndex;
// 	    // 	this.vertexIndices[++p] = baseFaceIndex + 2;
// 	    // 	this.vertexIndices[++p] = baseFaceIndex + 3;
	    	
//         //     this.vertexIndices[++p] = MAX_UNSIGNED_SHORT;	
	    	
//         //     baseFaceIndex = baseFaceIndex+4;
	    	
//         //     // p += 8;
//         // }

// 	    for (let j=0; j< this._pixels.length; j++){

// 	    	this.vertexIndices[6*j] = baseFaceIndex;
// 	    	this.vertexIndices[6*j+1] = baseFaceIndex + 1;
// 	    	this.vertexIndices[6*j+2] = baseFaceIndex + 2;
	    	
// 	    	this.vertexIndices[6*j+3] = baseFaceIndex;
// 	    	this.vertexIndices[6*j+4] = baseFaceIndex + 2;
// 	    	this.vertexIndices[6*j+5] = baseFaceIndex + 3;
	    		
// 	    	baseFaceIndex = baseFaceIndex+4;
	    	
// 	    }

// 		this.vertexIndexBuffer = global.gl.createBuffer();
// 	    global.gl.bindBuffer(global.gl.ELEMENT_ARRAY_BUFFER, this.vertexIndexBuffer);
// 	    global.gl.bufferData(global.gl.ELEMENT_ARRAY_BUFFER, this.vertexIndices, global.gl.STATIC_DRAW);
// 	    this.vertexIndexBuffer.itemSize = 1;
// 	    this.vertexIndexBuffer.numItems = this.vertexIndices.length;
// 	}


//     // loadTexture(){
        
//     //     let dirnumber = Math.floor(this._tileno / 10000) * 10000;
//     //     let texurl = this._baseurl+"/Norder"+this._order+"/Dir"+dirnumber+"/Npix"+this._tileno+"."+this._format;

//     //     if (this._format == 'fits') {
//     //         new HiPSProjection(texurl).then( (res) => {
//     //             let canvas = res.canvas2d;
//     //             canvas.process();
//     //             const image = new Image();
//     //             image.src = canvas.getCanvas2DBrowse();
//     //             image.onload = () => {
//     //                 this.textureLoaded(image);
//     //             }
//     //             image.onerror = ()=> {
//     //                 console.log("[Tile.js] Image not loaded");    
//     //             }

//     //         }).catch(function(err){
//     //             console.log("[Tile.js] "+err);
//     //         });
//     //     } else {
//     //         return new Promise(resolve => {
                
//     //             const image = new Image();
//     //             image.addEventListener('load', () => {
//     //                 resolve(image);
//     //             });
//     //             image.setAttribute('crossorigin', 'anonymous');
//     //             image.setAttribute('crossOrigin', 'anonymous');
//     //             image.crossOrigin = "Anonymous";
//     //             image.src = texurl;
                
//     //         });
//     //     }
        
//     // }

//     initImage() {

//         this._image = new Image();
//         this._downloading =  false;

//         let dirnumber = Math.floor(this._tileno / 10000) * 10000;
//         this._texurl = this._baseurl+"/Norder";
//         if (this._maxorder < this._order) {
//             let tileno = this._tileno >> 2;
//             dirnumber = Math.floor(tileno / 10000) * 10000;
//             this._texurl += this._maxorder+"/Dir"+dirnumber+"/Npix"+tileno+"."+this._format;
//         } else {
//             this._texurl += this._order+"/Dir"+dirnumber+"/Npix"+this._tileno+"."+this._format;
//         }

//         this._image.addEventListener('load', () => {
//             // console.log("["+this._tileno + "] Loading done");
//             this.textureLoaded(this._image);
//             this._imageLoaded = true;
//             this._downloading = false;
//         }, false);
//         this._image.addEventListener('error', (err) => {
//             console.log("[Tile.js] Image not loaded", err);
//         }, false);

//         this._image.setAttribute('crossorigin', 'anonymous');
//         this._image.setAttribute('crossOrigin', 'anonymous');
//         this._image.crossOrigin = "Anonymous";
//     }


//     /**
//      * 
//      * @param {ColorMaps} colorMap 
//      */
//     changeColorMap(colorMap) {
//         // TODO
//         this._image;
//     }


//     loadTexture3(){
        
//         var _self = this;
//         if (this._format == 'fits') {
//             new HiPSProjection(_self._texurl).then( (res) => {
//                 // let canvas = res.canvas2d;
//                 // canvas.process();
//                 // _self._image.src = canvas.getCanvas2DBrowse();
//                 if (res !== undefined && res.fitsdata !== undefined) {
//                     let canvas2d =  new Canvas2D(res.fitsdata, res.fitsheader, res.outproj);
//                     _self._image.src = canvas2d.getBrowseImage();
//                     _self._image.onmousedown = function() {
//                         console.log("yuppie");
//                     };
//                 }

//             }).catch(function(err){
//                 console.log("[Tile.js] "+err);
//             });
//         } else {
//             this._image.src = this._texurl;
//             this._image.onmousedown = function() {
//                 console.log("yuppie");
//             };
//         }
        
//     }

//     loadTexture2(){
        
//         let dirnumber = Math.floor(this._tileno / 10000) * 10000;
//         let texurl = this._baseurl+"/Norder";
//         if (this._maxorder < this._order) {
//             let tileno = this._tileno >> 2;
//             dirnumber = Math.floor(tileno / 10000) * 10000;
//             texurl += this._maxorder+"/Dir"+dirnumber+"/Npix"+tileno+"."+this._format;
//         } else {
//             texurl += this._order+"/Dir"+dirnumber+"/Npix"+this._tileno+"."+this._format;
//         }
//         // let texurl = this._baseurl+"/Norder"+this._order+"/Dir"+dirnumber+"/Npix"+this._tileno+"."+this._format;

//         if (this._format == 'fits') {
//             new HiPSProjection(texurl).then( (res) => {
//                 let canvas = res.canvas2d;
//                 canvas.process();
//                 const image = new Image();
//                 image.src = canvas.getCanvas2DBrowse();
//                 image.onload = () => {
//                     this.textureLoaded(image);
//                 }
//                 image.onerror = ()=> {
//                     console.log("[Tile.js] Image not loaded");    
//                 }

//             }).catch(function(err){
//                 console.log("[Tile.js] "+err);
//             });
//         } else {
//             // return new Promise(resolve => {
                
//                 const image = new Image();
//                 image.addEventListener('load', () => {
//                     this.textureLoaded(image);
//                 }, false);
//                 image.setAttribute('crossorigin', 'anonymous');
//                 image.setAttribute('crossOrigin', 'anonymous');
//                 image.crossOrigin = "Anonymous";
//                 image.src = texurl;
                
//             // });
//         }
        
//     }

//     refresh () {
        
//     }

//     enableShader(pMatrix, vMatrix, mMatrix){
        
// 		global.gl.useProgram(this._shaderprogram);
		
// 		this._shaderprogram.pMatrixUniform = global.gl.getUniformLocation(this._shaderprogram, "uPMatrix");
// 		this._shaderprogram.mMatrixUniform = global.gl.getUniformLocation(this._shaderprogram, "uMMatrix");
// 		this._shaderprogram.vMatrixUniform = global.gl.getUniformLocation(this._shaderprogram, "uVMatrix");
// 		this._shaderprogram.samplerUniform = global.gl.getUniformLocation(this._shaderprogram, "uSampler"+this._hipsShaderIndex);
// 		this._shaderprogram.uniformVertexTextureFactor = global.gl.getUniformLocation(this._shaderprogram, "uFactor"+this._hipsShaderIndex);
// 		// this._shaderprogram.sphericalGridEnabledUniform = global.gl.getUniformLocation(this._shaderprogram, "uSphericalGrid");
		
// 		this._shaderprogram.vertexPositionAttribute = global.gl.getAttribLocation(this._shaderprogram, "aVertexPosition");
// 		this._shaderprogram.textureCoordAttribute = global.gl.getAttribLocation(this._shaderprogram, "aTextureCoord");

// 		global.gl.uniform1f(this._shaderprogram.uniformVertexTextureFactor, 1.0);		
// 		global.gl.uniformMatrix4fv(this._shaderprogram.mMatrixUniform, false, mMatrix);
// 		global.gl.uniformMatrix4fv(this._shaderprogram.pMatrixUniform, false, pMatrix);
// 		global.gl.uniformMatrix4fv(this._shaderprogram.vMatrixUniform, false, vMatrix);
		
// 		this.uniformVertexTextureFactorLoc = global.gl.getUniformLocation(this._shaderprogram, "uFactor"+this._hipsShaderIndex);
		
// 		// global.gl.uniform1f(this._shaderprogram.sphericalGridEnabledUniform, 0.0);

		
// 	}

//     // proj, view and model matrices
//     // draw (pMatrix, vMatrix, mMatrix) {

//     //     if (this._texture !== undefined) {
//     //         this.enableShader(pMatrix, vMatrix, mMatrix);

//     //         global.gl.bindBuffer(global.gl.ARRAY_BUFFER, this.vertexPositionBuffer);
//     //         global.gl.vertexAttribPointer(this._shaderprogram.vertexPositionAttribute, this.vertexPositionBuffer.itemSize, global.gl.FLOAT, false, 0, 0);
            
//     //         global.gl.bindBuffer(global.gl.ARRAY_BUFFER, this.vertexTextureCoordBuffer);
//     //         global.gl.vertexAttribPointer(this._shaderprogram.textureCoordAttribute, this.vertexTextureCoordBuffer.itemSize, global.gl.FLOAT, false, 0, 0);
            
//     //         global.gl.bindBuffer(global.gl.ELEMENT_ARRAY_BUFFER, this.vertexIndexBuffer);
            
//     //         global.gl.enableVertexAttribArray(this._shaderprogram.vertexPositionAttribute);
//     //         global.gl.enableVertexAttribArray(this._shaderprogram.textureCoordAttribute);
    
//     //         if (this._order < 3) {

//     //             global.gl.activeTexture(global.gl.TEXTURE0+this._hipsShaderIndex);
//     //             global.gl.bindTexture(global.gl.TEXTURE_2D, this._texture);
//     //             global.gl.uniform1f(this.uniformVertexTextureFactorLoc, this.opacity);	
                
//     //             for (let i = 0; i < this._pixels.length; i++){
                        
//     //                 global.gl.drawElements(global.gl.TRIANGLES, 6, global.gl.UNSIGNED_SHORT, 12 * i);
//     //             }
//     //         } else {
//     //             for (var i=0;i<this._pixels.length;i++){
					
//     //                 global.gl.activeTexture(global.gl.TEXTURE0+this._hipsShaderIndex);
//     //                 global.gl.bindTexture(global.gl.TEXTURE_2D, this._texture);
//     //                 global.gl.uniform1f(this.uniformVertexTextureFactorLoc, this.opacity);
                        
//     //                 global.gl.drawElements(global.gl.TRIANGLES, 6, 
//     //                         global.gl.UNSIGNED_SHORT, 12*i);
//     //             }
//     //         }
//     //     }
        
//     // }
// }

// export default GridTile;