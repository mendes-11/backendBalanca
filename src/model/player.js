const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const playerSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  dataNasc: {
    type: Date,
    required: true
  },
  done: {
    type: Boolean,
    default: false
  },
  time: {
    type: String,
    default: ''
  },
  realScore: {
    type: Array,
    default: []
  },
  score: {
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
    },

  },
  tentativas: {
    type: Number,
    default: 0
  },
  pieces: {
    type: Number,
    default: 0
  },
  code: {
    type: String,
    required: true, unique: true
  },
  accessed: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Player = mongoose.model('Player', playerSchema);

module.exports = Player;