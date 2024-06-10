const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const gameSchema = new Schema({
    date: {
        type: Date,
        required: true
    },
    period: {
        type: String,
        enum: ['manhã', 'tarde'], 
        required: true
    },
    duration: {
        type: Number,
        required: true
    },
    weights: {
        w1: {
            type: Number,
            default: 0
        },
        w2: {
            type: Number,
            default: 0
        },
        w3: {
            type: Number,
            default: 0
        },
        w4: {
            type: Number,
            default: 0
        },
        w5: {
            type: Number,
            default: 0
        }
    },
    players: [{
        type: Schema.Types.ObjectId,
        ref: 'Player'
    }]
});

const Game = mongoose.model('Game', gameSchema);

module.exports = Game;
