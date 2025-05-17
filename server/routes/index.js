import express from 'express';
// var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'AstroBrowser' });
});

// module.exports = router;
export default router;
