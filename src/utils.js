const fs = require('fs');
const ExcelJS = require('exceljs');

async function saveExcel(competitors, weights) {
    const today = new Date();
    const hour = today.getHours();
    const dateFormatted = today.toISOString().slice(0, 10).replace(/-/g, '');

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Alunos");

    const headerRow = worksheet.addRow([
        "Nome",
        "Data de Nascimento",
        "Concluiu",
        "Tempo",
        "Tentativas",
        "N Peças",
        "Peso 1",
        "Peso 2",
        "Peso 3",
        "Peso 4",
        "Peso 5",
        "R1",
        "R2",
        "R3",
        "R4",
        "R5"
    ]);

    headerRow.eachCell((cell) => {
        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFA0A0A0' }
        };
        cell.font = {
            color: { argb: 'FFFFFFFF' }
        };
    });

    for (const key in competitors) {
        if (Object.hasOwnProperty.call(competitors, key)) {
            const competitor = competitors[key];
            const row = worksheet.addRow([
                competitor.name,
                competitor.dataNasc,
                competitor.done,
                competitor.time,
                competitor.tentativas,
                competitor.pieces,
                competitor.w1,
                competitor.w2,
                competitor.w3,
                competitor.w4,
                competitor.w5,
                weights[competitor.realScore[0]],
                weights[competitor.realScore[1]],
                weights[competitor.realScore[2]],
                weights[competitor.realScore[3]],
                weights[competitor.realScore[4]]
            ]);

            [competitor.w1, competitor.w2, competitor.w3, competitor.w4, competitor.w5].forEach((weight, index) => {
                const cell = row.getCell(index + 7);

                if (weight == weights[competitor.realScore[index]]) {
                    cell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'FF00FF00' }
                    };
                } else {
                    cell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'FFFF0000' }
                    };
                }
            });
        }
    }

    let fileName;
    let count = 1;

    do {
        if (hour < 12) {
            fileName = `processo_manha${count}_${dateFormatted}.xlsx`;
        } else {
            fileName = `processo_tarde${count}_${dateFormatted}.xlsx`;
        }

        count++;
    } while (fs.existsSync(fileName));

    await workbook.xlsx.writeFile(fileName);
    console.log(`Planilha salva em ${fileName}`);
    return fileName;
}

async function generate() {
    let secretcode = "";
    const characters = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    for (let i = 0; i < 6; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        secretcode += characters.charAt(randomIndex);
    }

    return secretcode;
}

const shuffle = (array) => {
    let currentIndex = array.length;
    while (currentIndex != 0) {
        let randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex],
            array[currentIndex],
        ];
    }
};

module.exports = {
    saveExcel,
    generate,
    shuffle
};
