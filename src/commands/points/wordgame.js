const Bot = require('../../Bot')
const DB = require('../../classes/database/DB')
const Player = require('../../classes/utilities/Player')
const Utils = require('../../classes/utilities/Utils')

module.exports = {
  name: Utils.getCmdName(__filename, __dirname),
  category: Utils.getCmdCategory(__filename),
  usage: '',
  aliases: ['wg'],
  permissions: ['SEND_MESSAGES'],
  timeout: 1000,

  async execute(msg, args) {
    const point = Bot.client.emojis.cache.find(e => e.name === 'pointdiscord')
    const sentences = [
      `type this in or you are dead`,
      `suggest sentences with my suggestion command`,
      `lets play minecraft on my server`,
      `mrbeast is a good guy`,
      `all for the points...`,
      `work, work, work`,
      `type, type, type`,
      `i love my staff`,
      `hello i am made of computer code`,
      `the matrix is a great movie`,
      `created in javascript`,
      `made by Sprity`
    ]

    const player = new Player(msg.member)
    const points = await player.points
    const sentence = sentences[Math.floor(Math.random() * sentences.length)]
    const time = (sentence.length * 0.25) + 0.5
    msg.replyEmbed(`**Hurry!** Type in:\n\`${sentence}\``, { title: `Game: Wordgame (${time.toFixed(1)}s)`, color: 'ffff00' })

    const filter = m => m.author.id === msg.author.id
    await msg.channel.awaitMessages(filter, { time: time * 1000, max: 1 })
      .then(async collected => {
        let points = await player.points
        if ((collected.first().content.charAt(0).toLowerCase() + collected.first().content.slice(1)) === sentence) {
          const won = Math.floor(Math.random() * 25) + 25
          collected.first().replyEmbed(`What a typer you are. You won ${point} **${won}** points!`, { color: '00ff00' })

          DB.query(`update members set points = ${points += won} where member_id = ${msg.member.id}`)
        } else {
          const lost = Math.floor(Math.random() * 25) + 25
          collected.first().replyEmbed(`You typed in the wrong sentence and lost ${point} **${lost}** points!`, { color: 'ff0000' })

          DB.query(`update members set points = ${points -= lost} where member_id = ${msg.member.id}`)
        }


      }).catch(collected => {
        const lost = Math.floor(Math.random() * 25) + 25
        msg.replyEmbed(`You were too late and lost ${point} **${lost}** points!`, { color: 'ff0000' })

        DB.query(`update members set points = ${points - lost} where member_id = ${msg.member.id}`)
      })
  },

  help: {
    enabled: true,
    title: 'Wordgame',
    description: `Type the world correctly to receive points!`,
  }
}