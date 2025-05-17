// "use strict";
// /**
//  * @author Fabrizio Giordano (Fab77)
//  */

// class FoVHelper {

//     constructor (){

//     }

//     getHiPSNorder (fov) {
        
//         let order = 3;

//         // if (fov >= 179){ 
//         //     order = 0;
//         // } else if (fov >= 62){
//         //     order = 1;
//         // } else if (fov >= 25){
//         //     order = 2;
//         // } else if (fov >= 12.5){
//         //     order = 3;
//         if (fov >= 179){ 
//             order = 0;
//         } else if (fov >= 62){
//             order = 1;
//         } else if (fov >= 40){
//             order = 2;
//         } else if (fov >= 30){
//             order = 3;
//         } else if (fov >= 6){
//             order = 4;
//         } else if (fov >= 3.2){
//             order = 5;
//         } else if (fov >= 1.6){
//             order = 6;
//         } else if (fov >= 0.85){
//             order = 7;
//         } else if (fov >= 0.42){
//             order = 8;
//         } else if (fov >= 0.21){
//             order = 9;
//         } else if (fov >= 0.12){
//             order = 10;
//         } else if (fov >= 0.06){
//             order = 11;
//         } else if (fov < 0.015){
//             order = 12;
//         } else {
//             order = 13;
//         }
//         return order;
//     }

//     getRADegSteps (fov) {
        
        
//         let raStep = 0;
//         let decStep = 0;

//         if (fov >= 179){ 
//             raStep = 10;
//             decStep = 10;
//         } else if (fov >= 25){
//             raStep = 9;
//             decStep = 9;
//         } else if (fov >= 12.5){
//             raStep = 8;
//             decStep = 8;
//         } else if (fov >= 6){
//             raStep = 6;
//             decStep = 6;
//         } else if (fov >= 3.2){
//             raStep = 5;
//             decStep = 5;
//         } else if (fov >= 1.6){
//             raStep = 4;
//             decStep = 4;
//         } else if (fov >= 0.85){
//             raStep = 3;
//             decStep = 3;
//         } else if (fov >= 0.42){
//             raStep = 2;
//             decStep = 2;
//         } else if (fov >= 0.21){
//             raStep = 1;
//             decStep = 1;
//         } else if (fov >= 0.12){
//             raStep = 0.5;
//             decStep = 0.5;
//         } else if (fov >= 0.06){
//             raStep = 0.25;
//             decStep = 0.25;
//         } else {
//             raStep = 10;
//             decStep = 10;
//         }
//         return {
//             "raStep": raStep,
//             "decStep": decStep
//         };
//     }

// }

// export const fovHelper = new FoVHelper();