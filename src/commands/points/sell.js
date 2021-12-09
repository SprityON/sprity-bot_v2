const DB = require('../../classes/database/DB')
const Player = require('../../classes/utilities/Player')
const Utils = require('../../classes/utilities/Utils')
const Bot = require('../../Bot')

module.exports = {
  name: Utils.getCmdName(__filename, __dirname),
  category: Utils.getCmdCategory(__filename),
  usage: 'sell <item_id>',
  aliases: [],
  permissions: ['SEND_MESSAGES'],
  timeout: 1000,

  async execute(msg, args) {
    if (!args[0] || !isNaN(args[0])) return msg.replyEmbed(`You have to provide a valid item ID!`)
    if (args[1] && isNaN(args[1])) return msg.replyEmbed(`You have to provide a valid amount!`)

    const itemID = args[0]
    const amount = args[1] ? Number(args[1]) : 1

    const shop = require('./shop.json')
    const item = shop.find(i => i.id === itemID)
    const emoji = item.uploaded ? Bot.client.emojis.cache.find(e => e.name === item.id) : item.emoji

    if (!item) return msg.replyEmbed(`That item was not found!`)

    const player = new Player(msg.member)
    let inventory = await player.inventory
    let points = await player.points
    const point = Bot.client.emojis.cache.find(e => e.name === 'pointdiscord')

    const invItem = inventory.find(i => i.id === itemID)
    if (invItem && invItem.amount >= amount) {
      points += ((item.price * amount) / 100) * 60
      inventory[invItem.pos].amount -= amount
      
      await DB.query(`update members set inventory = '${JSON.stringify(inventory)}', points = ${points} where member_id = ${msg.member.id}`)
        .then(() => {
          msg.replyEmbed(`You successfully sold **${amount} ${emoji} ${item.name}**! You now have ${point} **${Utils.normalizePrice(points)}** points.`)

          if (item.role) {
            const role = msg.guild.roles.cache.find(e => e.name === item.role)
            msg.member.roles.remove(role)
          }
        })
    } else return msg.replyEmbed(`You do not have that many ${emoji} **${item.name}**`)
  },

  help: {
    enabled: true,
    title: 'Sell an item',
    description: `Selling items will give you 60% of the original price back.`,
  }
}