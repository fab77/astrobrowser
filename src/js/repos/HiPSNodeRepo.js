"use strict";

/**
 * @author Fabrizio Giordano (Fab77)
 */


import HiPSDescriptor from "../model/HiPSDescriptor.js";



export async function addHiPSNode (nodeurl) {
    let hipslistfile = new URL(nodeurl+"/hipslist");
    let hips = [];
    return window.fetch(hipslistfile, {
        method: 'GET',
        mode: 'cors',
        // headers: {
        //   'Access-Control-Allow-Origin':'*'
        // }
    }).then( 
        res => 
        res.text()
    ).then(
        text => {
        const allLines = text.split(/\r\n|\n/);
        allLines.forEach( (line) => {
            if (line.startsWith("hips_service_url")) {
                let hipsurl = line.split("=")[1];
                if (hipsurl !== undefined && hipsurl !== "") {
                    hips.push(hipsurl.trim());
                }
            }
        });
        return hips;
    }).catch(function(err) {
        console.log("[HiPSNodeRepo] "+err);
    });
}

export async function addHiPS(hipsurl) {
    // TODO bad workaround
    hipsurl = hipsurl.replace("http:", "https:");
    let hipspropfile = new URL(hipsurl+"/properties");
    return window.fetch(hipspropfile, {
        method: 'GET',
        mode: 'cors',
        // headers: {
        //     'Access-Control-Allow-Origin':'*'
        //   }
    }).then( res => res.text()
    ).then(text => {
        return new HiPSDescriptor(text, hipsurl);
    }).catch(function(err) {
        console.log("[HiPSNodeRepo] url "+hipsurl+ "[Error]" +err);
    });
}
