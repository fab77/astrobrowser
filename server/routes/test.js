// import path from 'path';

// import { Blob } from 'blob-polyfill';


// import { fileURLToPath } from 'url';
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

import { WCSLight, HiPSProjection, MercatorProjection, Point, CoordsType, NumberType } from 'wcslight';
// import { FITSWriter } from 'jsfitsio';



// let radius_arc_sec = request.query.radiusasec;
//   let pxsize_arc_sec = request.query.pxsizeasec;
//   let radius_deg = radius_arc_sec / 3600;
//   let pxsize_deg = pxsize_arc_sec / 3600;
//   let radeg = request.query.radeg;
//   let decdeg = request.query.decdeg;
//   let hipsBaseUri = request.query.hipsbaseuri;


let hipsBaseUri = "'http://skies.esac.esa.int/Herschel/PACS160'";
let radius_arc_sec = 118.;
let pxsize_arc_sec = 2.;
let radius_deg = radius_arc_sec / 3600;
let pxsize_deg = pxsize_arc_sec / 3600;
let radeg = 170.01583333333332;
let decdeg = 18.356805555555557;

let center = new Point(CoordsType.ASTRO, NumberType.DEGREES, radeg, decdeg);
let inproj = new HiPSProjection();


inproj.parsePropertiesFile(hipsBaseUri).then((propfile) => {

    console.log(propfile);
    inproj.initFromHiPSLocationAndPxSize(hipsBaseUri, pxsize_deg);
    // console.log(inproj)

    let outproj = new MercatorProjection();

    console.log("ra %s, dec %s, px_size %s, radius %s", radeg, decdeg, pxsize_deg, radius_deg)
    WCSLight.cutout(center, radius_deg, pxsize_deg, inproj, outproj).then((result) => {
        console.log(result);

        if (result.fitsused.length > 0) {
            console.log(result);


        } else {
            console.error("no data found");
        }

    })

});