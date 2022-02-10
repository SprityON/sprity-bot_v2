const { Discord } = require('../../Bot')
const { sendEmbed } = require('../../classes/utilities/AdvancedEmbed')
const Player = require('../../classes/utilities/Player')
const { messages, colors } = require('../../classes/utilities/Utils')
const Utils = require('../../classes/utilities/Utils')

module.exports = {
  name: Utils.getCmdName(__filename, __dirname),
  category: Utils.getCmdCategory(__filename),
  usage: 'battle <member>',
  aliases: [],
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

    function showStats(stats) {
      return `Health: **${stats.health}**\nAttack Damage: **${stats.attack}**\nDefense: **${stats.defense}**`
    }

    const embed = new Discord.MessageEmbed().setColor(colors.yellow)
      .setTitle(`:crossed_swords: Battle: ${msg.member.displayName} VS ${mention.displayName}`)
      .addField(`${msg.member.displayName}'s Stats`, showStats(playerStats), true)
      .addField(`${mention.displayName}'s Stats`, showStats(mentionStats), true)
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

    const message = await msg.reply({ embeds: [embed], components: [buttons] })

    function disableComponents() {
      buttons.components.forEach(comp => {
        comp.disabled = true
        comp.style = 'SECONDARY'
      })
    }

    const filter = interaction => interaction.customId.startsWith('battle') && interaction.user.id === msg.member.id || interaction.user.id === mention.id

    while (true) {
      const interaction = await message.awaitMessageComponent({ filter, time: '60000' }).catch(err => {
        disableComponents()
        message.edit({ embeds: [embed], components: [buttons] })
      })

      if (!interaction) break

      if (interaction.componentType === 'BUTTON') {
        const selected = interaction.customId

        switch (selected) {
          case 'battle_accept':
            // if (interaction.member.id === msg.member.id) { interaction.reply({embeds: [sendEmbed(Utils.messages.unusable_interaction)], ephemeral: true}); continue; }
            disableComponents()

            embed.spliceFields(embed.fields.length - 1, 1)
              .addField(`\u200b`, `*Status: **${interaction.member.displayName}** has accepted the request*`)
              .setColor(colors.green)

            interaction.update({ embeds: [embed], components: [buttons] })

            await Utils.wait(2500)

            msg.reply(`Under construction.`)
          break;

          case 'battle_calculate':
            interaction.update({ embeds: [embed], components: [buttons] })

            await Utils.wait(2500)

            msg.reply(`Under construction.`)
          break;

          case 'battle_cancel':
            disableComponents()

            embed.spliceFields(embed.fields.length - 1, 1)
              .addField(`\u200b`, `*Status: **${interaction.member.displayName}** has cancelled the request*`)
              .setColor(colors.red)

            interaction.update({ embeds: [embed], components: [buttons] })

            msg.reply(`Under construction.`)
          return;
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