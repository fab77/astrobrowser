
import global from '../../Global.js';
import { Pointing, Vec3 } from 'healpixjs';
import RayPickingUtils from '../../utils/RayPickingUtils.js';
import { newTileBuffer } from './TileBuffer.js';
import { vec4, mat4 } from 'gl-matrix';


class VisibleTilesManager {

	_visibleTilesByOrder;
	_ancestorsMap;
	healpixGrid;
	initialised;

	constructor() {
		this._visibleTilesByOrder = [];
		this._ancestorsMap = new Map();
		this.initialised = false;


		this._galVisibleTilesByOrder = [];
		this._galAncestorsMap = new Map();
		this._galacticMatrixInverted = mat4.create();

		// for gal precision check Planck-2015-Pol-Synchrotron 168.6332 -61.4506
		// from https://observablehq.com/@fil/galactic-rotations
		mat4.set(this._galacticMatrixInverted,
			-0.054876, -0.873437, -0.483835, 0,
			0.494109, -0.444830, 0.746982, -0,
			-0.867666, -0.198076, 0.455984, 0,
		  	0, 0, 0, 1);
		// mat4.set(this._galacticMatrixInverted,
		// 	-0.054875582456588745, -0.8734370470046997, -0.48383501172065735, 0,
		// 	0.49410945177078247, -0.4448296129703522, 0.7469822764396667, -0,
		// 	-0.8676661849021912, -0.19807636737823486, 0.4559837877750397, 0,
		// 	0, 0, 0, 1);

		/* [Ref. DOI https://doi.org/10.1051/0004-6361/201116947 
			J.-C. Liu1,2, Z. Zhu1,2 and B. Hu3,4
			Constructing a Galactic coordinate system based on near-infrared and radio catalogs]
			Method 1: z-axis fixed condition 2Mass
		*/
		// mat4.set(this._galacticMatrixInverted,
		// 	-0.05505347007, -0.8719028362, -0.4870643574, 0,
		// 	0.4897972973, -0.4466482209, 0.7487349160, -0,
		// 	-0.8703705255, -0.2007257110, 0.4496268868, 0,
		// 	0, 0, 0, 1);
		/* [Ref. DOI https://doi.org/10.1051/0004-6361/201116947 
			J.-C. Liu1,2, Z. Zhu1,2 and B. Hu3,4
			Constructing a Galactic coordinate system based on near-infrared and radio catalogs]
			Method 1: z-axis fixed condition Specfind
		*/
		// mat4.set(this._galacticMatrixInverted,
		// 	-0.0518807421, -0.8722226427, -0.4863497200, 0,
		// 	0.4846922369, -0.4477920852, 0.7513692061, -0,
		// 	-0.8731447899, -0.1967483417, 0.4459913295, 0,
		// 	0, 0, 0, 1);
		/* [Ref. DOI https://doi.org/10.1051/0004-6361/201116947 
			J.-C. Liu1,2, Z. Zhu1,2 and B. Hu3,4
			Constructing a Galactic coordinate system based on near-infrared and radio catalogs]
			Method 1: x-axis fixed condition 2MASS
		*/
		// mat4.set(this._galacticMatrixInverted,
		// 	-0.0546572359, -0.8728439269, -0.4849289286, 0,
		// 	0.4888603641, -0.4468595864, 0.7492209651, -0,
		// 	-0.8706481098, -0.1961121855, 0.4511229097, 0,
		// 	0, 0, 0, 1);
		/* [Ref. DOI https://doi.org/10.1051/0004-6361/201116947 
			J.-C. Liu1,2, Z. Zhu1,2 and B. Hu3,4
			Constructing a Galactic coordinate system based on near-infrared and radio catalogs]
			Method 1: x-axis fixed condition Specfind
		*/
		// mat4.set(this._galacticMatrixInverted,
		// 	-0.0546572359, -0.8728439269, -0.4849289286, 0,
		// 	0.4838685275, -0.4479748647, 0.7517910405, -0,
		// 	-0.8734322153, -0.1935510264, 0.4468267735, 0,
		// 	0, 0, 0, 1);
		this._galacticMatrix = new Map();
		mat4.invert(this._galacticMatrix, this._galacticMatrixInverted)

	}

	init(healpixGrid) {
		this.healpixGrid = healpixGrid;
		this.initialised = true;
		this.computeVisiblePixels();
		setInterval(() => this.computeVisiblePixels(), 500);

	}

	getVisibleOrder(){
		return this.healpixGrid._visibleorder;
	}

	computeVisiblePixels() {

		if (!this.initialised) {
			return [];
		}

		let order = this.healpixGrid._visibleorder;
		if (global.insideSphere){
			if (order < 3){
				order = 3;
			}
		}
		this._ancestorsMap.set(order, []);
		this._galAncestorsMap.set(order, []);
		let pixels = [];
		let galTiles = [];

		if (order == 0) {

			const geomhealpix = global.getHealpix(0);
			const npix = geomhealpix.getNPix();
			pixels = [npix];
			pixels.splice(0, npix);
			galTiles.splice(0, npix);
			for (let i = 0; i < npix; i++) {
				pixels.push(i);
				this._ancestorsMap.get(order).push(i);
			}
			for (let i = 0; i < npix; i++) {
				galTiles.push(i);
				this._galAncestorsMap.get(order).push(i);
			}
			
		} else {

			const geomhealpix = global.getHealpix(order);
			const maxX = global.gl.canvas.width;
			const maxY = global.gl.canvas.height;

			let intersectionWithModel;
			let intersectionPoint = null;
			let currP, currPixNo;
			let galVec, galPoint, galTileNo;

			// for (let i = 0; i <= maxX; i += maxX / 10) {
			// 	for (let j = 0; j <= maxY; j += maxY / 10) {
			for (let i = 0; i <= maxX; i += maxX / 30) {
				for (let j = 0; j <= maxY; j += maxY / 30) {

					intersectionWithModel = {
						"intersectionPoint": null,
						"pickedObject": null
					};



					intersectionWithModel = RayPickingUtils.getIntersectionPointWithSingleModel(i, j, this.healpixGrid);
					intersectionPoint = intersectionWithModel.intersectionPoint;

					if (intersectionPoint.length > 0) {


						galVec = vec4.create();
						vec4.transformMat4(galVec, [intersectionPoint[0], intersectionPoint[1], intersectionPoint[2], 1], this._galacticMatrix)
						galPoint = new Pointing(new Vec3(galVec[0], galVec[1], galVec[2]));
						galTileNo = geomhealpix.ang2pix(galPoint);

						currP = new Pointing(new Vec3(intersectionPoint[0], intersectionPoint[1], intersectionPoint[2]));
						currPixNo = geomhealpix.ang2pix(currP);

						if (!pixels.includes(currPixNo)) {
							pixels.push(currPixNo)
							this._ancestorsMap.get(order).push(currPixNo);
							newTileBuffer.addTile(order, currPixNo);
						}

						if (!galTiles.includes(galTileNo)) {
							galTiles.push(galTileNo)
							this._galAncestorsMap.get(order).push(galTileNo);
							newTileBuffer.addGalTile(order, galTileNo);
						}

					}
				}
			}
		}

		this._visibleTilesByOrder = {
			"pixels": pixels,
			"order": order
		};
		this._galVisibleTilesByOrder = {
			"pixels": galTiles,
			"order": order
		};


		/**
		 * 1. visibleTileManager calls tileBuffer to create all visible tile, ancestor include
		 * 2. tileBuffer tries to get the requested tile from cache or tiles array and in case
		 * it generates one and add it to tiles array
		 * 3. when HiPS draws, calls Ancestor.draw
		 * 4. each Anchestor gets needed tiles by calling Tilebubber.get (which checks tiles array or cache)
		 * 5. each Tile called by Anchestor, will get needed tiles by calling Tilebubber.get (which checks tiles array or cache)
		 */


		for (let o = 1; o < order; o++) {
			this._ancestorsMap.set(order - o, []);
			for (let p = 0; p < pixels.length; p++) {
				let parent = pixels[p] >> (2 * o)
				if (!this._ancestorsMap.get(order - o).includes(parent)) {
					this._ancestorsMap.get(order - o).push(parent);
					newTileBuffer.addTile(order - o, parent);
				}
			}
		}

		for (let o = 1; o < order; o++) {
			this._galAncestorsMap.set(order - o, []);
			for (let p = 0; p < galTiles.length; p++) {
				let parent = galTiles[p] >> (2 * o)
				if (!this._galAncestorsMap.get(order - o).includes(parent)) {
					this._galAncestorsMap.get(order - o).push(parent);
					newTileBuffer.addGalTile(order - o, parent);
				}
			}
		}
		// if (global.insideSphere){
		// 	console.log(`Ancestors `)
		// 	console.log(this._ancestorsMap)

		// 	console.log(`VisibleTiles `)
		// 	console.log(this._visibleTilesByOrder)
		// }
	}

	get visibleTilesByOrder() {
		return this._visibleTilesByOrder;
	}

	get ancestorsMap() {
		return this._ancestorsMap;
	}

	get galVisibleTilesByOrder() {
		return this._galVisibleTilesByOrder;
	}

	get galAncestorsMap() {
		return this._galAncestorsMap;
	}

	get visibleOrder() {
		return this._visibleTilesByOrder.order;
	}
}


export const newVisibleTilesManager = new VisibleTilesManager();