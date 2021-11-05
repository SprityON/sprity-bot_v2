const Player = require('../../classes/utilities/Player')
const Utils = require('../../classes/utilities/Utils')

module.exports = {
  name: Utils.getCmdName(__filename, __dirname),
  category: Utils.getCmdCategory(__filename),
  usage: 'balance',
  aliases: ['bal'],
  permissions: ['SEND_MESSAGES'],
  timeout: 1000,
  points: true,

  async execute(msg, args) {
    const player = new Player(msg.member)
    const points = await player.points

    msg.replyEmbed(`You have :yellow_circle: **${Utils.normalizePrice(points)}** points!`)
  },

  help: {
    enabled: true,
    title: 'Balance',
    description: `See how many points you currently have.`,
  }
}