const Player = require('../../classes/utilities/Player');
const Utils = require('../../classes/utilities/Utils')
const Bot = require('../../Bot');
const { Discord } = require('../../Bot');

module.exports = {
  name: Utils.getCmdName(__filename, __dirname),
  category: Utils.getCmdCategory(__filename),
  usage: '',
  aliases: [],
  permissions: ['SEND_MESSAGES'],
  timeout: 1000,

  async execute(msg, args) {
    const shop = require('./shop.json')

    const player = new Player(msg.member)
    const points = await player.points
    const point = Bot.client.emojis.cache.find(e => e.name === 'pointdiscord')

    const menu = new Discord.MessageActionRow()
    let selectMenu = new Discord.MessageSelectMenu()
      .setCustomId('shop')
      .addOptions([
        {
          label: "Tools",
          value: "tool",
          default: true
        },

        {
          label: "Usables",
          value: "usable"
        },

        {
          label: "Throwables",
          value: "throwable"
        },

        {
          label: "Potions",
          value: "potion"
        },

        {
          label: "Everything",
          value: "everything"
        }
      ])

    menu.addComponents(selectMenu)

    function updateMenu(selected) { 
      let i = 0
      for (let option of selectMenu.options) {
        if (option.value === selected) { option.default = true; }
        if (option.value !== selected && option.default === true) option.default = false
      }

      i++
    }

    const buttons = new Discord.MessageActionRow()
    .addComponents(
        new Discord.MessageButton()
          .setCustomId('shop_first')
          .setLabel('◄◄')
          .setStyle('PRIMARY'),

        new Discord.MessageButton()
          .setCustomId('shop_previous')
          .setLabel('◄')
          .setStyle('PRIMARY'),

        new Discord.MessageButton()
          .setCustomId('shop_next')
          .setLabel('►')
          .setStyle('PRIMARY'),

        new Discord.MessageButton()
          .setCustomId('shop_last')
          .setLabel('►►')
          .setStyle('PRIMARY'),

        new Discord.MessageButton()
          .setCustomId('shop_cancel')
          .setLabel('Cancel')
          .setStyle('DANGER')
      )

    function returnEmbed(selected, page) {
      let message 
      Utils.embedList({
        title: `**SHOP ──────────────────────── ${point} ${Utils.normalizePrice(points)}**`,
        type: 'shop',
        JSONlist: shop,
        member: msg.member,
        currPage: page,
        showAmountOfItems: 5,
        filter: selected === 'everything' ? '' : selected
      }, result => message = result)

      return message
    }

    const filter = interaction => interaction.customId.startsWith('shop') && interaction.user.id === msg.member.id;

    let interactionEnded = false
    let prevSelection = 'tool'
    let currentPage = 1
    let result;

    function disableComponents() {
      selectMenu.disabled = true
      buttons.components.forEach(comp => {
        comp.disabled = true
        comp.style = 'SECONDARY'
      })
    }

    const message = await msg.reply({ embeds: [returnEmbed('tool')], components: [menu, buttons] })

    while (interactionEnded === false) {
      const interaction = await message.awaitMessageComponent({ filter, time: 15000 }).catch(() => {
        disableComponents()
        message.edit({ embeds: [returnEmbed('tool')], components: [menu, buttons] })
      })
      
      if (!interaction) break

      if (interaction.componentType === 'SELECT_MENU') {
        const selected = interaction.values[0]

        switch (selected) {
          case 'tool':
            interaction.update({ embeds: [returnEmbed(selected)], components: [menu, buttons] })
            prevSelection = selected

            updateMenu(selected)
            break;

          case 'usable':
            interaction.update({ embeds: [returnEmbed(selected)], components: [menu, buttons] })
            prevSelection = selected

            updateMenu(selected)
            break;

          case 'throwable':
            interaction.update({ embeds: [returnEmbed(selected)], components: [menu, buttons] })
            prevSelection = selected

            updateMenu(selected)
            break;

          case 'potion':
            interaction.update({ embeds: [returnEmbed(selected)], components: [menu, buttons] })
            prevSelection = selected

            updateMenu(selected)
            break;

          case 'everything':
            interaction.update({ embeds: [returnEmbed()], components: [menu, buttons] })
            prevSelection = selected

            updateMenu(selected)
            break;
        }
      }
      
      else if (interaction.componentType === 'BUTTON') {
        const selected = interaction.customId
        
        switch (selected) {
          case 'shop_first':
            result = returnEmbed(prevSelection, 1)

            if (typeof result === 'object' && result[0] === false) {
              interaction.reply({ content: result[1], ephemeral: true })
            } else {
              interaction.update({ embeds: [returnEmbed(prevSelection, 1)], components: [menu, buttons] })
              currentPage = 1
            }
          break;

          case 'shop_previous':
            result = returnEmbed(prevSelection, currentPage - 1)

            if (typeof result === 'object' && result[0] === false) {
              interaction.reply({ content: result[1], ephemeral: true })
            } else {
              currentPage -= 1
              interaction.update({ embeds: [returnEmbed(prevSelection, currentPage)], components: [menu, buttons] })
            }
          break;

          case 'shop_next':
            result = returnEmbed(prevSelection, currentPage + 1)

            if (typeof result === 'object' && result[0] === false) {
              interaction.reply({ content: result[1], ephemeral: true })
            } else {
              currentPage += 1
              interaction.update({ embeds: [returnEmbed(prevSelection, currentPage)], components: [menu, buttons] })
            }

          break;

          case 'shop_last':
            while (true) {
              result = returnEmbed(prevSelection, currentPage + 1)

              if (typeof result === 'object' && result[0] === false) { 
                break 
              } else { currentPage += 1 }
            }
            
            interaction.update({ embeds: [returnEmbed(prevSelection, currentPage)], components: [menu, buttons] })
          break;

          case 'shop_cancel':
            disableComponents()
            interactionEnded = true
            interaction.update({ embeds: [returnEmbed(prevSelection, currentPage)], components: [menu, buttons] })
          break
        }
      }
    }
  },

  help: {
    enabled: true,
    title: 'Shop',
    description: `Buy items and tools!`,
  }
}