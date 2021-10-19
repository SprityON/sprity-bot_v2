const RPG = require('../../classes/utilities/RPG')
const Utils = require('../../classes/utilities/Utils')

module.exports = {
  name: Utils.getCmdName(__filename, __dirname),
  category: Utils.getCmdCategory(__filename),
  usage: '',
  aliases: [],
  permissions: ['SEND_MESSAGES'],
  timeout: 1000,

  async execute(msg, args) {
    const player = new RPG(msg.member)
    const points = await player.inventory

    msg.replyEmbed(`You have **${Utils.normalizePrice(points[0].points)}** points!`)
  },

  help: {
    enabled: true,
    title: 'Points',
    description: `See how many points you currently have.`,
  }
}