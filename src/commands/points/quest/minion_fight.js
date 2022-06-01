const { sendEmbed } = require('../../../classes/utilities/AdvancedEmbed')
const Battle = require('../../../classes/utilities/Battle')
const Enemy = require('../../../classes/utilities/Enemy')
const Player = require('../../../classes/utilities/Player')
const Utils = require('../../../classes/utilities/Utils')

module.exports.execute = async (msg, args, quest) => {
  const player = await (new Player(msg.member, msg)).load()

  const battle = new Battle()

  const enemy = (await (new Enemy(player, battle).load()))
  .setName(`🤖 Minion #${Math.floor(Math.random() * 998) + 1}`)

  battle.player = player
  battle.enemy = enemy

  battle.embedActions
    .setTitle(`You encountered ${enemy.name}!`)
    .setDescription(`Kill ${enemy.name} to steal its loot!`)
    .setColor(Utils.colors.red)

  battle.embedActions.updateBattle(99)

  const inventory = await player.inventory
  const throwable = await player.throwable
  const message = await msg.reply({ embeds: [battle.embed], components: [battle.embedActions.getActionButtons()] })

  let filter = interaction => interaction.customId.startsWith('battle') && interaction.user.id === msg.member.id

  let hasWon = ''
  while (true) {
    const interaction = await msg.channel.awaitMessageComponent({ filter, time: 60000, max: 1 }).catch(err => {
      message.edit({ embeds: [battle.embed], components: [battle.embedActions.getActionButtons(true)] })
    })

    if (!interaction) break

    if (interaction.member.id !== msg.member.id) {
      interaction.reply({ embeds: [sendEmbed(Utils.messages.unusable_interaction)], ephemeral: true })
      continue;
    }

    const selected = interaction.customId

    if (selected === 'battle_history') {
      battle.embedActions.showHistory()
      interaction.update({ embeds: [battle.embed], components: [battle.embedActions.getHistoryButtons()] });
    }

    if (selected === 'battle_present') {
      battle.embedActions.showBattle()
      interaction.update({ embeds: [battle.embed.setColor(Utils.colors.red)], components: [battle.embedActions.getActionButtons()] });
    }

    if (selected === 'battle_throw') {
      if (throwable) {
        hasWon = await battle.useThrowable()

        if (hasWon === true) {
          interaction.update({ embeds: [battle.embed.setColor(Utils.colors.green)], components: [battle.embedActions.getActionButtons(true)] });
          return [true, inventory]
        } else {
          interaction.message.edit({ embeds: [battle.embed], components: [battle.embedActions.getActionButtons()] });

          await Utils.wait(1000);

          hasWon = await enemy.attack()

          if (hasWon === true) {
            interaction.update({ embeds: [battle.embed.setColor(Utils.colors.red)], components: [battle.embedActions.getActionButtons(true)] });
            return [false, inventory]
          } else interaction.update({ embeds: [battle.embed], components: [battle.embedActions.getActionButtons()] });
        }
      } else {
        battle.embedActions.setStatus(`You are not using a throwable!`)
        interaction.update({ embeds: [battle.embedActions.updateBattle(99).setColor(Utils.colors.yellow)], components: [battle.embedActions.getActionButtons()] });
      }
    }

    if (selected === 'battle_potion') {
      
      if (player.potion) {
        hasWon = await battle.usePotion()


        if (hasWon === true) {
          interaction.update({ embeds: [battle.embed.setColor(Utils.colors.green)], components: [battle.embedActions.getActionButtons(true)] });
          return [true, inventory]
        } else if (hasWon === false) {
          interaction.message.edit({ embeds: [battle.embed], components: [battle.embedActions.getActionButtons()] })

          await Utils.wait(1000);

          hasWon = await enemy.attack()

          if (hasWon) {
            interaction.update({ embeds: [battle.embed], components: [battle.embedActions.getActionButtons(true)] });
            return [false, inventory]
          }

          interaction.update({ embeds: [battle.embed], components: [battle.embedActions.getActionButtons()] });
        } else if (hasWon === 'skip') interaction.update({ embeds: [battle.embed], components: [battle.embedActions.getActionButtons()] });
      } else {
        battle.embedActions.setStatus(`You are not using a potion!`)
        interaction.update({ embeds: [battle.embedActions.updateBattle(99).setColor(Utils.colors.yellow)], components: [battle.embedActions.getActionButtons()] });
      }
    }

    if (selected === 'battle_run') {
      const bool = battle.run()

      if (bool === true) {
        interaction.update({ embeds: [battle.embed.setColor(Utils.colors.green)], components: [battle.embedActions.getActionButtons(true)] });
        return ['skip']
      } else {
        interaction.update({ embeds: [battle.embed.setColor(Utils.colors.red)], components: [battle.embedActions.getActionButtons(true)] });
        return [false]
      }
    }

    if (selected === 'battle_attack') {
      hasWon = await battle.attack()

      if (hasWon === true) {
        interaction.update({ embeds: [battle.embed.setColor(Utils.colors.green)], components: [battle.embedActions.getActionButtons(true)] });
        return [true, inventory]
      }

      else if (hasWon === false) {
        interaction.update({ embeds: [battle.embed.setColor(Utils.colors.red)], components: [battle.embedActions.getActionButtons(true)] });
        return [false]
      }

      else if (hasWon === 'skip') {
        interaction.message.edit({ embeds: [battle.embed], components: [battle.embedActions.getActionButtons()] })

        await Utils.wait(1500);

        hasWon = await enemy.attack()

        if (hasWon === true) {
          interaction.update({ embeds: [battle.embed], components: [battle.embedActions.getActionButtons(true)] })
          return [false, inventory]
        }
        else if (hasWon === false) { 
          interaction.update({ embeds: [battle.embed], components: [battle.embedActions.getActionButtons()] }) }
      }
    }
  }
}