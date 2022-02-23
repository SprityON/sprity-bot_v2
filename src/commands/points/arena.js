const Utils = require('../../classes/utilities/Utils')

module.exports = {
  name: Utils.getCmdName(__filename, __dirname),
  category: Utils.getCmdCategory(__filename),
  usage: '$arena',
  aliases: [],
  permissions: ['SEND_MESSAGES'],
  timeout: 1000,

  async execute(msg, args) {
    // code
  },

  help: {
    enabled: false,
    title: 'Arena',
    description: `Enter the Arena: Get stronger and climb the ranks.`,
  }
}