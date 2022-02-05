const { sendEmbed } = require('../../../classes/utilities/AdvancedEmbed')
const Battle = require('../../../classes/utilities/Battle')
const Enemy = require('../../../classes/utilities/Enemy')
const Player = require('../../../classes/utilities/Player')
const Utils = require('../../../classes/utilities/Utils')

module.exports.execute = async (msg, args, quest) => {
  const player = new Player(msg.member, msg)
  const inventory = await player.inventory
  const stats = await player.stats
  let throwable = await player.throwable

  player.setHP = { current: stats.health, max: stats.health }

  const enemy = new Enemy(player)
  enemy.setName = `🤖 Minion #${Math.floor(Math.random() * 998) + 1}`
  enemy.setHP = player.hp.max * await player.difficulty

  const battle = new Battle(player, enemy)
  
  msg.reply({
    embeds: [sendEmbed(`Kill **${enemy.name}** (**${enemy.hp.current}/${enemy.hp.max}**) to steal its loot!\n\nType \`attack\`, \`throw\`, \`potion\` or \`run\``,
      { title: `You encountered ${enemy.name}!`, color: 'ff0000' })] })

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

          const [hasWon, message] = await enemy.attack()

          msg.reply({ embeds: [sendEmbed(message)] });
          if (!hasWon) return [false, inventory]
        }
      } else msg.reply({ embeds: [sendEmbed(`You are not using a throwable!\n\nType \`attack\`, \`throw\`, \`potion\` or \`run\``, { color: 'ffff00' })] })
    }

    if (answer === 'potion') {
      if (player.potion) {
        battle.usePotion()
        .then(message => msg.reply(message))

        await Utils.wait(1000)
      } else msg.reply({ embeds: [sendEmbed(`You are not using a potion!\n\nType \`attack\`, \`throw\`, \`potion\` or \`run\``, { color: 'ffff00' })] })
    }

    if (answer === 'run') {
      console.log(battle.run());
      if (battle.run() === true) {
        msg.reply({ embeds: [sendEmbed(`You successfully ran away from **${enemy.name}**!`, { color: '00ff00' })] })
        return [true]
      } else {
        msg.reply({ embeds: [sendEmbed(`You couldn't run away from ${enemy.name}!`, { color: 'ff0000' })] })
        return [false]
      }
    }

    if (answer === 'attack') {
      let [hasWon, message] = await battle.attack()
      
      if (hasWon === true) { msg.reply({ embeds: [sendEmbed(message)] }); return [true, inventory] } 
      else if (hasWon === false) { msg.reply({ embeds: [sendEmbed(message)] }); return ['skip'] } 
      else if (hasWon === 'skip') { 
        msg.reply({ embeds: [sendEmbed(message)] })

        await Utils.wait(1000)

        let [enemyWon, message1] = await enemy.attack()

        if (enemyWon === true) { msg.reply({ embeds: [sendEmbed(message1)] }); return [false, inventory] }
        else if (enemyWon === false) { msg.reply({ embeds: [sendEmbed(message1)] }); }
      }
    }
  }
}