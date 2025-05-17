// "use strict";
// /**
//  * @author Fabrizio Giordano (Fab77)
//  */
// import CloseHiPSSettingsEvent from './events/CloseHiPSSettingsEvent.js';
// import HiPSSettingsChangeEvent from './events/HiPSSettingsChangeEvent.js';
// import eventBus from '../../../events/EventBus.js';
// import { session } from '../../../utils/Session.js';
// import HiPSDescriptor from '../../../model/HiPSDescriptor.js'
// import ColorMaps from '../../dataexplorer/model/ColorMaps.js';

// class HiPSSettingsPresenter {

//     /**
//      * 
//      * @param {*} view 
//      * @param {HiPSDescriptor} descriptor 
//      */
//     constructor(view, descriptor) {
//         this._view = view;
//         this._model = descriptor;

//         this._view.addCloseHandler(function () {
//             eventBus.fireEvent(new CloseHiPSSettingsEvent());
//         });

//         this.addButtonsClickHandlers();
//     }

//     addButtonsClickHandlers() {

//         this.view.formatDropDown().on("change", { caller: this }, this.formatChanged);
//         this.view.colorMapDropDown().on("change", { caller: this }, this.colorMapChanged);
//         this.view.invertColorMap().on("change", { caller: this }, this.invertColorChanged);
//     }
    
//     formatChanged(event) {
//         let valueSelected = this.value;
//         console.log(valueSelected);
//         let caller = event.data.caller;
//         session.activeHiPS.forEach(hips => {
//             if (hips._descriptor.surveyName == caller._model.surveyName) {
//                 hips.changeFormat(valueSelected);
//             }

//         });
//     }

//     colorMapChanged(event) {
//         console.log("Hola");
//         let valueSelected = this.value;
//         console.log(valueSelected);
//         let caller = event.data.caller;
//         session.activeHiPS.forEach(hips => {
//             if (hips._descriptor.surveyName == caller._model.surveyName) {
//                 hips.changeColorMap(ColorMaps[valueSelected]);
//             }
//         });

//         // get HiPS from session and change color map?
//         // eventBus.fireEvent(new ColorMapChangeEvent(valueSelected));
//     }



//     invertColorChanged(event) {
//         let target = event.target;
//         let checked = target.checked;
//         console.log(checked)
//         // get HiPS from session and invert color?
//         // eventBus.fireEvent(new InvertColorMapEvent(checked));
//     }


//     get view() {
//         return this._view;
//     }

// }

// export default HiPSSettingsPresenter;

