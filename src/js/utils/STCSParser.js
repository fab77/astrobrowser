"use strict";
/**
 * @author Fabrizio Giordano (Fab77)
 */
 import Point from '../utils/Point.js';
 import CoordsType from '../utils/CoordsType.js';
 import global from '../Global.js';

class STCSParser {

    static parseSTCS(stcs) {

        let stcsParsed = STCSParser.cleanStcs(stcs);
        let totPoints = 0;
        let polygons = [];

        if (stcsParsed.includes("POLYGON")){
        
            return STCSParser.parsePolygon(stcsParsed);
  

        } else if (stcsParsed.includes("CIRCLE")){
            return STCSParser.parseCircle(stcsParsed);
        } else {
            console.warn("STCS not recognised");
        }
        return {
            "totpoints": totPoints,
            "polygons": polygons    
        }
    }

    static cleanStcs(stcs) {
        let stcs2upper = stcs.toUpperCase();
        let stcsParsed = stcs2upper.replaceAll("'ICRS'", "")
			.replaceAll("ICRS", "")
			.replaceAll("J2000", "")
			.replaceAll("UNION", "")
			.replaceAll("UNION", "")
			.replaceAll("TOPOCENTER", "")
			.replaceAll("\(", "")
			.replaceAll("\)", "")
			.trim().replace(/  +/g, ' ').toUpperCase();
        return stcsParsed;
    }

    static parsePolygon (stcs) {
        let totPoints = 0;
        let polygons = [];

        // const MAX_DECIMALS=8;
        let polys = stcs.split("POLYGON ");
            
            
        for (let i = 1; i < polys.length; i++){
            let currPoly = [];
            let points = polys[i].trim().split(" ");
            
            
            // case when in the stc_s the first point is repeated at the end. Removes the repeated point at the end 
            if (parseFloat(points[0]).toFixed(global.MAX_DECIMALS) == parseFloat(points[points.length - 2]).toFixed(global.MAX_DECIMALS) && 
            parseFloat(points[1]).toFixed(global.MAX_DECIMALS) == parseFloat(points[points.length - 1]).toFixed(global.MAX_DECIMALS)){
                points.splice(points.length - 2 ,2);
            }
            
            
            if (points.length > 2){
                for (let p = 0; p < points.length - 1; p = p+2){
                    let point = new Point({
                        "raDeg": parseFloat(points[p]).toFixed(global.MAX_DECIMALS),
                        "decDeg": parseFloat(points[p+1]).toFixed(global.MAX_DECIMALS)
                    }, CoordsType.ASTRO);
                    currPoly.push(point);
                    totPoints+=1;
                }
                polygons.push(currPoly);
            }
            
        }

        return {
            "totpoints": totPoints,
            "polygons": polygons    
        }
    }

    // CIRCLE ICRS 8.739685 4.38147 0.027833
    static parseCircle(stcs) {

        let totPoints = 0;
        let polygons = [];

        let polys = stcs.split("CIRCLE ");

        for (let i = 1; i < polys.length; i++){
            let currPoly = [];
            let tokens = polys[i].trim().split(" ");
            let ra = tokens[0] * 1.0;
            let dec = tokens[1] * 1.0;
            let radius = tokens[2] * 1.0;
            const POINTSxQUADRANT = 6;
            let delta = radius / POINTSxQUADRANT;
            let npoints = POINTSxQUADRANT *  4;
            let minra = ra - radius;
            let maxra = ra + radius;
            let mindec = dec - radius;
            let maxdec = dec + radius;

            let curra = minra;
            let curdec = dec;
            let alpha = 2*Math.PI / npoints;
            for (let p = npoints; p > 0; p--) {
            // for (let p = 0; p < npoints; p++) {

                curra = radius * Math.cos(p * alpha) + ra;
                curdec = radius * Math.sin(p * alpha) + dec;

                let point = new Point({
                    "raDeg": curra,
                    "decDeg": curdec
                }, CoordsType.ASTRO);
                currPoly.push(point);
                totPoints+=1;
                
            }
            polygons.push(currPoly);
        }

        return {
            "totpoints": totPoints,
            "polygons": polygons    
        }
    }
}

export default STCSParser;