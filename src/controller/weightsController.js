class weightsController {
  static async postReady(req, res) {
      const { w1, w2, w3, w4, w5 } = req.body;
      const { target } = req.params;

      if (target === "test") {
          testWeights[1] = Number(w1) || testWeights[1];
          testWeights[0] = Number(w2) || testWeights[0];
          testWeights[2] = Number(w3) || testWeights[2];
          console.log("Pesos do teste atualizados para:", testWeights);

          return res.send("Pesos do teste atualizados");
      } 
      else if (target === "game") {
          weights[2] = Number(w1) || weights[2];
          weights[0] = Number(w2) || weights[0];
          weights[1] = Number(w3) || weights[1];
          weights[3] = Number(w4) || weights[3];
          weights[4] = Number(w5) || weights[4];
          console.log("Pesos do jogo atualizados para:", weights);
          return res.send("Pesos do jogo atualizados");
      }
      return res.status(400).send("Target inválido");
  }
}

module.exports = weightsController;
