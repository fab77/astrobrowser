// "use strict";
// import './css/style.css';
// import './css/controlpanelcontainer.css';
// import './css/fovcontainer.css';
// import './css/coordinatespanel.css';

// import './css/style.css!';
// import './css/controlpanelcontainer.css!';

// import { readFile } from 'fs/promises';

// import cssContent from 'css/controlpanelcontainer.css!text';
// console.log('CSS file contents: ', cssContent);


// var myStylesheets = ['./css/controlpanelcontainer.css', './css/style.css'];

// async function loadStyles(stylesheets) {
//     let arr = await Promise.all(stylesheets.map(url => readFile(url)))
//     arr = await Promise.all(arr.map(url => url.text()))
//     const style = document.createElement('style')
//     style.textContent = arr.reduce(
//         (prev, fileContents) => prev + fileContents, ''
//     )
//     document.head.appendChild(style);
//     console.log(style);
//     fabViewer = new FVApp();
//     fabViewer.run();

// }

// loadStyles(myStylesheets)

// ##########################
// import '../polyfill.ts';
// import FVApp from './js/FVApp.js';

// fabViewer = new FVApp();
// fabViewer.run();

export { FVApp} from './js/FVApp.js';
export { FVApi} from './js/FVApi.js';
//export default FVApp;
