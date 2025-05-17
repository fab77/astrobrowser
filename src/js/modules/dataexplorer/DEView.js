import $ from "jquery";

class DEView {

    _html;
    _visible;

    constructor() {

        this.init();

        var _public = {
            getHtml: () => {
                return this._html;
            },
            setModel: () => {
                // TODO

            },
            addSaveHandler: (handler) => {
                this._html.find("#de_save").on("click", handler);
            },
            toggle: () => {
                if (this._visible) {
                    this._html.css("display", "none");
                    this._visible = false;
                } else {
                    this._html.css("display", "block");
                    this._visible = true;
                }
            },
            close: () => {
                if (this._visible) {
                    this._html.css("display", "none");
                    this._visible = false;
                }
            },
            isVisible: () => {
                return this._visible;
            },
            attachCtrlPanel: (html) => {
                $("#de_controls").append(html);
            },
            attachCanvasPanel: (html) => {
                $("#de_canvas_container").append(html);
            },
            attachToolbarPanel: (html) => {
                $("#de_toolbar").append(html);
            },
            attachFooterPanel: (html) => {
                $("#de_footer").append(html);
            }

        }
        return _public;
    }

    init() {
        this._visible = false;
        // this._html = $(
        //     "<div id='de_view'>"
        //     + "     <div id='de_toolbar'></div>"
        //     + "     <div id='de_controls'></div>"
        //     + "     <div id='de_canvas_container'></div>"
        //     + "</div>");
            this._html = $(`
                <div id='de_view'>
                    <div id='de_toolbar'></div>
                    <div id='de_controls'></div>
                    <div id='de_canvas_container'></div>
                    <div id='de_footer'></div>
                </div>`);

                
        this._html.css("display", "none");
    }

}

export default DEView;