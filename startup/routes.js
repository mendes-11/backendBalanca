const express = require("express");
const game = require("../src/routes/game");
const timer = require("../src/routes/timer");

module.exports = function (app) 
{
  app
    .use(express.json())
    .use("/game", game)
    // .use("/timer", timer)
};