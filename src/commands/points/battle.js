const { sendEmbed } = require('../../classes/utilities/AdvancedEmbed')
const Battle = require('../../classes/utilities/Battle')
const Player = require('../../classes/utilities/Player')
const Utils = require('../../classes/utilities/Utils')

module.exports = {
  name: Utils.getCmdName(__filename, __dirname),
  category: Utils.getCmdCategory(__filename),
  usage: 'battle <member>',
  aliases: ['1v1'],
  permissions: ['SEND_MESSAGES'],
  timeout: 1000,

  async execute(msg, args) {
    const mention = msg.mentions.members.first()
    if (!mention) return msg.reply({ embeds: [sendEmbed(Utils.messages.wrong_argument)] })

    const player = await (new Player(msg.member, msg).load())
    const player2 = await (new Player(mention, msg).load())

    const request = new Battle()
    request.player = player
    request.enemy = player2

    await request.embedActions.request.showRequest()

    let message = await msg.reply({embeds: [request.embed], components: [request.embedActions.request.getButtons()]})

    let filter = interaction => interaction.customId.startsWith('battle') && interaction.user.id === msg.member.id || interaction.user.id === mention.id

    const battle = new Battle()
    battle.setPlayers(player, player2)
    while (true) {
      const interaction = await message.awaitMessageComponent({ filter: filter, time: 60000, max: 1 }).catch(() => {})

      const selected = interaction.customId

      if (selected === 'battle_accept') {
        if (interaction.member.id === msg.member.id) { 
          interaction.reply({ embeds: [sendEmbed(Utils.messages.unusable_interaction)], ephemeral: true }); 
          continue; 
        }

        interaction.update({ embeds: [request.embedActions.request.requestAccepted()], components: [request.embedActions.request.getButtons(true)] })

        await Utils.wait(3000)

        battle.embedActions.setStatus(`It is **${battle.turn.name}'s** turn`)
        interaction.message.edit({ embeds: [battle.embedActions.updateBattle(99)], components: [request.embedActions.getActionButtons()] })

        break;
      }

      if (selected === 'battle_cancel') 
        return interaction.update({ embeds: [request.embedActions.request.requestCancelled()], components: [request.embedActions.request.getButtons(true)] })
    }

    while (true) {
      const interaction = await message.awaitMessageComponent({ filter: filter, time: 60000, max: 1 }).catch(() => {})

      if (!interaction) { 
        message.edit({embeds: [battle.embed], components: [battle.embedActions.getActionButtons(true)]})
        return
      }

      if (interaction.member.id !== battle.turn.member.id) {
        interaction.reply({ embeds: [sendEmbed(Utils.messages.unusable_interaction)], ephemeral: true })
        continue;
      }

      const selected = interaction.customId
      switch (selected) {
        case 'battle_attack':
          hasWon = await battle.attack()

          if (hasWon === true) {
            interaction.update({ embeds: [battle.embed.setColor(Utils.colors.green)], components: [battle.embedActions.getActionButtons(true)] });
            return
          }

          else if (hasWon === false) {
            interaction.update({ embeds: [battle.embed.setColor(Utils.colors.red)], components: [battle.embedActions.getActionButtons(true)] });
            return
          }

          else if (hasWon === 'skip') {
            interaction.message.edit({ embeds: [battle.embed], components: [battle.embedActions.getActionButtons(true)] })

            await Utils.wait(2000);

            battle.embedActions.setStatus(`It is **${battle.turn.name}'s** turn`)
            interaction.update({ embeds: [battle.embedActions.updateBattle(99)], components: [battle.embedActions.getActionButtons()] })
          }
        break;

        case 'battle_throw':
          const throwable = await battle.turn.throwable
          if (throwable) {
            hasWon = await battle.useThrowable()

            if (hasWon === true) {
              interaction.update({ embeds: [battle.embed.setColor(Utils.colors.green)], components: [battle.embedActions.getActionButtons(true)] });
              return 
            } else {
              interaction.message.edit({ embeds: [battle.embed], components: [battle.embedActions.getActionButtons()] });
            }
          } else {
            battle.embedActions.setStatus(`You are not using a throwable!`)
            interaction.update({ embeds: [battle.embedActions.updateBattle(99).setColor(Utils.colors.yellow)], components: [battle.embedActions.getActionButtons()] });
          }
        break;

        case 'battle_potion':
          if (battle.turn.potion) {
            hasWon = await battle.usePotion()

            if (hasWon === true) {
              interaction.update({ embeds: [battle.embed.setColor(Utils.colors.green)], components: [battle.embedActions.getActionButtons(true)] });
              return
            } else if (hasWon === false) {
              interaction.update({ embeds: [battle.embed], components: [battle.embedActions.getActionButtons()] });

            } else if (hasWon === 'skip') interaction.update({ embeds: [battle.embed], components: [battle.embedActions.getActionButtons()] });
          } else {
            battle.embedActions.setStatus(`You are not using a potion!`)
            interaction.update({ embeds: [battle.embedActions.updateBattle(99).setColor(Utils.colors.yellow)], components: [battle.embedActions.getActionButtons()] });
          }
        break;

        case 'battle_run':
          const bool = Math.floor(Math.random() * 4) < 3 ? true : false

          if (bool === true) {
            battle.embedActions.setStatus(`**${battle.turn.name}** successfully ran away from **${battle.nextTurn.name}**!`)
            interaction.update({ embeds: [battle.embedActions.updateBattle(99).setColor(Utils.colors.green)], components: [battle.embedActions.getActionButtons(true)] });
            return 
          } else {
            battle.embedActions.setStatus(`**${battle.turn.name}** couldn't run away from **${battle.nextTurn.name}**!`)

            interaction.message.edit({ embeds: [battle.embed], components: [battle.embedActions.getActionButtons(true)] })
            await Utils.wait(2000);

            interaction.update({ embeds: [battle.embedActions.updateBattle(0).setColor(Utils.colors.yellow)], components: [battle.embedActions.getActionButtons()] });
          }
        break;

        case 'battle_history':
          battle.embedActions.showHistory()
          interaction.update({ embeds: [battle.embed], components: [battle.embedActions.getHistoryButtons()] });
        break;

        case 'battle_present':
          battle.embedActions.showBattle()
          interaction.update({ embeds: [battle.embed], components: [battle.embedActions.getActionButtons()] });
        break;
      }
    }
  },

  help: {
    enabled: false,
    title: 'Battle a Player',
    description: `Battle against one of your friends!`,
  }
}