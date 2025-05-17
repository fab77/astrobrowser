import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import indexRouter from './routes/index.js';
import usersRouter from './routes/users.js';
import apiRouter from './routes/api.js';
import extUrlRouter from './routes/exturl.js';
import adqlUrlRouter from './routes/adql.js';
// import backendRouter from './routes/backend.js';
import cors from 'cors';
import axios from 'axios';


import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// import {FVApp} from '../public/javascripts/fabviewer.js'
// import {FVApp} from 'FVApp';

// var express = require('express');
// var path = require('path');
// var cookieParser = require('cookie-parser');
// var logger = require('morgan');

// var indexRouter = require('./routes/index');
// var usersRouter = require('./routes/users');



var app = express();

app.use(cors({
    origin: '*'
  }));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/api', apiRouter);
app.use('/exturl', extUrlRouter);
app.use('/adql', adqlUrlRouter);
// app.use('/backend', backendRouter);

// app.get('exturl', async (req, res) => {
//   let url = req.query.url
//   await axios.get(url, {
//     params: params
//   }).then(response => {
//     res.header("Access-Control-Allow-Origin", "*");
//     res.send(response.data)
    
//   }).catch(error => {
//     res.json(error)
//   })
// });

app.get('//:exturl', async (req, res) => {
  
    console.log("proxy entry");
    let endpoint = req.params.exturl.replaceAll("/", "");
    endpoint = endpoint.replaceAll("@@", "/");
    endpoint = endpoint.replaceAll("**", ":");
    
    let params = {}
  
    await axios.get(endpoint, {
      params: params
    }).then(response => {
      res.header("Access-Control-Allow-Origin", "*");
      res.send(response.data)
      
    }).catch(error => {
      res.json(error)
    })
  });
// module.exports = app;
export default app;
