import express from 'express';
import cors from 'cors';
import axios from 'axios';

// var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

// module.exports = router;
export default router;
