// // import 'dotenv/config';
// import cors from 'cors';
// import express from 'express';
// import fetch from 'cross-fetch';

// const app = express();

// // app.use(cors());
// // app.use((req, res, next) => {
// //   res.header("Access-Control-Allow-Origin", "*");
// //   next();
// // });

// app.get('/:exturl', (req, res) => {
//   console.log(`received request for ${req.params.exturl}`)
//   // req(req.params.exturl).pipe(res)
//   return fetch(req.params.exturl, {
//             method: 'GET',
//             mode: 'cors',
//         })
//   // res.send('Hello World!');
// });


// app.listen(3000, () =>
//   console.log(`Example app listening on port 3000!`),
// );