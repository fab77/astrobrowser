import express from 'express';
import path from 'path';

import { Blob } from 'blob-polyfill';


import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { WCSLight, HiPSProjection, MercatorProjection, Point, CoordsType, NumberType } from 'wcslight';
import { FITSWriter } from 'jsfitsio';

let router = express.Router();


/* GET API. */
router.get('/cutout', function(req, res, next) {
  
  // res.sendFile(path.join(__dirname, '../../public','/api.html'));
  runWCS(req).then( async resultdata => {
    
    
    if (resultdata == undefined) {
      console.log("Response from WCSLight was undefined")
      res.end();
      return
    }

    console.log("Processing response from WCSLight")
    let fw = new FITSWriter();
    fw.run(resultdata.fitsheader[0], resultdata.fitsdata.get(0));

    // console.log("fw._fitsData")
    // console.log(fw._fitsData)
    
    const blob = new Blob([fw._fitsData], { type: "application/fits" });
    
    blob.lastModifiedDate = new Date();
    blob.name = "test.fits";
    
    // console.log(blob)
    // console.log("result size %", blob.size)
  
    console.log("Preparing response")
    res.setHeader('Content-Length', blob.size);

    const arrayBuffer = await blob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    res.write(buffer, 'binary');

    // res.write(blob._buffer, 'binary');
    console.log("Response from API sent")
    res.end();
  });
  
  

  // res.download(result);

});



// sample query localhost:4000/api?radiusasec=87.3&pxsizeasec=0.5&radeg=0.055417&decdeg=33.134167&hipsbaseuri=http://skies.esac.esa.int/NVSS/
// curl "http://localhost:4000/api?radiusasec=87.3&pxsizeasec=0.5&radeg=0.055417&decdeg=33.134167&hipsbaseuri=http://skies.esac.esa.int/NVSS/" --output some.fits
async function runWCS(request) {

  
  let radius_arc_sec = request.query.radiusasec;
  let pxsize_arc_sec = request.query.pxsizeasec;
  let radius_deg = radius_arc_sec / 3600;
  let pxsize_deg = pxsize_arc_sec / 3600;
  let radeg = request.query.radeg;
  let decdeg = request.query.decdeg;
  let hipsBaseUri = request.query.hipsbaseuri;


  // hipsBaseUri = "http://skies.esac.esa.int/NVSS/";
  // radius_arc_sec = 87.3;
  // pxsize_arc_sec = 0.5;
  // radius_deg = radius_arc_sec / 3600;
  // pxsize_deg = pxsize_arc_sec / 3600;
  // radeg = 0.055417;
  // decdeg = 33.134167;
  
  let center = new Point(CoordsType.ASTRO, NumberType.DEGREES, radeg, decdeg);
  let inproj = new HiPSProjection();

  let propfile = await inproj.parsePropertiesFile(hipsBaseUri);
  // console.log(propfile);

  inproj.initFromHiPSLocationAndPxSize(hipsBaseUri, pxsize_deg);
  // console.log(inproj)

  let outproj = new MercatorProjection();

  console.log("ra %s, dec %s, px_size %s, radius %s",radeg, decdeg, pxsize_deg, radius_deg)
  let result = await WCSLight.cutout(center, radius_deg, pxsize_deg, inproj, outproj);
  // console.log(result);

  if (result.fitsused.length > 0){
    // console.log(result);
    return result;
    
  } else {
    console.error("no data found");
  }
  

  // inproj.parsePropertiesFile(hipsBaseUri).then(async propFile => {

  //   inproj.initFromHiPSLocationAndPxSize(hipsBaseUri, pxsize_arc_sec)
  //   let outproj = new MercatorProjection();
    
  //   WCSLight.cutout(center, radius_arc_sec, pxsize_arc_sec, inproj, outproj).then((result) => {
  //     console.log(result);

  //     if (result.fitsused.length > 0){
  //       console.log(result);
  //       let fw = new FITSWriter();
  //       fw.run(this._fitsdata.fitsheader[0], this._fitsdata.fitsdata.get(0));
  //       console.log(fw.typedArrayToURL());
  //       // res.download(file);
  //     } else {
  //       console.error("no data found");
  //     }
      
  //   })
    
  // });
}
// module.exports = router;
export default router;
