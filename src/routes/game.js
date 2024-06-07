const express = require('express');
const router = express.Router();
const gameController = require('../controller/gameController');


router
    .post('/ready', gameController.postReady)
    .patch('/update-weights/:code', gameController.patchUpdateWeights)
    .patch('/final-answer/:code', gameController.patchFinalAnswer)
    .post('/test-scales', gameController.postTestScales)
    .post('/scales/:code', gameController.postScales)
    .get('/competitors', gameController.getCompetitors)
    .get('/status/:code', gameController.getStatus)
    .get('/game/:code', gameController.getGame)
    .get('/test', gameController.getTest)
    .get('/dashboard', gameController.getDashboard)
    .get('/finished', gameController.getFinished)

module.exports = router;
