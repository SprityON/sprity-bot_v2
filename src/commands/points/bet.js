const Bot = require('../../Bot')
const DB = require('../../classes/database/DB')
const Player = require('../../classes/utilities/Player')
const Utils = require('../../classes/utilities/Utils')

module.exports = {
  name: Utils.getCmdName(__filename, __dirname),
  category: Utils.getCmdCategory(__filename),
  usage: 'bet <amount>',
  aliases: ['gamble', 'roll'],
  permissions: ['SEND_MESSAGES'],
  timeout: 1000,

  async execute(msg, args) {
    if (!args[0] || isNaN(args[0])) return msg.replyEmbed(`Please type a number to bet!`)

    const player = new Player(msg.member)
    const points = await player.points
    const point = Bot.client.emojis.cache.find(e => e.name === 'pointdiscord')
    const number = Number(args[0])

    if (number > points) return msg.replyEmbed(`You do not have that many points!`)
    if (number < 500) return msg.replyEmbed(`You can only bet with 500 points or higher!`)

    const diceBot = Math.floor(Math.random() * 5 + 1)
    const dicePlayer = Math.floor(Math.random() * 5 + 1)

    if (dicePlayer > diceBot) {
      msg.replyEmbed([
        [`${msg.author.username} rolled:`, `\`${dicePlayer}\``],
        [`${msg.guild.me.user.username} rolled:`, `\`${diceBot}\``]
      ], { color: '00ff00', inline: true, title: 'You won the bet!', description: `You received ${point} **${number}** points` })
      await DB.query(`update members set points = ${points + number} where member_id = ${msg.member.id}`)
    } else if (dicePlayer < diceBot) {
      msg.replyEmbed([
        [msg.author.username, `\`${dicePlayer}\``],
        [msg.guild.me.user.username, `\`${diceBot}\``]
      ], { color: 'ff0000', inline: true, title: 'You lost the bet!', description: `You lost ${point} **${number}** points` })
      await DB.query(`update members set points = ${points - number} where member_id = ${msg.member.id}`)
    } else msg.replyEmbed([
        [msg.author.username, `\`${dicePlayer}\``],
        [msg.guild.me.user.username, `\`${diceBot}\``]
      ], { color: 'ff0000', inline: true, title: 'It was a tie!', description: `You did not lose any ${point} points` })
  },

  help: {
    enabled: true,
    title: 'Bet',
    description: `Roll a dice and earn points!`,
  }
}