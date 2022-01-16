const Bot = require('../../Bot')
const Player = require('../../classes/utilities/Player')
const Utils = require('../../classes/utilities/Utils')
const { sendEmbed } = require('../../classes/utilities/AdvancedEmbed.js')

module.exports = {
  name: Utils.getCmdName(__filename, __dirname),
  category: Utils.getCmdCategory(__filename),
  usage: 'balance <member>',
  aliases: ['bal'],
  permissions: ['SEND_MESSAGES'],
  timeout: 1000,

  async execute(msg, args) {
    const mention = msg.mentions.members.first()
    const player = mention ? new Player(mention) : new Player(msg.member)
    const points = await player.points

    const point = Bot.client.emojis.cache.find(e => e.name === 'pointdiscord')
    msg.reply({ embeds: [sendEmbed(`You have ${point} **${Utils.normalizePrice(points)}** points!`, { footer: 'you can also view your full profile!' })] })
  },

  help: {
    enabled: true,
    title: 'Balance',
    description: `See how many points you currently have.`,
  }
}