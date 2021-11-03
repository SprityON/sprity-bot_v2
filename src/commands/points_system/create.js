const RPG = require('../../classes/utilities/RPG')
const Utils = require('../../classes/utilities/Utils')

module.exports = {
  name: Utils.getCmdName(__filename, __dirname),
  category: Utils.getCmdCategory(__filename),
  usage: 'create',
  aliases: [],
  permissions: ['SEND_MESSAGES'],
  timeout: 1000,

  execute(msg, args) {
    const player = new RPG(msg.member.id)
    if (player.hasAccount(msg)) return msg.replyEmbed(`You already have an account!`)
    player.create(msg)
  },

  help: {
    enabled: false,
    title: '',
    description: ``,
  }
}