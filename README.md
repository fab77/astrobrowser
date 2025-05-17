# astrobrowser
Easy access and visualisation of sky maps in Hierarchical Progressive Surveys (HiPS) format. It supports overlay of source catalogues and observation footprints generated from data of a wide range of astronomy missions onto HiPS maps.
Main features:
- HiPS visualisation and inspection (HiPS published by CDS and ESASky)
- HiPS cutout
- Footprints overlay from most important astronomical missions
- Catalogues overlay from most important astronomical missions

## Instalation

- Prerequisites:
  [Node.js](https://nodejs.org) v<=16
  (see [installation instructions](https://nodejs.org/en/download/package-manager))

- Clone repo:
```
git clone https://github.com/fab77/astrobrowser.git
```

- Move into the astrobrowser-vanilla folder:
```
cd astrobrowser
```

- Install the required `dev` module:
```
npm i
```

- Compile the project:
```
npm run all
```

## Run astrobrowser locally:

```
npm run start
```

- To navigate the sky, open your browser and point to:
 <http://localhost:4000>


- To directly retrieve a FITS cutout, you may query the URL:
  ```
  http://localhost:4000/api/cutout?radiusasec=<radiusasec>&pxsizeasec=<pxsizeasec>&radeg=<radeg>&decdeg=<decdeg>&hipsbaseuri=<hipsbareuri>
  ```
  with:
  - `<radiusasec>`: radius of the field of view, in arcsec
  - `<pxsizeasec>`: pixel size, in arcsec
  - `<radeg>`: right ascension of the image centre, in deg
  - `<decdeg>`: declination of the image centre, in deg
  - `<hipsbareuri>`: base URL of the desired HiPS map (see the [aggregator list](https://aladin.cds.unistra.fr/hips/list) and/or [MOC query](http://alasky.cds.unistra.fr/MocServer/query) services)

## LICENSE
Refer to the LICENSE file.