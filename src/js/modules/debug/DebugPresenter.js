
import DebugView from './DebugView.js'

class DebugPresenter {

    _view;
    constructor(){
        this._view = new DebugView();
    }

    get view() {
        return this._view;
    }

    refresh(pxMap, pxCacheMap){
        this._view.setModel(pxMap, pxCacheMap);
        this._view.refresh();
    }


}

export default DebugPresenter;