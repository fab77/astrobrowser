// "use strict";
// /**
//  * @author Fabrizio Giordano (Fab77)
//  */

// class GLSamplerManager {

//     _samplerMap;

//     constructor() {
//         this._samplerMap = new Map();
//         for (let s = 0; s < 8; s++) {
//             this._samplerMap.set(s, null);
//         }
//     }

//     clearSampler(s) {
//         this._samplerMap.set(s, null);
//     }

//     assocSampler(hips) {
//         for (const [sampler, ships] of this._samplerMap.entries()) {
//             if (ships === null) {
//                 this._samplerMap.set(sampler, hips);
//                 return sampler;
//             }
//         }
//         return "Too many HiPS. You ca draw 8 at maximum at the same time";
//     }

// }

// export const glSamplerManager = new GLSamplerManager();