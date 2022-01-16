const Utils = require('../../classes/utilities/Utils')
const Player = require('../../classes/utilities/Player')
const { sendEmbed } = require('../../classes/utilities/AdvancedEmbed')

module.exports = {
  name: Utils.getCmdName(__filename, __dirname),
  category: Utils.getCmdCategory(__filename),
  usage: 'delete',
  aliases: [],
  permissions: ['SEND_MESSAGES'],
  timeout: 1000,

  async execute(msg, args) {
    const player = new Player(msg.member)
    player.delete(msg)
  },

  help: {
    enabled: true,
    title: 'Delete Account',
    description: `Delete your account from the points system.`,
  }
}