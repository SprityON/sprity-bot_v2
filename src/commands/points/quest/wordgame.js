const Bot = require('../../../Bot')
const DB = require('../../../classes/database/DB')
const Player = require('../../../classes/utilities/Player')

module.exports.execute = async (msg, args) => {
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

  const sentence = sentences[Math.floor(Math.random() * sentences.length)]
  const time = ((sentence.length * 0.25) + 0.5) / await player.difficulty
  msg.replyEmbed(`**Hurry!** Type in:\n\`${sentence}\``, { title: `Game: Wordgame (${time.toFixed(1)}s)`, color: 'ffff00' })

  const filter = m => m.author.id === msg.author.id
  const collected = await msg.channel.awaitMessages(filter, { time: time * 1000, max: 1 })

  if (!collected.first().content) {
    msg.replyEmbed(`You were too late!`, { color: 'ff0000' })
    return [false]
  }

  if ((collected.first().content.charAt(0).toLowerCase() + collected.first().content.slice(1)) === sentence) {
    collected.first().replyEmbed(`Good job! You typed the sentence correctly.`, { color: '00ff00' })
    return [true]
  } else {
    collected.first().replyEmbed(`You typed in the wrong sentence!`, { color: 'ff0000' })
    return [false]
  }
}