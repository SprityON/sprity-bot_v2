const { Discord } = require('../../Bot')
const { sendEmbed } = require('../../classes/utilities/AdvancedEmbed')
const Player = require('../../classes/utilities/Player')
const Battle = require('../../classes/utilities/Battle')
const { messages, colors } = require('../../classes/utilities/Utils')
const Utils = require('../../classes/utilities/Utils')
const Bot = require('../../Bot')

module.exports = {
  name: Utils.getCmdName(__filename, __dirname),
  category: Utils.getCmdCategory(__filename),
  usage: 'battle <member>',
  aliases: ['b'],
  permissions: ['SEND_MESSAGES'],
  timeout: 1000,

  async execute(msg, args) {
    const player = new Player(msg.member)
    const playerStats = await player.stats
    player.setHP = { current: playerStats.health, max: playerStats.health }

    const mention = msg.mentions.members.first()
    const mentionedPlayer = mention ? new Player(msg.mentions.members.first()) : null

    if (!mentionedPlayer) return msg.reply({ embeds: [sendEmbed(messages.wrong_argument)] })

    const mentionStats = await mentionedPlayer.stats
    mentionedPlayer.setHP = { current: mentionStats.health, max: mentionStats.health }

    const heart = Bot.client.emojis.cache.find(e => e.name === 'heart_rpg')
    const attack = Bot.client.emojis.cache.find(e => e.name == 'attack_rpg')
    const defense = Bot.client.emojis.cache.find(e => e.name == 'defense_rpg')

    function showStats(stats) {
      return `${heart} **${stats.health}**\n${attack} **${stats.attack}**\n${defense} **${stats.defense}**`
    }

    const embed = new Discord.MessageEmbed().setColor(colors.yellow)
      .setTitle(`:crossed_swords: Battle: ${msg.member.displayName} VS ${mention.displayName}`)
      .addField(`${msg.member.displayName}`, showStats(playerStats), true)
      .addField(`${mention.displayName}`, showStats(mentionStats), true)
      .addField(`\u200b`, `*Status: Awaiting **${mention.displayName}'s** answer*`)

    const buttons = new Discord.MessageActionRow().addComponents(
      new Discord.MessageButton()
        .setLabel(`Accept`)
        .setCustomId(`battle_accept`)
        .setStyle('SUCCESS'),

      new Discord.MessageButton()
        .setLabel(`Calculate Chance`)
        .setCustomId(`battle_calculate`)
        .setStyle('SECONDARY'),

      new Discord.MessageButton()
        .setLabel(`Cancel`)
        .setCustomId(`battle_cancel`)
        .setStyle('DANGER')
    )

    let message = await msg.reply({ embeds: [embed], components: [buttons] })

    function disableComponents() {
      buttons.components.forEach(comp => {
        comp.disabled = true
        comp.style = 'SECONDARY'
      })
    }

    let filter = interaction => interaction.customId.startsWith('battle') && interaction.user.id === msg.member.id || interaction.user.id === mention.id

    let request = true
    let cancelled = false
    while (request === true) {
      let interaction = await message.awaitMessageComponent({ filter, time: '60000' }).catch(err => {
        disableComponents()
        cancelled = true
        message.edit({ embeds: [embed], components: [buttons] })
      })

      if (!interaction) break

      if (interaction.componentType === 'BUTTON') {
        const selected = interaction.customId

        switch (selected) {
          case 'battle_accept':
            if (interaction.member.id === msg.member.id) { interaction.reply({embeds: [sendEmbed(Utils.messages.unusable_interaction)], ephemeral: true}); continue; }
            disableComponents()

            embed.spliceFields(embed.fields.length - 1, 1)
              .addField(`\u200b`, `*Status: **${interaction.member.displayName}** has accepted the request*`)
              .setTitle(`:crossed_swords: Battle: ${msg.member.displayName} VS ${mention.displayName}`)
              .setColor(colors.green)

            await interaction.deferReply()
            let newInteraction = await interaction.editReply({ embeds: [embed], components: [buttons] })
            await interaction.message.delete()

            await Utils.wait(5000)

            buttons.setComponents(
              new Discord.MessageButton()
              .setCustomId('battle_attack')
              .setLabel('Attack')
              .setStyle('SECONDARY'),

              new Discord.MessageButton()
                .setCustomId('battle_throw')
                .setLabel('Throw')
                .setStyle('SECONDARY'),

              new Discord.MessageButton()
                .setCustomId('battle_potion')
                .setLabel('Potion')
                .setStyle('SECONDARY'),

              new Discord.MessageButton()
                .setCustomId('battle_run')
                .setLabel('Run')
                .setStyle('DANGER')
          )

          embed.spliceFields(0, 999)
            .addField(`${msg.member.displayName}`, `${playerStats.health}/${playerStats.health} ${heart} `, true)
            .addField(`${mention.displayName}`, `${mentionStats.health}/${mentionStats.health} ${heart} `, true)
            .addField(`\u200b`, `*Status: **${mention.displayName}** and **${msg.member.displayName}** are currently battling*`)
            .setColor(colors.orange)
            .setTitle(`:crossed_swords: Battle: ${msg.member.displayName} VS ${mention.displayName}`)

           newInteraction.edit({ embeds: [embed], components: [buttons] })

           message = newInteraction

           request = false; break;

          case 'battle_calculate':
            interaction.update({ embeds: [embed], components: [buttons] })

            await Utils.wait(2500)

            msg.reply(`Under construction.`)
          break;

          case 'battle_cancel':
            disableComponents()

            embed.spliceFields(embed.fields.length - 1, 1)
              .addField(`\u200b`, `*Status: **${interaction.member.displayName}** has cancelled the request*`)
              .setTitle(`:crossed_swords: Battle: ${msg.member.displayName} VS ${mention.displayName}`)
              .setColor(colors.red)

            interaction.update({ embeds: [embed], components: [buttons] })

          cancelled = true
          request = false; break;
        }
      }
    }

    let turn = player
    let nextTurn = mentionedPlayer

    while (cancelled === false && true) {
      filter = interaction => interaction.customId.startsWith('battle') && interaction.user.id === turn.member.id
      let interaction = await message.awaitMessageComponent({ filter, time: '60000' }).catch(err => {
        disableComponents()
        message.edit({ embeds: [embed], components: [buttons] })
      })

      if (!interaction) break

      if (interaction.member.id !== turn.member.id) {
        interaction.reply({ embeds: [sendEmbed(Utils.messages.unusable_interaction)], ephemeral: true })
        continue;
      }

      turn.name = turn.member.displayName
      nextTurn.name = nextTurn.member.displayName
      const battle = new Battle(turn, nextTurn)

      if (interaction.componentType === 'BUTTON') {
        const selected = interaction.customId

        let hasWon, string, damage, throwable, potion, damageText, healText = '';

        function updateEmbed() {
          function showText(num) {
            if (num === 0) 
            {
              if (damageText && damageText.length > 0) { return msg.member.id !== turn.member.id ? damageText : '' }
              else if (healText && healText.length > 0) { return msg.member.id === turn.member.id ? healText : '' }
              else return ''
            }

            else if (num === 1)
            {
              if (damageText && damageText.length > 0) { return mention.id !== turn.member.id ? damageText : '' }
              else if (healText && healText.length > 0) { return mention.id === turn.member.id ? healText : '' }
              else return ''
            }
          }

          embed.spliceFields(0, 999)
            .setTitle(`:crossed_swords: Battle: ${turn.member.displayName} VS ${nextTurn.member.displayName}`)
            .addField(`${msg.member.displayName}`, `${player.hp.current}/${player.hp.max} ${heart} ${showText(0)}`, true)
            .addField(`${mention.displayName}`, `${mentionedPlayer.hp.current}/${mentionedPlayer.hp.max} ${heart} ${showText(1)}`, true)
            .addField(`\u200b`, `*Status: ${string}*`)

          return embed
        }

        switch (selected) {
          case 'battle_attack':
            [hasWon, string, damage] = await battle.attack()
            damageText = `(-${damage})`

            if (hasWon === true) 
            {
              disableComponents()

              const temp_embed = updateEmbed().setColor(Utils.colors.green)

              return interaction.update({ embeds: [temp_embed], components: [buttons] })
            } 
            
            else if (hasWon === false) 
            {
              disableComponents()

              const temp_embed = updateEmbed().setColor(Utils.colors.green)

              return interaction.update({ embeds: [temp_embed], components: [buttons] })
            } 
            
            else 
            {
              damageText = `(-${damage})`

              const temp_embed = updateEmbed()

              interaction.update({ embeds: [temp_embed], components: [buttons] })

              let temp = nextTurn
              nextTurn = turn
              turn = temp
            }
          break

          case 'battle_throw':
            const throwableDB = await turn.throwable

            if (!throwableDB || throwableDB.amount < 1) 
            {
              interaction.reply({embeds: [sendEmbed(Utils.messages.not_enough_item)], ephemeral: true})
              break;
            }

            [hasWon, string, throwable] = await battle.useThrowable({ returnString: true })
            damageText = `(-${throwable.damage})`
            
            if (hasWon === true) 
            {
              const temp_embed = updateEmbed().setColor(colors.green)

              disableComponents()

              interaction.update({ embeds: [temp_embed], components: [buttons] })

              return;
            }

            else 
            {
              const temp_embed = updateEmbed()

              interaction.update({ embeds: [temp_embed], components: [buttons] })

              let temp = nextTurn
              nextTurn = turn
              turn = temp
            }
          break

          case 'battle_potion':
            if (!turn.potion.id) continue;
            [hasWon, string, potion] = await battle.usePotion({ returnString: true })
            healText = `(+${Math.floor(turn.hp.max / 100 * potion.heal_percentage)})`

            if (hasWon === true) {
              const temp_embed = updateEmbed().setColor(colors.green)

              disableComponents()

              return interaction.update({ embeds: [temp_embed], components: [buttons] })
            }

            else if (hasWon === false) {
              const temp_embed = updateEmbed()

              interaction.update({ embeds: [temp_embed], components: [buttons] })

              let temp = nextTurn
              nextTurn = turn
              turn = temp
            }

            else {
              const temp_embed = updateEmbed()

              interaction.update({ embeds: [temp_embed], components: [buttons] })
            }
          break;

          case 'battle_run':
            [bool, string] = battle.run({ returnString: true })

            disableComponents()

            if (bool === true)
            {
              const temp_embed = updateEmbed().setColor(colors.green)

              interaction.update({ embeds: [temp_embed], components: [buttons] })
            }

            else if (bool === false) 
            {
              const temp_embed = updateEmbed().setColor(colors.red)

              interaction.update({ embeds: [temp_embed], components: [buttons] })
            }
          break;
        }
      }
    }


  },

  help: {
    enabled: true,
    title: 'Go Battle!',
    description: `Battle a player.`,
  }
}