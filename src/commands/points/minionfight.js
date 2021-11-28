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
    const receivablePoints = Math.floor((Math.floor(Math.random() * 50) + 50) * await player.difficulty)

    const shop = require('./shop.json')
    let throwable = await player.throwable
    const shopThrowable = throwable ? shop.find(item => item.id === throwable.id) : null
    const throwableEmote = throwable ? (shopThrowable.uploaded ? Bot.client.emojis.cache.find(e => e.name === shopThrowable.emoji) : shopThrowable.emoji) : null

    let potion = await player.potion
    const shopPotion = potion ? shop.find(item => item.id === potion.id) : null
    const potionEmote = potion ? (shopPotion.uploaded ? Bot.client.emojis.cache.find(e => e.name === shopPotion.emoji) : shopPotion.emoji) : null

    let points = await player.points

    const experience = Math.floor(Math.random() * 100) + 50
    const time = 10

    let minionHealth = await player.health * await player.difficulty
    let maxMinionHealth = await player.health * await player.difficulty

    let playerHealth = await player.health
    let playerMaxHealth = await player.health

    msg.replyEmbed(`Kill **${minionName}** (**${minionHealth}/${maxMinionHealth}**) to receive ${point} **${receivablePoints}**\n\nType \`attack\`, \`throw\`, \`potion\` or \`run\``,
      { title: `You encountered ${minionName}!)`, color: 'ff0000' })

    const lostPoints = (Math.floor(Math.random() * 50) + 50) * await player.difficulty

    const filter = m => m.author.id === msg.author.id

    while (true) {
      const collected = await msg.channel.awaitMessages(filter, { timeout: time * 1000, max: 1 })
      const answer = collected.first().content.toLowerCase()

      if (answer === 'throw') {
        if (throwable) {
          throwable.amount -= 1

          minionHealth -= shopThrowable.damage

          if (minionHealth < 1) {
            points += receivablePoints

            throwable.amount < 1
              ? DB.query(`update members set points = ${points}, throwable = '' where member_id = ${msg.member.id}`)
              : DB.query(`update members set points = ${points}, throwable = ${JSON.stringify(throwable)} where member_id = ${msg.member.id}`)
            
            msg.replyEmbed(`You received ${point} **${receivablePoints}** points and **${experience}** XP because you killed **${minionName}**!`, { color: '00ff00' })
            return player.levelUp(experience, msg)
          } 

          if (throwable.amount < 1) { DB.query(`update members set points = ${points}, throwable = '' where member_id = ${msg.member.id}`) }
          else DB.query(`update members set throwable = '[${JSON.stringify(throwable)}]' where member_id = ${msg.member.id}`)

          msg.replyEmbed(`You threw a ${throwableEmote} **${shopThrowable.name}** and did **${shopThrowable.damage}** damage! ***${minionName}'s* HP: ${minionHealth}/${maxMinionHealth}**`, { color: 'ffff00' } )
          await enemyTurn()
        } else msg.replyEmbed(`You are not using a throwable!\n\nType \`attack\`, \`throw\`, \`potion\` or \`run\``, { color: 'ffff00' } )
      }

      if (answer === 'potion') {
        if (potion) {
          if (playerHealth >= playerMaxHealth) {
            msg.replyEmbed(`You are already at full health! ***Your* HP: ${playerHealth}/${playerMaxHealth}**\n\nType \`attack\`, \`throw\`, \`potion\` or \`run\``, { color: 'ffff00' } )
          } else {
            potion.amount -= 1

            potion.amount < 1
              ? DB.query(`update members set points = ${points}, potion = '' where member_id = ${msg.member.id}`)
              : DB.query(`update members set points = ${points}, potion = '[${JSON.stringify(potion)}]' where member_id = ${msg.member.id}`)

            playerHealth += Math.floor(playerMaxHealth / shopPotion.heal_percentage)

            if (playerHealth >= playerMaxHealth) playerHealth = playerMaxHealth
            DB.query(`update members set potion = ${JSON.stringify(potion)} where member_id = ${msg.member.id}`)

            msg.replyEmbed(`You restored ${shopPotion.heal_percentage}% of your health by using ${potionEmote} **${shopPotion.name}**\n***Your* HP: ${playerHealth}/${playerMaxHealth}**`, { color: 'ffff00' })
            await enemyTurn()
          }
          
        } else msg.replyEmbed(`You are not using a potion!\n\nType \`attack\`, \`throw\`, \`potion\` or \`run\``, { color: 'ffff00' } )
      }

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

      if (answer === 'attack') {
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

        await enemyTurn()
      }
      
      async function enemyTurn() {
        const damage = Math.floor(await player.attack * ((Math.random() * 0.2) + 0.85)) * await player.difficulty
        playerHealth -= damage

        setTimeout(() => {
          if (playerHealth < 1) {
            msg.replyEmbed(`**${minionName}** did **${damage}** damage and you died with **${playerHealth}** HP! You lost ${point} **${lostPoints}** points.`, { color: 'ff0000' })
          } else {
            msg.replyEmbed(`**${minionName}** did **${damage}** damage. ***Your* HP: ${playerHealth}/${playerMaxHealth}**\n\nType \`attack\`, \`throw\`, \`potion\` or \`run\``, { color: 'ffff00' })
          }
        }, 1000);
      }

      if (playerHealth < 1) {
        points -= lostPoints
        DB.query(`update members set points = ${points} where member_id = ${msg.member.id}`)
        return
      }
    }
  },

  help: {
    enabled: true,
    title: 'Fight a Minion',
    description: `Fight one of my Minions and receive points!`,
  }
}