const Utils = require('../../classes/utilities/Utils')
const Bot = require('../../Bot')

module.exports = {
  name: Utils.getCmdName(__filename, __dirname),
  category: Utils.getCmdCategory(__filename),
  usage: 'randomgame',
  aliases: ['rg'],
  permissions: ['ADMINISTRATOR'],
  timeout: 5000,

  async execute(msg, args) {
    // tapper game w/ button
    const random = Math.floor(Math.random() * 2.99)
    switch (random) {
      case 0: require('./quest/wordgame').execute(msg, args);         break;
      case 1: require('./quest/minion_fight').execute(msg, args);     break;
      case 2: require('./quest/guess').execute(msg, args);            break;
    }
  },

  help: {
    enabled: false,
    title: 'Random Game',
    description: `Play a random game to earn points!`,
  }
}