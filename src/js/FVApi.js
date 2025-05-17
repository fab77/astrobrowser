/**
 * @author Fabrizio Giordano (Fab77)
 */
import global from './Global.js';
import { WCSLight, HiPSProjection, MercatorProjection, Point, CoordsType, NumberType } from 'wcslight';

export class FVApi{

	constructor(){
		
		if (global.debug){
			console.log("[FVApi::FVApi]");
		}
		console.log("[FVApi::FVApi]");
		this.runWCS();
		
	}

	testText(){
		return "Hola";
	}
	
	runWCS(){
		let hipsBaseUri = "http://skies.esac.esa.int/NVSS/";
		
		let radius_arc_sec = 87.3;
		let pxsize_arc_sec = 1.5;
		let radius_deg = radius_arc_sec / 3600;
		let pxsize_deg = pxsize_arc_sec / 3600;
		let radeg = 0.055417;
		let decdeg = 33.134167;
		
		let center = new Point(CoordsType.ASTRO, NumberType.DEGREES, radeg, decdeg);
		let inproj = new HiPSProjection();
		
		inproj.parsePropertiesFile(hipsBaseUri).then(async propFile => {

			inproj.initFromHiPSLocationAndPxSize(hipsBaseUri, pxsize_arc_sec)
			let outproj = new MercatorProjection();
			
			WCSLight.cutout(center, radius_arc_sec, pxsize_arc_sec, inproj, outproj).then((result) => {
				if (result.fitsused.length > 0){
					console.log(result);
					// res.download(file);
				} else {
					console.error("no data found");
				}
				
			})
			
		});
	}

}

