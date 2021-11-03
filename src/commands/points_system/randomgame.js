const DB = require('../../classes/database/DB')
const RPG = require('../../classes/utilities/RPG')
const Utils = require('../../classes/utilities/Utils')

module.exports = {
  name: Utils.getCmdName(__filename, __dirname),
  category: Utils.getCmdCategory(__filename),
  usage: 'randomgame',
  aliases: ['rg'],
  permissions: ['SEND_MESSAGES'],
  timeout: 5000,
  points: true,

  async execute(msg, args) {
    const player = new RPG(msg.member)
    let points = await player.points

    // wordgame
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

    const sentence = sentences[Math.floor(Math.random() * sentences.length)]
    const time = (sentence.length + 0.5) * 0.2
    msg.replyEmbed(`**Hurry!** Type in:\n\`${sentence}\``, { title: `Game: Wordgame (${time.toFixed(1)}s)`, color: 'ffff00' })

    const filter = m => m.author.id === msg.author.id
    msg.channel.awaitMessages(filter, {time: time * 1000, max: 1})
    .then(collected => {
      if (collected.first().content === sentence) {
        const won = Math.floor(Math.random() * 175) + 25
        collected.first().replyEmbed(`What a typer you are. You won **${won}** points!`, { color: '00ff00' })

        DB.query(`update members set points = ${points += won} where member_id = ${msg.member.id}`)
      } else {
        const lost = Math.floor(Math.random() * 450) + 50
        collected.first().replyEmbed(`You typed in the wrong sentence and lost **${lost}** points!`, { color: 'ff0000' })

        DB.query(`update members set points = ${points -= lost} where member_id = ${msg.member.id}`)
      }
    }).catch(collected => {
      const lost = Math.floor(Math.random() * 450) + 50
      collected.first().replyEmbed(`You were too late and lost **${lost}** points!`, { color: 'ff0000' })

      DB.query(`update members set points = ${points -= lost} where member_id = ${msg.member.id}`)
    })
  },

  help: {
    enabled: true,
    title: 'Random Game',
    description: `Play a random game to earn points!`,
  }
}