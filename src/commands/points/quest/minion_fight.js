const Bot = require('../../../Bot')
const DB = require('../../../classes/database/DB')
const { sendEmbed } = require('../../../classes/utilities/AdvancedEmbed')
const Battle = require('../../../classes/utilities/Battle')
const Player = require('../../../classes/utilities/Player')
const Utils = require('../../../classes/utilities/Utils')

module.exports.execute = async (msg, args, quest) => {
  const point = Bot.client.emojis.cache.find(e => e.name === 'pointdiscord')
  const randomNumber = Math.floor(Math.random() * 998) + 1
  const minionName = `🤖 Minion #${randomNumber}`

  const player = new Player(msg.member)
  const inventory = await player.inventory
  const receivablePoints = Math.floor((Math.floor(Math.random() * 50) + 50) * await player.difficulty)

  const shop = require('../shop.json')
  let throwable = await player.throwable
  const shopThrowable = throwable ? shop.find(item => item.id === throwable.id) : null
  const throwableEmote = throwable ? (shopThrowable.uploaded ? Bot.client.emojis.cache.find(e => e.name === shopThrowable.emoji) : shopThrowable.emoji) : null

  let potion = await player.potion
  const shopPotion = potion ? shop.find(item => item.id === potion.id) : null
  const potionEmote = potion ? (shopPotion.uploaded ? Bot.client.emojis.cache.find(e => e.name === shopPotion.emoji) : shopPotion.emoji) : null

  let points = await player.points

  const time = 10

  let minionHealth = await player.hp * await player.difficulty
  let maxMinionHealth = await player.hp * await player.difficulty

  let playerHealth = await player.hp
  let playerMaxHealth = await player.hp

  const battle = new Battle(msg.member, {
    name: minionName,
    att: Math.floor(await player.att * ((Math.random() * 0.2) + 0.85)) * await player.difficulty,
    def: 0,
    hp: await player.hp * await player.difficulty
  })
  msg.reply({
    embeds: [sendEmbed(`Kill **${minionName}** (**${minionHealth}/${maxMinionHealth}**) to receive ${point} **${receivablePoints}**\n\nType \`attack\`, \`throw\`, \`potion\` or \`run\``,
      { title: `You encountered ${minionName}!)`, color: 'ff0000' })] })

  const lostPoints = (Math.floor(Math.random() * 50) + 50) * await player.difficulty

  const filter = m => m.author.id === msg.author.id

  while (true) {
    const collected = await msg.channel.awaitMessages({filter, timeout: time * 1000, max: 1 })
    const answer = collected.first().content.toLowerCase()

    if (answer === 'throw') {
      if (throwable) {
        throwable.amount -= 1

        minionHealth -= shopThrowable.damage

        if (minionHealth < 1) {
          points += receivablePoints

          throwable.amount < 1
            ? await DB.query(`update members set points = ${points}, throwable = '' where member_id = ${msg.member.id}`)
            : await DB.query(`update members set points = ${points}, throwable = ${JSON.stringify(throwable)} where member_id = ${msg.member.id}`)

          msg.reply({ embeds: [sendEmbed(`You killed **${minionName}**!`, { color: '00ff00' })]})
          return [true, inventory]
        }

        if (throwable.amount < 1) { await DB.query(`update members set points = ${points}, throwable = '' where member_id = ${msg.member.id}`) }
        else await DB.query(`update members set throwable = '[${JSON.stringify(throwable)}]' where member_id = ${msg.member.id}`)
        msg.reply({ embeds: [sendEmbed(`You threw a ${throwableEmote} **${shopThrowable.name}** and did **${shopThrowable.damage}** damage! ***${minionName}'s* HP: ${minionHealth}/${maxMinionHealth}**`, { color: 'ffff00' })] })
        await enemyTurn()
      } else msg.reply({ embeds: [sendEmbed(`You are not using a throwable!\n\nType \`attack\`, \`throw\`, \`potion\` or \`run\``, { color: 'ffff00' })] })
    }

    if (answer === 'potion') {
      if (potion) {
        if (playerHealth >= playerMaxHealth) {
          msg.reply({ embeds: [sendEmbed(`You are already at full health! ***Your* HP: ${playerHealth}/${playerMaxHealth}**\n\nType \`attack\`, \`throw\`, \`potion\` or \`run\``, { color: 'ffff00' })] })
        } else {
          potion.amount -= 1

          potion.amount < 1
            ? await DB.query(`update members set points = ${points}, potion = '' where member_id = ${msg.member.id}`)
            : await DB.query(`update members set points = ${points}, potion = '[${JSON.stringify(potion)}]' where member_id = ${msg.member.id}`)

          playerHealth += Math.floor(playerMaxHealth / shopPotion.heal_percentage)

          if (playerHealth >= playerMaxHealth) playerHealth = playerMaxHealth
          await DB.query(`update members set potion = ${JSON.stringify(potion)} where member_id = ${msg.member.id}`)
          msg.reply({ embeds: [sendEmbed(`You restored ${shopPotion.heal_percentage}% of your health by using ${potionEmote} **${shopPotion.name}**\n***Your* HP: ${playerHealth}/${playerMaxHealth}**`, { color: 'ffff00' })] })
          await enemyTurn()
        }

      } else msg.reply({ embeds: [sendEmbed(`You are not using a potion!\n\nType \`attack\`, \`throw\`, \`potion\` or \`run\``, { color: 'ffff00' })] })
    }

    if (answer === 'run') {
      const runChance = Math.floor(Math.random() * 3) + 1

      if (runChance == 1) {
        points -= lostPoints
        await DB.query(`update members set points = ${points} where member_id = ${msg.member.id}`)

        msg.reply({ embeds: [sendEmbed(`You couldn't run away!`, { color: 'ff0000' })] })
        return [false]
      } else {
        msg.reply({ embeds: [sendEmbed(`You successfully ran away from **${minionName}**!`, { color: '00ff00' })] })
        return ['skip']
      }
    }

    if (answer === 'attack') {
      const attack = await battle.attack()
      let hasWon = attack[0]
      let message = attack[1]
      
      if (hasWon === true) { msg.reply({ embeds: [sendEmbed(message)] }); return [true, inventory] } 
      else if (hasWon === false) { msg.reply({ embeds: [sendEmbed(message)] }); return ['skip'] } 
      else if (hasWon === 'skip') { 
        msg.reply({ embeds: [sendEmbed(message)] })

        await Utils.wait(1000)

        const enemyAttack = await battle.enemyActions.attack(playerHealth)
        hasWon = enemyAttack[0]
        message = enemyAttack[1]

        if (hasWon === true) { msg.reply({ embeds: [sendEmbed(message)] }); return [false, inventory] }
        else if (hasWon === false) { msg.reply({ embeds: [sendEmbed(message)] }); }
      }
    }

    if (playerHealth < 1) {
      points -= lostPoints
      await DB.query(`update members set points = ${points} where member_id = ${msg.member.id}`)
      return [false]
    }
    // rocket grab item for if minion runs away?
  }
}