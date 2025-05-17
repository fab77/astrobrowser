import express from 'express';
import path from 'path';


import axios from 'axios';

import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let router = express.Router();


/* GET adql. */

//https://sky.esa.int/esasky-tap/tap//sync
// ?request=doQuery
// &lang=ADQL
// &format=json
// &query=select%20*%20from%20catalogues.mv_v_gcc_catalog_fdw%20where%201=CONTAINS(POINT(%27ICRS%27,ra,dec),%20POLYGON(%27ICRS%27,%20264.27593155770796,-25.95567436169749,264.48501652792436,-29.233849756071095,264.6363243488927,-32.51468993834557,265.64305328790465,-32.46095857369379,266.64983054592534,-32.41594226197637,266.36505714578834,-29.141656094723288,266.164967602034,-25.863047812945695,265.2213277576108,-25.920786869582713)).

router.get('/', function(req, res, next) {
    console.log(req.query.tapurl)
    let url = req.query.tapurl
    let query = req.query.query

    const u = url + "/sync?request=doQuery&lang=ADQL&format=json&query="+query
    
    
    let params = {}
    axios.get(u, {
        params: params
    }).then(response => {
        res.header("Access-Control-Allow-Origin", "*");
        res.send(response.data)
        
    }).catch(error => {
        res.json(error)
    })
    
  })

export default router;
