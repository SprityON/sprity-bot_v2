const Utils = require('../../classes/utilities/Utils')
const fs = require('fs')
const Player = require('../../classes/utilities/Player')
const DB = require('../../classes/database/DB')
const { sendEmbed } = require('../../classes/utilities/AdvancedEmbed')

module.exports = {
  name: Utils.getCmdName(__filename, __dirname),
  category: Utils.getCmdCategory(__filename),
  usage: 'use <itemId>',
  aliases: ['equip'],
  permissions: ['SEND_MESSAGES'],
  timeout: 1000,

  async execute(msg, args) {
    if (!args[0] || args[0] && !isNaN(args[0])) return msg.reply({ embeds: [sendEmbed(`You have to provide a valid item ID!`)] })

    const player = new Player(msg.member)
    const inventory = await player.inventory

    const itemId = args.shift()

    const items = fs.readdirSync('./commands/points/items').filter(file => file.endsWith('.js'))
    const items_rpg = require('./shop.json').filter(item => item.type !== 'tool' && item.type !== 'usable')
    const item_rpg = items_rpg.find(item => item.id === itemId)
    if (item_rpg) return require('./items/equip').execute(msg, itemId, item_rpg.type)
    const item = items.find(item => item.includes(itemId)) ? require(`./items/${itemId}`) : null
    
    if (!item) return msg.reply({ embeds: [sendEmbed(`That item was not found!`)] })

    const shopItem = require('./shop.json').find(i => i.id === itemId)
    const invItem = inventory.find(item => item.id === itemId)
    
    if (!invItem || invItem.amount <= 0) return msg.reply({ embeds: [sendEmbed(`You do not have that item!`)] })

    item.execute(msg, args)
    .then(async ([bool, message]) => {
      if (bool === true) {
        if (item.role) return msg.reply({ embeds: [sendEmbed(message)] })

        inventory[invItem.pos].amount -= 1
        await DB.query(`update members set inventory = '${JSON.stringify(inventory)}' where member_id = ${msg.member.id}`)

        msg.reply({ embeds: [sendEmbed(`You have used the item **${shopItem.name}**`)] })
      } else return msg.reply({ embeds: [sendEmbed(message)] })
    }).catch((err) => {
      console.log(err);
      return msg.reply({ embeds: [sendEmbed(`Something went wrong. Do I have enough permissions?`)] })
    })
  },

  help: {
    enabled: true,
    title: 'Use',
    description: `Use an item from the shop!`,
  }
}