


class FooterPresenter {

    _view;
    constructor(view){
        
        this._view = view;
        let self = this;

        var _public = {
            clear: ()=>{
				self._view.clear();
			},
            addFitsUrls: (fitsUrls) => {
                self._view.addFitsURLs(fitsUrls)
            }
        }
        return _public;
    }

    
}

export default FooterPresenter;