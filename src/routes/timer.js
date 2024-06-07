const express = require('express');
const router = express.Router();
const timerController = require('../controller/timerCrontoller');

router
    .post('/start', timerController.postStartTimer)
    .get('/pause', timerController.getPauseTimer)
    .get('/check', timerController.getCheckTimer)
    .get('/finish', timerController.getFinish)
    .post('/reset', timerController.postReset)
    .post('/setOptions', timerController.postSetOptions)
    .post('/setTime', timerController.postSetTime)

module.exports = router;
