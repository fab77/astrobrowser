import $ from "jquery";

class FooterView {
    _html;
    constructor() {

        this.init();

        var _public = {
            getHtml: () => {
                return this._html;
            },
            addFitsURLs: (fitsUrls) => {
                for (let fUrl of fitsUrls) {
                    $("#"+this._rootDomId).append("<a href='"+fUrl+"'>"+fUrl+"</a><br>");
                }
            },
            clear: () => {
                $("#"+this._rootDomId).html("")
            }
        }
        return _public;
    }

    init() {
        this._rootDomId = "de_footer";
        this._html = $(`
            <div id='${this._rootDomId}'></div>
        `);

    }

}

export default FooterView;