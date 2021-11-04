const Player = require('../../classes/utilities/Player')
const Utils = require('../../classes/utilities/Utils')

module.exports = {
  name: Utils.getCmdName(__filename, __dirname),
  category: Utils.getCmdCategory(__filename),
  usage: 'create',
  aliases: [],
  permissions: ['SEND_MESSAGES'],
  timeout: 1000,

  execute(msg, args) {
    const player = new Player(msg.member.id)
    if (player.hasAccount(msg)) return msg.replyEmbed(`You already have an account!`)
  },

  help: {
    enabled: true,
    title: 'Create Account',
    description: `Create an account for the points system!`,
  }
}