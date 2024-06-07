const { saveExcel, generate, shuffle } = require('../utils');
const Player = require("../model/player");
let competitors = {};
const weights = [100, 200, 300, 500, 800];
const testWeights = [100, 200, 300];

class gameController {
    static async postReady(req, res) {
        const { name, dataNasc, w1, w2, w3, w4, w5 } = req.body;
        if (!dataNasc) return res.status(400).send("Sem data de nascimento");

        let accessed = false;
        let done = false;
        let time = "";

        let score = {
            w1: w1 || weights[2],
            w2: w2 || 0,
            w3: w3 || 0,
            w4: w4 || 0,
            w5: w5 || 0,
        };

        let realWeights = [0, 1, 3, 4];
        shuffle(realWeights);

        let realScore = [
            2,
            realWeights[0],
            realWeights[1],
            realWeights[2],
            realWeights[3]
        ];

        let tentativas = 0;
        let pieces = 0;

        let code = await generate();

        competitors[code] = new Player({
            name, dataNasc, done, time,
            realScore, score, tentativas,
            pieces, code, accessed,
            createdAt: new Date()
        });
        console.log("Novo jogador:", code, name, realScore);

        try {
            await competitors[code].save();
            return res.status(201).send({ message: 'Player registered successfully', code: code });
        } catch (error) {
            console.log(error);
            return res.status(500).send({ message: 'Something failed while creating a player' });
        }
    }

    


    static async patchUpdateWeights(req, res) {
        const { code } = req.params;
        const { w1, w2, w3, w4, w5 } = req.body;
    
        try {
            const player = await Player.findOneAndUpdate(
                { code },
                {
                    $set: {
                        "score.w1": w1,
                        "score.w2": w2,
                        "score.w3": w3,
                        "score.w4": w4,
                        "score.w5": w5
                    }
                },
                { new: true } // Para retornar o documento atualizado
            );
    
            if (!player) return res.status(404).send("Competidor não encontrado.");
    
            res.send("Ok");
        } catch (error) {
            console.error("Erro ao atualizar os pesos:", error);
            res.status(500).send("Erro ao atualizar os pesos");
        }
    }
    

    static async patchFinalAnswer(req, res) {
        const { code } = req.params;
        const { w1, w2, w3, w4, w5 } = req.body;

        if (!competitors[code]) return res.status(404).send("Competidor não encontrado.");

        competitors[code].w1 = w1 || competitors[code].w1;
        competitors[code].w2 = w2 || competitors[code].w2;
        competitors[code].w3 = w3 || competitors[code].w3;
        competitors[code].w4 = w4 || competitors[code].w4;
        competitors[code].w5 = w5 || competitors[code].w5;

        competitors[code].done = true;

        const elapsedTime = Date.now() - startTime;

        const hours = Math.floor(elapsedTime / 3600000);
        const minutes = Math.floor((elapsedTime % 3600000) / 60000);
        const seconds = Math.floor((elapsedTime % 60000) / 1000);

        competitors[code].time = `${hours}:${minutes}:${seconds}`;

        res.send("OK");
    }

    static async postTestScales(req, res) {
        let { quantities } = req.body;

        if (!quantities) return res.status(400).send({ message: "Vazio" });

        let temp = [testWeights[2], testWeights[0], testWeights[1]];
        let results = [];

        for (let i = 0; i < quantities.length; i++) {
            const bal = quantities[i];
            let plate1 = 0;
            let plate2 = 0;

            for (let j = 0; j < 3; j++) {
                plate1 += bal[j] * temp[j];
                plate2 += bal[j + 5] * temp[j];
            }

            if (plate1 > plate2) results.push(-1);
            else if (plate1 === plate2) results.push(0);
            else results.push(1);
        }

        res.send({ results });
    }

    static async postScales(req, res) {
        const { code } = req.params;
        const { quantities } = req.body;

        if (!competitors[code]) return res.status(404).send("Competidor não encontrado");

        if (!quantities) return res.status(400).send({ message: "Vazio" });

        competitors[code].tentativas += 1;
        competitors[code].pieces = 0;

        let results = [];

        for (let i = 0; i < quantities.length; i++) {
            const bal = quantities[i];
            let plate1 = 0;
            let plate2 = 0;

            let temp = [
                competitors[code].realScore[1],
                competitors[code].realScore[2],
                competitors[code].realScore[0],
                competitors[code].realScore[4],
                competitors[code].realScore[3]
            ];

            for (let j = 0; j < 5; j++) {
                plate1 += bal[j] * weights[temp[j]];
                plate2 += bal[j + 5] * weights[temp[j]];
                competitors[code].pieces += bal[j] + bal[j + 5];
            }

            if (plate1 > plate2) results.push(-1);
            else if (plate1 === plate2) results.push(0);
            else results.push(1);
        }

        res.send({ results });
    }

    static async getCompetitors(req, res) {
        res.send(competitors);
    }
    static async getPlayers(req, res) {
        try {
            const players = await Player.find();
            return res.status(200).send({ players });
        } catch (error) {
            return res.status(404).send({ error: 'Players not found!' });
        }
    }

    static async getStatus(req, res) {
        const { code } = req.params;
        var comp = competitors[code];
        if (!comp) return res.status(404).send({ success: false, error: { message: "Competidor não encontrado." } });

        res.send({ finished: finished, startTime: showTimer ? startTime : null, tries: showTries ? comp.tentativas : null, reset });
    }

    static async getGame(req, res) {
        const { code } = req.params;
        if (!competitors[code])
            return res.render("Error", { title: "Não encontrado", message: "Jogador não encontrado" });

        if (competitors[code].accessed)
            return res.render("Error", { title: "Já Acessado", message: "Solicite ajuda de um dos instrutores da avaliação" });

        competitors[code].accessed = true;

        res.render("Game", { data: data, defaultWeight: weights[2], code, showTimer, showTries, testDuration });
    }

    static async getTest(req, res) {
        // Implementação do método getTest
        res.send("Método getTest ainda não implementado.");
    }

    static async getDashboard(req, res) {
        // Implementação do método getDashboard
        res.send("Método getDashboard ainda não implementado.");
    }

    static async getFinish(req, res) {
        function formatTime(milliseconds) {
            const hours = Math.floor(milliseconds / 3600000);
            const minutes = Math.floor((milliseconds % 3600000) / 60000);
            const seconds = Math.floor((milliseconds % 60000) / 1000);
            return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        }

        for (const code in competitors) {
            if (competitors.hasOwnProperty(code)) {
                const competitor = competitors[code];
                if (!competitor.time) {
                    const elapsedTime = Date.now() - startTime;
                    competitor.time = formatTime(elapsedTime);
                }
            }
        }

        finished = true;
        startTime = null;
        try {
            var filename = await saveExcel();
            return res.download("./" + filename, filename);
        } catch (error) {
            return res.status(500).send("Atividade finalizada, porém, o excel falhou.");
        }
    }
}

module.exports = gameController;
