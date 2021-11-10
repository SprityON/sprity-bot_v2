const { Discord } = require('../../Bot')
const Utils = require('../../classes/utilities/Utils')

module.exports = {
  name: Utils.getCmdName(__filename, __dirname),
  category: Utils.getCmdCategory(__filename),
  usage: '',
  aliases: [],
  permissions: ['SEND_MESSAGES'],
  timeout: 1000,

  async execute(msg, args) {
    const embed = new Discord.MessageEmbed().setColor('')
  },

  help: {
    enabled: false,
    title: '',
    description: ``,
  }
}