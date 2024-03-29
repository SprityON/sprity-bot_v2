const Player = require('../../classes/utilities/Player')
const Utils = require('../../classes/utilities/Utils')
const { sendEmbed } = require('../../classes/utilities/AdvancedEmbed')

module.exports = {
  name: Utils.getCmdName(__filename, __dirname),
  category: Utils.getCmdCategory(__filename),
  usage: 'create',
  aliases: [],
  permissions: ['SEND_MESSAGES'],
  timeout: 1000,

  async execute(msg, args) {
    const player = new Player(msg.member)
    if (player.hasAccount(msg)) return msg.reply({ embeds: [sendEmbed(`You already have an account!`)] })
  },

  help: {
    enabled: true,
    title: 'Create Account',
    description: `Create an account for the points system!`,
  }
}