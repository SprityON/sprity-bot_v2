const Utils = require('../../classes/utilities/Utils')
const RPG = require('../../classes/utilities/RPG')

module.exports = {
  name: Utils.getCmdName(__filename, __dirname),
  category: Utils.getCmdCategory(__filename),
  usage: 'delete',
  aliases: [],
  permissions: ['SEND_MESSAGES'],
  timeout: 1000,
  points: true,

  execute(msg, args) {
    const player = new RPG(msg.member.id)
    player.delete(msg)
  },

  help: {
    enabled: false,
    title: '',
    description: ``,
  }
}