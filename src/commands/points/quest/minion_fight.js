const Bot = require('../../../Bot')
const DB = require('../../../classes/database/DB')
const { sendEmbed } = require('../../../classes/utilities/AdvancedEmbed')
const Battle = require('../../../classes/utilities/Battle')
const Player = require('../../../classes/utilities/Player')
const Utils = require('../../../classes/utilities/Utils')

module.exports.execute = async (msg, args, quest) => {
  const randomNumber = Math.floor(Math.random() * 998) + 1
  const minionName = `🤖 Minion #${randomNumber}`

  const player = new Player(msg.member)
  const inventory = await player.inventory
  const stats = await player.stats
  let throwable = await player.throwable

  player.setHP = { current: stats.health, max: stats.health }

  let minionHealth = Math.floor(player.hp.max * await player.difficulty)
  let maxMinionHealth = minionHealth

  const battle = new Battle(player, {
    name: minionName,
    att: Math.floor(Math.floor(await player.att * ((Math.random() * 0.2) + 0.85)) * await player.difficulty),
    def: 0,
    hp: minionHealth
  })
  
  msg.reply({
    embeds: [sendEmbed(`Kill **${minionName}** (**${minionHealth}/${maxMinionHealth}**) to steal its loot!\n\nType \`attack\`, \`throw\`, \`potion\` or \`run\``,
      { title: `You encountered ${minionName}!)`, color: 'ff0000' })] })

  const filter = m => m.author.id === msg.author.id

  while (true) {
    const collected = await msg.channel.awaitMessages({filter, timeout: 60000, max: 1 }).catch(() => msg.reply({embeds:[sendEmbed(`You took too long!`)]}))
    const answer = collected.first().content.toLowerCase()

    if (answer === 'throw') {
      if (throwable) {
        const [hasWon, message] = await battle.useThrowable()

        if (hasWon === true) {
          msg.reply(message)
          return [true, inventory]
        } else {
          msg.reply(message)

          await Utils.wait(1000)

          const [hasWon, message] = await battle.enemyActions.attack()

          if (hasWon === true) { msg.reply({ embeds: [sendEmbed(message)] }); return [false, inventory] }
          else if (hasWon === false) { msg.reply({ embeds: [sendEmbed(message)] }); }
        }
      } else msg.reply({ embeds: [sendEmbed(`You are not using a throwable!\n\nType \`attack\`, \`throw\`, \`potion\` or \`run\``, { color: 'ffff00' })] })
    }

    if (answer === 'potion') {
      if (player.potion) {
        const [fullHP, message] = await battle.usePotion()

        if (fullHP) { msg.reply(message) } else {
          msg.reply(message)
        }

        await Utils.wait(1000)
      } else msg.reply({ embeds: [sendEmbed(`You are not using a potion!\n\nType \`attack\`, \`throw\`, \`potion\` or \`run\``, { color: 'ffff00' })] })
    }

    if (answer === 'run') {
      const runChance = Math.floor(Math.random() * 3) + 1

      if (runChance == 1) {
        msg.reply({ embeds: [sendEmbed(`You couldn't run away!`, { color: 'ff0000' })] })
        return [false]
      } else {
        msg.reply({ embeds: [sendEmbed(`You successfully ran away from **${minionName}**!`, { color: '00ff00' })] })
        return ['skip']
      }
    }

    if (answer === 'attack') {
      let [hasWon, message] = await battle.attack()
      
      if (hasWon === true) { msg.reply({ embeds: [sendEmbed(message)] }); return [true, inventory] } 
      else if (hasWon === false) { msg.reply({ embeds: [sendEmbed(message)] }); return ['skip'] } 
      else if (hasWon === 'skip') { 
        msg.reply({ embeds: [sendEmbed(message)] })

        await Utils.wait(1000)

        let [enemyWon, message1] = await battle.enemyActions.attack()

        if (enemyWon === true) { msg.reply({ embeds: [sendEmbed(message1)] }); return [false, inventory] }
        else if (enemyWon === false) { msg.reply({ embeds: [sendEmbed(message1)] }); }
      }
    }
    // rocket grab item for if minion runs away?
  }
}