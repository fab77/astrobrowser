// // import 'dotenv/config';
// import cors from 'cors';
// import axios from 'axios';
// import express from 'express';

// const app = express();

// app.use(cors({
//   origin: '*'
// }));

// app.get('/:exturl', async (req, res) => {
  
//   let endpoint = req.params.exturl.replaceAll("@@", "/");
//   endpoint = endpoint.replaceAll("**", ":");
//   let params = {}

//   await axios.get(endpoint, {
//     params: params
//   }).then(response => {
//     res.header("Access-Control-Allow-Origin", "*");
//     res.send(response.data)
    
//   }).catch(error => {
//     res.json(error)
//   })
// });


// app.listen(3000, () =>
//   console.log(`Example app listening on port 3000!`),
// );


