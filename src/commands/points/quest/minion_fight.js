const { sendEmbed } = require('../../../classes/utilities/AdvancedEmbed')
const Battle = require('../../../classes/utilities/Battle')
const Enemy = require('../../../classes/utilities/Enemy')
const Player = require('../../../classes/utilities/Player')
const Utils = require('../../../classes/utilities/Utils')

module.exports.execute = async (msg, args, quest) => {
  const player = new Player(msg.member, msg)
  const inventory = await player.inventory
  const stats = await player.stats
  player.setHP = { current: stats.health, max: stats.health }

  const throwable = await player.throwable

  const enemy = new Enemy(player)
  enemy.setName = `🤖 Minion #${Math.floor(Math.random() * 998) + 1}`
  enemy.setHP = ((stats.health / stats.attack) * stats.attack) * await player.difficulty

  const battle = new Battle(player, enemy)
  
  msg.reply({
    embeds: [sendEmbed(`Kill **${enemy.name}** (**${enemy.hp.current}/${enemy.hp.max}**) to steal its loot!\n\nType \`attack\`, \`throw\`, \`potion\` or \`run\``,
      { title: `You encountered ${enemy.name}!`, color: Utils.colors.red })] })

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

          const [hasWon, message1] = await enemy.attack()

          msg.reply(message1);
          if (!hasWon) return [false, inventory]
        }
      } else msg.reply({ embeds: [sendEmbed(`You are not using a throwable!\n\nType \`attack\`, \`throw\`, \`potion\` or \`run\``, { color: Utils.colors.yellow})] })
    }

    if (answer === 'potion') {
      if (player.potion) {
        const [hasWon, message] = await battle.usePotion()

        if (hasWon === true) {
          msg.reply(message + `\n\nType \`attack\`, \`throw\`, \`potion\` or \`run\``)
          return [true, inventory]
        } else {
          msg.reply(message + `\n\nType \`attack\`, \`throw\`, \`potion\` or \`run\``)

          await Utils.wait(1000)

          const [hasWon, message1] = await enemy.attack()

          msg.reply(message1);
          if (hasWon) return [false, inventory]
        }
      } else msg.reply({ embeds: [sendEmbed(`You are not using a potion!\n\nType \`attack\`, \`throw\`, \`potion\` or \`run\``, { color: Utils.colors.yellow })] })
    }

    if (answer === 'run') {
      const [bool, message] = battle.run()

      if (bool === true) {
        msg.reply(message)
        return ['skip']
      } else {
        msg.reply(message)
        return [false]
      }
    }

    if (answer === 'attack') {
      let [hasWon, message] = await battle.attack()
      
      if (hasWon === true) { msg.reply(message); return [true, inventory] } 
      else if (hasWon === false) { msg.reply(message); return ['skip'] } 
      else if (hasWon === 'skip') { 
        msg.reply(message)

        await Utils.wait(1000)

        let [enemyWon, message1] = await enemy.attack()

        if (enemyWon === true) { msg.reply(message1); return [false, inventory] }
        else if (enemyWon === false) { msg.reply(message1); }
      }
    }
  }
}