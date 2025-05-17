"use strict";
/**
 * @author Fabrizio Giordano (Fab)
 */


class SesameService {

    constructor(){
        // TODO move this URL into Config
        this._baseURL = "https://cdsweb.u-strasbg.fr/cgi-bin/nph-sesame/-ox?";
    }

    async queryByTargetName(targetName) {
        let url = this._baseURL+targetName;
        return window.fetch(url, {
            method: 'GET',
            mode: 'cors',
        }).then( res => res.text()
        ).then(xmlStr => {
            xmlStr = xmlStr.replaceAll('\n\t', '');
            xmlStr = xmlStr.replaceAll('\t', '');
            xmlStr = xmlStr.replaceAll('\n', '');
            const parser = new DOMParser();
            const doc = parser.parseFromString(xmlStr, "application/xml");
            // console.log(doc);
            if (doc.childElementCount > 1) {
                console.error("Error parsing Sesame XML. More than 1 node from root");
                return null;
            }

            for (let i = 0; i < doc.childNodes[0].childElementCount; i++) {
                let target = doc.childNodes[0].childNodes[i];
    
                if (target.nodeName != 'Target') {
                    continue;
                }
                for (let t = 0; t < target.childNodes.length; t++ ) {
                    let child = target.childNodes[t];
                    if (child.nodeName == 'Resolver') {
                        let raDeg = child.getElementsByTagName("jradeg")[0].innerHTML;
                        let decDeg = child.getElementsByTagName("jdedeg")[0].innerHTML;
                        console.log(raDeg, decDeg);
                        return {"ra": raDeg, "dec": decDeg}
                    }
                }

            }

        });
    }

}


var sesameService = new SesameService();

export default sesameService;