const Utils = require('../../../classes/utilities/Utils')
const Bot = require('../../../Bot')
const { Discord } = require('../../../Bot')
const DB = require('../../../classes/database/DB')
const Player = require('../../../classes/utilities/Player')
const { sendEmbed } = require('../../../classes/utilities/AdvancedEmbed')
const { wait } = require('../../../classes/utilities/Utils')

module.exports = {
  name: Utils.getCmdName(__filename, __dirname),
  category: Utils.getCmdCategory(__filename),
  usage: '',
  aliases: [],
  permissions: ['SEND_MESSAGES'],
  timeout: 1000,

  async execute(msg, args, quest) {
    let tries = 3
    const random = Math.floor(Math.random() * 10) + 1
    const player = new Player(msg.member)
    const lostPoints = Math.floor((Math.floor(Math.random() * 25) + 25) * await player.difficulty)
    const winPoints = Math.floor((Math.floor(Math.random() * 50) + 50) * await player.difficulty)
    let hints = await player.difficulty < 1 ? 2 : 1
    const points = await player.points

    msg.reply({ embeds: [sendEmbed(`Guess my number between **1 - 10**. \n\nYou got **${tries}** tries and **${hints}** hint!`)] })

    const embed = new Discord.MessageEmbed().setColor('ffff00')

    let lastGuess = ''

    while (true) {
      embed.setColor('ffff00')
      const filter = m => m.author.id === msg.author.id

      const collected = await msg.channel.awaitMessages({filter, timeout: 60000, max: 1 })
      const answer = collected.first().content

      if (answer.toLowerCase() == 'hint') {
        if (hints == 0) {
          msg.reply({ embeds: [sendEmbed(`You used all your hints!`)] })
        }

        else if (tries == 3) {
          msg.reply({ embeds: [sendEmbed(`You have to take a guess first!`)] })
        }

        else {

          lastGuess < random
            ? msg.reply({ embeds: [sendEmbed(`Your last guess (**${lastGuess}**) was lower then my number. **${hints - 1}** hints left.`)] })
            : msg.reply({ embeds: [sendEmbed(`Your last guess (**${lastGuess}**) was higher then my number. **${hints - 1}** hints left.`)] })


          hints--
        }
      } else if (isNaN(answer)) {
        msg.reply({ embeds: [sendEmbed(`That is not a number! Guess a number between **1 - 10**.`)] })
      } else if (answer == random) {
        await DB.query(`update members set points = ${points + winPoints} where member_id = ${msg.member.id}`)

        embed.setDescription(`Your given number: **${answer}**\nYou guessed...`)

        const message = await msg.reply({ embeds: [embed]} )

        await wait(1000)
        embed.setDescription(`Your given number: **${answer}**\nYou guessed... right!`).setColor('00ff00')

        message.edit({ embeds: [embed] })

        await wait(250)
        embed.setDescription(`Your given number: **${answer}**\nYou guessed... right!`)

        message.edit({ embeds: [embed] })

        return [true]
      } else {
        tries--

        lastGuess = answer
        embed.setDescription(`Your given number: **${answer}**\nYou guessed...`)

        const message = await msg.reply({ embeds: [embed] })

        await wait(1000)
        embed.setDescription(`Your given number: **${answer}**\nYou guessed... wrong!`).setColor('ff0000') 

        message.edit({ embeds: [embed]})

        await wait(250)
        embed.setDescription(`Your given number: **${answer}**\nYou guessed... wrong!\n\n**${tries}** tries left.`) 

        message.edit({ embeds: [embed]})

        if (tries == 0) {
          message.reply({ embeds: [sendEmbed(`You couldn't guess my number, which was **${random}**!`)] })
          await DB.query(`update members set points = ${points - lostPoints} where member_id = ${msg.member.id}`)
          return [false]
        }
      }
    }
  },

  help: {
    enabled: true,
    title: 'Guess',
    description: `Guess a number and if right, earn points!`,
  }
}