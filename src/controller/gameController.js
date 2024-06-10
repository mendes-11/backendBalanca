const { saveExcel, generate, shuffle } = require('../utils');
const Player = require("../model/player");
competitors = {}
const weights = [100, 200, 300, 500, 800];
const testWeights = [100, 200, 300];
const startTime = Date.now(); //Retirar isso

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
                { new: true }
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
        
        try{
            const competitor = await Player.findOneAndUpdate(
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
                { new: true }
            );
            if (!competitor) return res.status(404).send("Competidor não encontrado.");
                       
            const elapsedTime = Date.now() - startTime;
            
            const hours = Math.floor(elapsedTime / 3600000);
            const minutes = Math.floor((elapsedTime % 3600000) / 60000);
            const seconds = Math.floor((elapsedTime % 60000) / 1000);
            
            competitor.time = `${hours}:${minutes}:${seconds}`;
            await competitor.save();

            res.send("OK");
        } catch (error) {
            console.error("Erro ao autalizar a resposta final:", error);
            res.status(500).send("Erro ao autalizar a resposta final");
        }
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
    
        if (!code) return res.status(400).send({ message: "Code não fornecido" });
        if (!quantities || !Array.isArray(quantities) || quantities.length !== 10) {
            return res.status(400).send({ message: "Quantities deve ser um array de 10 números" });
        }
    
        try {
            console.log(`Buscando competidor com o code: ${code}`);
            const competitor = await Player.findOne({ code });
    
            if (!competitor) return res.status(404).send("Competidor não encontrado");
    
            competitor.tentativas += 1;
            competitor.pieces = 0;
    
            let plate1 = 0;
            let plate2 = 0;
    
            let temp = [
                competitor.realScore[1],
                competitor.realScore[2],
                competitor.realScore[0],
                competitor.realScore[4],
                competitor.realScore[3]
            ];
    
            const weights = [1, 2, 3, 4, 5];
    
            for (let j = 0; j < 5; j++) {
                const value1 = quantities[j];
                const value2 = quantities[j + 5];
    
                if (typeof value1 !== 'number' || typeof value2 !== 'number') {
                    return res.status(400).send({ message: "Quantities deve conter apenas números" });
                }
    
                plate1 += value1 * weights[temp[j]];
                plate2 += value2 * weights[temp[j]];
                competitor.pieces += value1 + value2;
            }
    
            let result;
            if (plate1 > plate2) result = -1;
            else if (plate1 === plate2) result = 0;
            else result = 1;
    
            await competitor.save();
    
            res.send({ result });
        } catch (error) {
            console.error(error);
            res.status(500).send({ message: "Erro no servidor" });
        }
    }

    // Arrumar
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

    // Arrumar
    static async getStatus(req, res) {
        const { code } = req.params;
        var comp = competitors[code];
        if (!comp) return res.status(404).send({ success: false, error: { message: "Competidor não encontrado." } });

        res.send({ finished: finished, startTime: showTimer ? startTime : null, tries: showTries ? comp.tentativas : null, reset });
    }

    static async getGame(req, res) {
        const { code } = req.params;
    
        try {
            const competitor = await Player.findOne({ code });
    
            if (!competitor) {
                return res.render("Error", { title: "Não encontrado", message: "Jogador não encontrado" });
            }
    
            if (competitor.accessed) {
                return res.render("Error", { title: "Já Acessado", message: "Solicite ajuda de um dos instrutores da avaliação" });
            }
    
            competitor.accessed = true;
            await competitor.save();
    
            res.render("Game", { data: data, defaultWeight: weights[2], code, showTimer, showTries, testDuration });
         
        } catch (error) {
            console.error(error);
            res.status(500).send("Erro no servidor");
        }
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
