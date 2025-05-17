import $ from "jquery";
class CutoutPanelView{

    _html;
    _visible;
    
    constructor(){
        
        this.init();
        

        let _public = {
            getHtml: ()=>{
                return this._html;
            },
            setModel : (model)=> { // model type of Point.js
                if (model !== null) {
                    $("#cto_cRA").val(model.raDeg);
                    $("#cto_cDec").val(model.decDeg);
                }
            },
            addCutoutHandler : (handler) => {
                this._html.find("#cto_go").on("click", handler);
            },
            toggle: (hipsName)=>{
                this._visible = !this._visible;
                this._html.toggle();
                this.updateHiPSName(hipsName);
            },
            close: ()=>{
            	if (this._visible){
            		this._html.css("display","none");
            		this._visible = false;
            	}
            },
            isVisible: ()=>{
                return this._visible;
            }
        }
        return _public;
    }		

    updateHiPSName(hipsName){
        // $("#hipsname").html=hipsName
        document.getElementById("hipsname").innerHTML = hipsName
        // $("#"+this._dom_hipsname_id).text(hipsName);
    }

    init(){
        this._visible = false;
        this._html = $("<div id='ctoPanel' class='controlPanel'>"
        + "<span id='hipsname'></span>"
        + "<div>"
        + " <label for='cto_pxsize'>pixel size:</label>" 
        + " <input name='cto_pxsize' id='cto_pxsize' type='text' value='0.0005'/>(deg)" 
        + "</div>"
        + "<div>"
        + " <label for='cto_cRA'>central RA:</label>" 
        + " <input name='cto_cRA' id='cto_cRA' type='text'/>(deg)" 
        + " <label for='cto_cDec'>central Dec:</label>" 
        + " <input name='cto_cDec' id='cto_cDec' type='text'/>(deg)" 
        + "</div>"
        + "<div>"
        + " <label for='cto_radius'>radius:</label>" 
        + " <input name='cto_radius' id='cto_radius' type='text' value='0.1'/>(deg)" 
        + "</div>"
        + "<div>"
        + " <label for='cto_proj'>Projection:</label>" 
        + " <select name='cto_proj' id='cto_proj' onmousedown='event.stopPropagation()'>"
        + "  <option value='mercator'>Mercator</option>"
        + "  <option value='mercator'>HiPS</option>"
        + " </select>"
        + "</div>"
        + "<div><button id='cto_go'>Data explorer</button>"
        + "</div>");
        this._html.css("display","none");
    }

}

export default CutoutPanelView;