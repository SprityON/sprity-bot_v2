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

    const player = new Player(msg.member)
    const receivablePoints = (Math.floor(Math.random() * 200) + 50) * await player.difficulty

    let points = await player.points

    const experience = Math.floor(Math.random() * 150) + 100
    const time = 10

    let minionHealth = await player.health * await player.difficulty
    let maxMinionHealth = await player.health * await player.difficulty

    let playerHealth = await player.health
    let playerMaxHealth = await player.health

    msg.replyEmbed(`Kill **${minionName}** (**${minionHealth}/${maxMinionHealth}**) to receive ${point} **${receivablePoints}**\n\nType \`fight\` or \`run\``,
      { title: `You encountered ${minionName}!)`, color: 'ff0000' })

    const lostPoints = (Math.floor(Math.random() * 100) + 50) * await player.difficulty

    const filter = m => m.author.id === msg.author.id

    while (true) {
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
        let damage = Math.floor(await player.attack * ((Math.random() * 0.2) + 0.85))

        minionHealth -= damage

        if (minionHealth < 1) {
          const runChance = Math.floor(Math.random() * 5) + 1

          if (runChance == 1) {
            return msg.replyEmbed(`Oh no, **${minionName}** ran away from you!`, { color: 'ff0000' })
          } else {
            points += receivablePoints
            DB.query(`update members set points = ${points} where member_id = ${msg.member.id}`)
            msg.replyEmbed(`You received ${point} **${receivablePoints}** points and **${experience}** XP because you killed **${minionName}**!`, { color: '00ff00' })
            return player.levelUp(experience, msg)
          }
        }

        msg.replyEmbed(`You did **${damage}** damage! ***${minionName}'s* HP: ${minionHealth}/${maxMinionHealth}**`, { color: 'ffff00' })

        damage = Math.floor(await player.attack * ((Math.random() * 0.2) + 0.85)) * await player.difficulty
        playerHealth -= damage

        setTimeout(() => {
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
      }
    }
  },

  help: {
    enabled: true,
    title: 'Fight a Minion',
    description: `Fight one of my Minions and receive points!`,
  }
}