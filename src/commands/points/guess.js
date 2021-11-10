const Utils = require('../../classes/utilities/Utils')
const Bot = require('../../Bot')
const { Discord } = require('../../Bot')
const DB = require('../../classes/database/DB')
const Player = require('../../classes/utilities/Player')

module.exports = {
  name: Utils.getCmdName(__filename, __dirname),
  category: Utils.getCmdCategory(__filename),
  usage: '',
  aliases: [],
  permissions: ['SEND_MESSAGES'],
  timeout: 1000,

  async execute(msg, args) {
    let tries = 3
    let hints = 1
    const lostPoints = Math.floor(Math.random() * 25) + 25
    const winPoints = Math.floor(Math.random() * 50) + 50
    const random = Math.floor(Math.random() * 10) + 1
    const player = new Player(msg.member)
    const points = await player.points
    const point = Bot.client.emojis.cache.find(e => e.name === 'pointdiscord')

    msg.replyEmbed(`Guess my number between **1 - 10** for ${point} **${winPoints}**. \n\nYou got **${tries}** tries and **1** hint!\nType \`stop\` to stop the game.`)

    const embed = new Discord.MessageEmbed().setColor('ffff00')

    let lastGuess = ''

    while (true) {
      embed.setColor('ffff00')
      const filter = m => m.author.id === msg.author.id

      const collected = await msg.channel.awaitMessages(filter, { timeout: 60000, max: 1 })
      const answer = collected.first().content

      // HINTS

      if (answer.toLowerCase() == 'stop') {
        return msg.replyEmbed(`Stopped the game.`)
      }

      else if (answer.toLowerCase() == 'hint') {
        if (hints == 0) {
          msg.replyEmbed(`You used all your hints!`)
        }

        else if (tries == 3) {
          msg.replyEmbed(`You have to take a guess first!`)
        }

        else {
          lastGuess < random
            ? msg.replyEmbed(`Your last guess (**${lastGuess}**) was lower then my number.`)
            : msg.replyEmbed(`Your last guess (**${lastGuess}**) was higher then my number.`)

          hints--
        }
      } else if (isNaN(answer)) {
        msg.replyEmbed(`That is not a number! Guess a number between **1 - 10**.`)
      } else if (answer == random) {
        DB.query(`update members set points = ${points + winPoints} where member_id = ${msg.member.id}`)

        embed.setDescription(`Your given number: **${answer}**\nYou guessed...`)

        const message = await msg.inlineReply(embed)

        const timer1 = async() => setTimeout(async() => {
          message.edit(embed.setDescription(`Your given number: **${answer}**\nYou guessed... right!`).setColor('00ff00'))

          const timer2 = async() => setTimeout(async() => {
            return message.edit(embed.setDescription(`Your given number: **${answer}**\nYou guessed... right!\n\nYou received ${point} **${winPoints}** points.`))
          }, 250);

          await timer2()
        }, 1000);

        await timer1()

        return 
      } else {
        tries--

        lastGuess = answer
        embed.setDescription(`Your given number: **${answer}**\nYou guessed...`)

        const message = await msg.inlineReply(embed)

        const timer1 = async() => setTimeout(async() => {
          message.edit(embed.setDescription(`Your given number: **${answer}**\nYou guessed... wrong!`).setColor('ff0000'))

          if (tries == 0) {
            const timer2 = async () => setTimeout(() => {
              message.edit(embed.setDescription(`Your given number: **${answer}**\nYou guessed... wrong!\n\n**${tries}** tries left.`))
            }, 250);

            await timer2()
          }
        }, 1000);

        if (tries == 0) {
          message.replyEmbed(`You couldn't guess my number, which was **${random}**, and lost ${point} **${lostPoints}**!`)
          return DB.query(`update members set points = ${points - lostPoints} where member_id = ${msg.member.id}`)
        }

        await timer1()
      }
    }
  },

  help: {
    enabled: true,
    title: 'Guess',
    description: `Guess a number and if right, earn points!`,
  }
}