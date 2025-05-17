
// import global from '../../Global.js';
// import { Healpix, Pointing, Vec3 } from 'healpixjs';
// import RayPickingUtils from '../../utils/RayPickingUtils.js';

// class VisibleTilesManager {

//     _visibleTilesByOrder;
// 	_ancestorsMap;
// 	healpixGrid;
// 	initialised;

//     constructor(){
//         this._visibleTilesByOrder = [];
// 		this._ancestorsMap = new Map();
// 		this.initialised = false;
//     }

// 	init(healpixGrid){
// 		this.healpixGrid = healpixGrid;
// 		this.initialised = true;
// 		this.computeVisiblePixels();
// 		setInterval(() => this.computeVisiblePixels(), 100 );
		
// 	}

//     computeVisiblePixels() {

// 		if (!this.initialised) {
// 			return [];
// 		}
		
//         // const order = global.order;
// 		const order = this.healpixGrid._visibleorder;
		
// 		let pixels = [];

// 		if (order == 0) {
// 			const geomhealpix = new Healpix(Math.pow(2, 0));
// 			const npix = geomhealpix.getNPix();
// 			pixels = [npix];
// 			pixels.splice(0, npix);
// 			for (let i = 0; i < npix; i++) {
// 				pixels.push(i);
// 			}


// 		} else {

// 			const geomhealpix = new Healpix(Math.pow(2, order));
// 			const maxX = global.gl.canvas.width;
// 			const maxY = global.gl.canvas.height;

// 			let intersectionWithModel;
// 			let intersectionPoint = null;
// 			let currP, currPixNo;

			
// 			for (let i = 0; i <= maxX; i += maxX / 10) {
// 				for (let j = 0; j <= maxY; j += maxY / 10) {

// 					intersectionWithModel = {
// 						"intersectionPoint": null,
// 						"pickedObject": null
// 					};

// 					intersectionWithModel = RayPickingUtils.getIntersectionPointWithSingleModel(i, j, this.healpixGrid);
// 					intersectionPoint = intersectionWithModel.intersectionPoint;

// 					if (intersectionPoint.length > 0) {
						
// 						currP = new Pointing(new Vec3(intersectionPoint[0], intersectionPoint[1], intersectionPoint[2]));
// 						currPixNo = geomhealpix.ang2pix(currP);
// 						pixels.push(currPixNo)

// 					}
// 				}
// 			}
// 		}

// 		this._visibleTilesByOrder = {
// 			"pixels": pixels,
// 			"order": order
// 		};
		

// 		/**
// 		 * 1. visibleTileManager calls tileBuffer to create all visible tile, ancestor include
// 		 * 2. tileBuffer tries to get the requested tile from cache or tiles array and in case
// 		 * it generates one and add it to tiles array
// 		 * 3. when HiPS draws, calls Ancestor.draw
// 		 * 4. each Anchestor gets needed tiles by calling Tilebubber.get (which checks tiles array or cache)
// 		 * 5. each Tile called by Anchestor, will get needed tiles by calling Tilebubber.get (which checks tiles array or cache)
// 		 */


// 		for (let o = 1; o < order; o++){
// 			this._ancestorsMap.set(order - o, []);
// 			for (let p = 0; p < pixels.length; p++) {
// 				let parent = pixels[p] >> (2 ** 0)
// 				if (!this._ancestorsMap.get(order - o).includes(parent)){
// 					this._ancestorsMap.get(order - o).push(parent);
// 				}
// 			}
// 		}
// 	}

//     get visibleTilesByOrder() {
//         return this._visibleTilesByOrder;
//     }

// 	get ancestorsMap() {
// 		return this._ancestorsMap;
// 	}
// }


// export const visibleTilesManager = new VisibleTilesManager();