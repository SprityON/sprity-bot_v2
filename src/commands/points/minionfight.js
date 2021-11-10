const Bot = require('../../Bot')
const DB = require('../../classes/database/DB')
const Player = require('../../classes/utilities/Player')
const Utils = require('../../classes/utilities/Utils')

module.exports = {
  name: Utils.getCmdName(__filename, __dirname),
  category: Utils.getCmdCategory(__filename),
  usage: '',
  aliases: ['mf'],
  permissions: ['SEND_MESSAGES'],
  timeout: 1000,

  async execute(msg, args) {
    const point = Bot.client.emojis.cache.find(e => e.name === 'pointdiscord')
    const randomNumber = Math.floor(Math.random() * 998) + 1
    const minionName = `🤖 Minion #${randomNumber}`
    const receivablePoints = Math.floor(Math.random() * 200) + 50

    const time = 10

    let minionHealth = 100
    let maxMinionHealth = 100

    let playerHealth = 100
    let playerMaxHealth = 100

    msg.replyEmbed(`Kill **${minionName}** (**${minionHealth}/${maxMinionHealth}**) to receive ${point} **${receivablePoints}**\n\nType \`fight\` or \`run\``,
      { title: `You encountered ${minionName}! (${time}s)`, color: 'ff0000' })

    const player = new Player(msg.member)
    let points = await player.points

    const lostPoints = Math.floor(Math.random() * 100) + 50

    const filter = m => m.author.id === msg.author.id

    while (true) {
      // player
      const collected = await msg.channel.awaitMessages(filter, { timeout: time * 1000, max: 1 })
      const answer = collected.first().content.toLowerCase()

      if (answer === 'run') {
        const runChance = Math.floor(Math.random() * 3) + 1

        if (runChance == 1) {
          points -= lostPoints
          DB.query(`update members set points = ${points} where member_id = ${msg.member.id}`)
          return msg.replyEmbed(`You couldn't run away and lost ${point} **${lostPoints}** points!`, { color: 'ff0000' })
        } else {
          return msg.replyEmbed(`You successfully ran away from **${minionName}**!`, { color: '00ff00' })
        }
      }

      if (answer === 'fight') {
        const damage = Math.floor(Math.random() * 15) + 10

        minionHealth -= damage

        if (minionHealth < 1) {
          const runChance = Math.floor(Math.random() * 3) + 1

          if (runChance == 1) {
            return msg.replyEmbed(`Oh no, **${minionName}** ran away from you!`, { color: 'ff0000' })
          } else {
            points += receivablePoints
            DB.query(`update members set points = ${points} where member_id = ${msg.member.id}`)
            return msg.replyEmbed(`You received ${point} **${receivablePoints}** points because you killed **${minionName}**!`, { color: '00ff00' })
          }
        }

        msg.replyEmbed(`You did **${damage}** damage! ***${minionName}'s* HP: ${minionHealth}/${maxMinionHealth}**`, { color: 'ffff00' })

        const timer = async() => setTimeout(() => {
          const damage = Math.floor(Math.random() * 15) + 10
          playerHealth -= damage

          if (playerHealth < 1) {
            msg.replyEmbed(`**${minionName}** did **${damage}** damage and you died with **${playerHealth}** HP! You lost ${point} **${lostPoints}** points.`, { color: 'ff0000' })
          } else {
            msg.replyEmbed(`**${minionName}** did **${damage}** damage. ***Your* HP: ${playerHealth}/${playerMaxHealth}**\n\nType \`fight\` or \`run\``, { color: 'ffff00' })
          }
        }, 1000);

        if (playerHealth < 1) {
          points -= lostPoints
          DB.query(`update members set points = ${points} where member_id = ${msg.member.id}`)
          return
        }

        await timer()
      }
    }

    return
  },

  help: {
    enabled: true,
    title: 'Fight a Minion',
    description: `Fight one of my Minions and receive points!`,
  }
}