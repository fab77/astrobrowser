
import $ from "jquery";
class DebugView {

    _html;
    _pxMap;
    _pxCacheMap;
    constructor() {
        this.initHtml();
    }

    setModel(pxMap, pxCacheMap) {
        this._pxMap = pxMap;
        this._pxCacheMap = pxCacheMap;
    }

    refresh() {

        let tr = '';
        let order;
        let pixno;

        for (let [key, tile] of this._pxMap) {
            order = key.split('#')[0];
            pixno = key.split('#')[1];
            if (tile.parentTile) {
                tr += `<tr><td>${order}</td><td>${pixno}</td><td>${tile.isLoaded}</td><td>${tile.parentTile.key}</td></tr>`;
            } else {
                tr += `<tr><td>${order}</td><td>${pixno}</td><td>${tile.isLoaded}</td><td>${tile.parentTile}</td></tr>`;
            }
            
        }
        document.getElementById('debug_px_body').innerHTML = tr;
        document.getElementById('debug_px_caption').innerHTML = `Tiles drawn ${this._pxMap.size}`;

        tr = '';
        order;
        pixno;
        for (let [key, tile] of this._pxCacheMap) {
            order = key.split('#')[0];
            pixno = key.split('#')[1];
            tr += `<tr><td>${order}</td><td>${pixno}</td><td>${tile.isLoaded}</td></tr>`;
        }
        document.getElementById('debug_px_cache_body').innerHTML = tr;
        document.getElementById('debug_px_cache_caption').innerHTML = `Tiles cache ${this._pxCacheMap.size}`;


        this.applyStyle();
    }

    applyStyle() {

        let height = '350px';
        this._html.css("position", "absolute");
        this._html.css("width", "446px");
        this._html.css("height", height);
        this._html.css("border", "1px solid green");
        this._html.css("left", "200px");
        this._html.css("bottom", "10%");
        this._html.css("color", "white");
        
        $('#debug_px').css("overflow", "scroll");
        $('#debug_px').css("float", "left");
        $('#debug_px').css("border-right", "1px solid green");
        $('#debug_px').css("height", height);
        $('#debug_px').css("width", '48%');

        $('#debug_px_cache').css("float", "right");
        $('#debug_px_cache').css("overflow", "scroll");
        $('#debug_px_cache').css("height", height);
    }

    get html() {
        return this._html;
    }

    show() {
        // this._html.css("display","none");
        this._html.css("display", "block");
    }

    initHtml() {

        this._html = $(`
            <div id='debug'>
                <div  id='debug_px'>
                    <table>
                        <caption id='debug_px_caption'>Tiles drawn</caption>
                        <thead>
                            <tr>
                                <th>order</th>
                                <th>pixno</th>
                                <th>texture</th>
                                <th>PL</th>
                            </tr>
                        </thead>
                        <tbody id='debug_px_body'>
                        </tbody>
                    </table>
                </div>

                <div id='debug_px_cache'>
                    <table>
                        <caption id='debug_px_cache_caption'>Tiles cache</caption>
                        <thead>
                            <tr>
                                <th>order</th>
                                <th>pixno</th>
                                <th>texture</th>
                            </tr>
                        </thead>
                        <tbody id='debug_px_cache_body'>    
                        </tbody>
                    </table>
                </div>
            </div>
        `);
        this.applyStyle();
    }


}

export default DebugView;