
// "use strict";
// /**
//  * @author Fabrizio Giordano (Fab77)
//  */

//  import { Healpix, Pointing, Vec3 } from 'healpixjs';
 
//  import global from '../../Global.js';
//  import RayPickingUtils from '../../utils/RayPickingUtils.js';
 
//  /**
//  * This class should be instantiated in the case when both above are fullfilled:
//  * 1. general order < 3
//  * 2. HiPS minorder >= 3
//  */

// class AllSkyTile {

//     constructor (tileno, descriptor, format, order, shaderprogram, tilebuffer, hips, samplerIdx, allskyImage) {
        
//         if (this._order >= 3) {
//             console.warn("Trying to instantiate AllskyTile when the order is "+order);
//             return;
//         }

//         this._children = new Set();
//         this._hips = hips;
//         this._tilebuffer = tilebuffer;
//         this._tileno = tileno;
//         this._format = format;
//         this._baseurl = descriptor.url;

//         this._maxorder = descriptor.maxOrder;
//         this._minorder = descriptor.minOrder;
//         this._order = order;
        
//         this._isVisible = true;
//         this._isActive = true;
//         this._shaderprogram = shaderprogram;

//         this.opacity = 1.00 * 100.0/100.0;
        
//         this._hipsShaderIndex = samplerIdx; // <== used for multi hips 
//         this._pixels = [];

//         this._texture = undefined;
//         this.initModelBuffer();
//         this.initTextureBuffer();
//         this.initIndexBuffer();
//         this.textureLoaded(allskyImage);
        
//         // if (this._order != 0 ) {
//         //     setTimeout(this.amIStillInFoV(), 3000);
//         // }    
//     }

//     textureLoaded(image) {
            
//         global.gl.useProgram(this._shaderprogram);

//         this._texture = global.gl.createTexture();
        
//         global.gl.activeTexture(global.gl.TEXTURE0+this._hipsShaderIndex);
//         global.gl.pixelStorei(global.gl.UNPACK_FLIP_Y_WEBGL, true);
//         global.gl.bindTexture(global.gl.TEXTURE_2D, this._texture);

//         global.gl.texImage2D(global.gl.TEXTURE_2D, 0, global.gl.RGBA, global.gl.RGBA, global.gl.UNSIGNED_BYTE, image);
        
//         global.gl.texParameteri(global.gl.TEXTURE_2D, global.gl.TEXTURE_WRAP_S, global.gl.CLAMP_TO_EDGE);
//         global.gl.texParameteri(global.gl.TEXTURE_2D, global.gl.TEXTURE_WRAP_T, global.gl.CLAMP_TO_EDGE);
//         global.gl.texParameteri(global.gl.TEXTURE_2D, global.gl.TEXTURE_MIN_FILTER, global.gl.LINEAR);
    
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
		
//         // TODO ERROR this._tileno is Order 0 but I need the relevant Order 3 tileno
		
//         let facesVec3Array  = new Array();
//         this._pixels = [];
        
//         let orighealpix = new Healpix(Math.pow(2, this._order));
//         let xyf = orighealpix.nest2xyf(this._tileno);
//         let healpix3 = new Healpix(Math.pow(2, 3));
//         let orderjump = 3 - this._order;

//         for (let dx = xyf.ix * Math.pow(2, orderjump); dx < (xyf.ix * Math.pow(2, orderjump)) + Math.pow(2, orderjump); dx++) {
//             for (let dy = xyf.iy * Math.pow(2, orderjump); dy < (xyf.iy * Math.pow(2, orderjump)) + Math.pow(2, orderjump); dy++) {
//                 let ipix3 = healpix3.xyf2nest(dx, dy, xyf.face);
//                 this._pixels.push(ipix3);
//             }
//         }
        
//         this.vertexPosition = new Float32Array(12*this._pixels.length);

//         for (let p = 0; p < this._pixels.length; p++) {
//             facesVec3Array = healpix3.getBoundaries(this._pixels[p]);
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
//         let healpix = new Healpix(Math.pow(2, 3));

//         //0.037037037
//         var s_step=1/27;
//         //0.034482759
//         var t_step=1/29;
        
        
//         let sindex, tindex;

//         for (let i=0; i < this._pixels.length; i++){

//             sindex = this._pixels[i] % 27;
//             tindex = Math.floor(this._pixels[i] / 27);

//             this.textureCoordinates[8*i] = (s_step + (s_step * sindex)).toFixed(9);
//             this.textureCoordinates[8*i+1] = (1 - (t_step + t_step * tindex)).toFixed(9);

//             this.textureCoordinates[8*i+2] = (s_step + (s_step * sindex)).toFixed(9);
//             this.textureCoordinates[8*i+3] = (1 - (t_step * tindex)).toFixed(9);
            
//             this.textureCoordinates[8*i+4] = (s_step * sindex).toFixed(9);
//             this.textureCoordinates[8*i+5] = (1 - (t_step * tindex)).toFixed(9);
            
//             this.textureCoordinates[8*i+6] = (s_step * sindex).toFixed(9);
//             this.textureCoordinates[8*i+7] = (1 - (t_step + t_step * tindex)).toFixed(9);
            
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

//         for (let j=0; j < this._pixels.length; j++){

//             this.vertexIndices[6*j] = baseFaceIndex;
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
// }
// export default AllSkyTile;