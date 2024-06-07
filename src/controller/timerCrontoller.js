let startTime = null;
let timer;
let startPause;
let pauseTime = 0;
var finished = false;

class timerController {
    static async postStartTimer(req, res) {
        if (timer) {
            return res.send({ startTime: startTime, message: "O cronômetro já está em execução." });
        }

        startTime = Date.now();
        reset = false;

        timer = setTimeout(() => {
            console.log("Tempo encerrado.");
            finished = true;
            saveExcel();
            clearTimeout(timer);
        }, testDuration * 1000);

        started = true;
        res.send({ startTime: startTime, message: "Cronômetro de 1 hora iniciado." });
    }

    static async getPauseTimer(req, res) {
        if (startPause) {
            pauseTime += Date.now() - startPause;
            startPause = null;
            return res.send({ pauseTime: pauseTime, paused: false });
        }

        startPause = Date.now();
        res.send({ pauseTime: pauseTime, paused: true });
    }

    static async getCheckTimer(req, res) {
        if (!timer) {
            return res.status(409).send("O cronômetro não está em execução.");
        }

        var elapsedTime = (Date.now() - startTime) - pauseTime;
        if (startPause) {
            elapsedTime -= Date.now() - startPause;
        }

        const remainingTime = Math.max(0, (testDuration * 1000) - elapsedTime);

        const hours = Math.floor(remainingTime / 3600000);
        const minutes = Math.floor((remainingTime % 3600000) / 60000);
        const seconds = Math.floor((remainingTime % 60000) / 1000);

        return res.send({
            startTime: startTime,
            leftTime: `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`,
            paused: !!startPause
        });
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

    static async postReset(req, res) {
        started = false;
        startTime = null;
        timer = null;
        startPause = null;
        pauseTime = 0;
        finished = false;
        competitors = {};
        testDuration = 3600;
        reset = true;
        res.send("Atividade finalizada.");
    }

    static async postSetOptions(req, res) {
        const { timer, tries } = req.body;
        showTimer = timer === "on";
        showTries = tries === "on";
        res.send({ showTimer, showTries });
    }

    static async postSetTime(req, res) {
        const { time } = req.body;
        if (isNaN(time)) {
            return res.status(400).send("Valor inválido");
        }
        testDuration = Number(time);
        console.log("Novo tempo de prova:", testDuration);
        return res.send({ testDuration });
    }
}

module.exports = timerController;
