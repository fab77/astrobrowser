import express from 'express';
import cors from 'cors';
import axios from 'axios';

let router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

export default router;
