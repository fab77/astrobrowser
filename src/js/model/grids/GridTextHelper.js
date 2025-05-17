/**
 * @author Fabrizio Giordano (Fab)
 * @param in_radius - number
 * @param in_gl - GL context
 * @param in_position - array of double e.g. [0.0, 0.0, 0.0]
 */


class GridTextHelper {


    _divEqContainerElement;
    _divHPXContainerElement;
    _divSets;
    _divSetNdx;

    constructor() {
        this._divEqContainerElement = document.querySelector("#gridcoords");
        this._divHPXContainerElement = document.querySelector("#gridhpx");
        this._divSetNdx = 0;
        this._divSets = [];
    }

    initHtml() {
        // this._divContainerElement = document.querySelector("#gridcoords");
        // this._divSetNdx = 0;
        // this._divSets = [];

    }

    resetDivSets() {
        // mark the remaining divs to not be displayed
        for (; this._divSetNdx < this._divSets.length; ++this._divSetNdx) {
            this._divSets[this._divSetNdx].style.display = "none";
        }
        this._divSetNdx = 0;
    }


    /**
     * 
     * @param {*} msg 
     * @param {*} x 
     * @param {*} y 
     */
    addHPXDivSet(msg, x, y) {
        // get the next div
        let divSet = this._divSets[this._divSetNdx++];

        // If it doesn't exist make a new one
        if (!divSet) {
            divSet = {};
            divSet.div = document.createElement("div");
            divSet.textNode = document.createTextNode("");
            divSet.style = divSet.div.style;

            
            divSet.div.className = "floating-div-ra";
            

            // add the text node to the div
            divSet.div.appendChild(divSet.textNode);

            // add the div to the container
            if (!this._divHPXContainerElement) {
                this._divHPXContainerElement = document.querySelector("#gridhpx");
            }
            this._divHPXContainerElement.appendChild(divSet.div);


            // Add it to the set
            this._divSets.push(divSet);
        }

        // make it display
        divSet.style.display = "block";
        
        divSet.style.left = Math.floor(x + 25) + "px";
        divSet.style.top = Math.floor(y) + "px";
        

        divSet.textNode.nodeValue = msg;
    }
    /**
     * 
     * @param {*} msg 
     * @param {*} x 
     * @param {*} y 
     * @param {String} type : ra or dec
     */
    addEqDivSet(msg, x, y, type) {
        // get the next div
        let divSet = this._divSets[this._divSetNdx++];

        // If it doesn't exist make a new one
        if (!divSet) {
            divSet = {};
            divSet.div = document.createElement("div");
            divSet.textNode = document.createTextNode("");
            divSet.style = divSet.div.style;

            if (type == 'ra') {
                divSet.div.className = "floating-div-ra";
            } else {
                divSet.div.className = "floating-div-dec";
            }


            // add the text node to the div
            divSet.div.appendChild(divSet.textNode);

            // add the div to the container
            if (!this._divEqContainerElement) {
                this._divEqContainerElement = document.querySelector("#gridcoords");
            }
            this._divEqContainerElement.appendChild(divSet.div);

            // Add it to the set
            this._divSets.push(divSet);
        }

        // make it display
        divSet.style.display = "block";
        if (type == 'ra') {
            divSet.style.left = Math.floor(x + 25) + "px";
            divSet.style.top = Math.floor(y) + "px";
        } else {
            divSet.style.left = Math.floor(x) + "px";
            divSet.style.top = Math.floor(y + 25) + "px";
        }


        divSet.textNode.nodeValue = msg;
    }

}


export const gridTextHelper = new GridTextHelper();