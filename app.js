import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import indexRouter from './routes/index.js';
import usersRouter from './routes/users.js';
import apiRouter from './routes/api.js';


var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/api', apiRouter);
app.use('/users', usersRouter);


export default app;



// https://stackoverflow.com/questions/6912584/how-to-get-get-query-string-variables-in-express-js-on-node-js
// Express specific simple ways to fetch

//     query strings(after ?) such as https://...?user=abc&id=123

//      var express = require('express');

//      var app = express();

//      app.get('/', function(req, res){
//          res.send('id: ' + req.query.id);
//      });

//      app.listen(3000);

//     path params such as https://.../get/users/:id

//      var express = require('express');
//      var app = express();

//      app.get('/get/users/:id', function(req, res){
//          res.send('id: ' + req.params.id);
//      });

//      app.listen(3000);

