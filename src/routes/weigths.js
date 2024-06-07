const express = require('express');
const router = express.Router();
const weightsController = require('../controller/weightsController');


router.post('/ready/:target', weightsController.postReady);

module.exports = router;
