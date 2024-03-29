const DB = require('../../classes/database/DB')
const Player = require('../../classes/utilities/Player')
const Utils = require('../../classes/utilities/Utils')
const Bot = require('../../Bot')
const { sendEmbed } = require('../../classes/utilities/AdvancedEmbed')
const { concatArrays } = require('../../classes/utilities/Utils')

module.exports = {
  name: Utils.getCmdName(__filename, __dirname),
  category: Utils.getCmdCategory(__filename),
  usage: 'sell <item_id>',
  aliases: [],
  permissions: ['SEND_MESSAGES'],
  timeout: 1000,

  async execute(msg, args) {
    if (!args[0] || !isNaN(args[0])) return msg.reply({ embeds: [sendEmbed(`You have to provide a valid item ID!`)] })
    if (args[1] && isNaN(args[1])) return msg.reply({ embeds: [sendEmbed(`You have to provide a valid amount!`)] })

    const itemID = args[0]
    const amount = args[1] ? Number(args[1]) : 1

    const shopJSON = require('./shop.json')
    const itemsJSON = require('./items/items.json')

    const buyables = concatArrays(shopJSON, itemsJSON) 
    const item = buyables.find(i => i.id === itemID)

    if (!item) return msg.reply({ embeds: [sendEmbed(`That item was not found!`)] })

    const emoji = item.uploaded ? Bot.client.emojis.cache.find(e => e.name === (item.emoji ? item.emoji : item.id)) : item.emoji

    const player = new Player(msg.member)
    let inventory = await player.inventory
    let points = await player.points
    const point = Bot.client.emojis.cache.find(e => e.name === 'pointdiscord')

    const invItem = inventory.find(i => i.id === itemID)
    if (invItem && invItem.amount >= amount) {
      points += ((item.price * amount) / 100) * 60
      inventory[invItem.pos].amount -= amount
      
      await DB.query(`update members set inventory = '${JSON.stringify(inventory)}', points = ${Math.ceil(points)} where member_id = ${msg.member.id}`)
        .then(() => {
          msg.reply({ embeds: [sendEmbed(`You successfully sold **${amount} ${emoji}** for **${point} ${Utils.normalizePrice(Math.ceil(((item.price * amount) / 100) * 60))}**! You now have ${point} **${Utils.normalizePrice(Math.ceil(points))}** points.`)] })

          if (item.role) {
            const role = msg.guild.roles.cache.find(e => e.name === item.role)
            msg.member.roles.remove(role)
          }
        })
    } else return msg.reply({ embeds: [sendEmbed(`You do not have that many ${emoji} **${item.name}**`)] })
  },

  help: {
    enabled: true,
    title: 'Sell an item',
    description: `Selling items will give you 60% of the original price back.`,
  }
}