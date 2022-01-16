const Bot = require('../../Bot')
const DB = require('../../classes/database/DB')
const Player = require('../../classes/utilities/Player')
const Utils = require('../../classes/utilities/Utils')
const { sendEmbed } = require('../../classes/utilities/AdvancedEmbed')

module.exports = {
  name: Utils.getCmdName(__filename, __dirname),
  category: Utils.getCmdCategory(__filename),
  usage: '',
  aliases: [],
  permissions: ['SEND_MESSAGES'],
  timeout: 1000,

  async execute(msg, args) {
    msg.reply({ embeds: [sendEmbed(`You have to provide a valid amount!`)] })
    if (!args[0] || !isNaN(args[0])) return msg.reply({ embeds: [sendEmbed(`You have to provide a valid item ID!`)] })
    if (args[1] && isNaN(args[1])) return msg.reply({ embeds: [sendEmbed(`You have to provide a valid amount!`)] })

    const itemID = args[0]
    const amount = args[1] ? Number(args[1]) : 1

    const shop = require('./shop.json')
    const item = shop.find(i => i.id === itemID)

    if (!item) return msg.reply({ embeds: [sendEmbed(`That item was not found!`)] })
    
    const emoji = item.uploaded ? Bot.client.emojis.cache.find(e => e.name === item.emoji) : item.emoji

    const player = new Player(msg.member)
    let inventory = await player.inventory
    let points = await player.points
    const point = Bot.client.emojis.cache.find(e => e.name === 'pointdiscord')

    if ((item.price * amount) > points) return msg.reply({ embeds: [sendEmbed(`You do not have enough **${point} Points** to buy this item!`)] })

    points -= (item.price * amount)
    const foundItem = inventory.find(i => i.id === item.id)
    if (foundItem) {
      inventory[foundItem.pos].amount += amount
    } else inventory.push({ pos: inventory.length, id: item.id, amount: amount })

    await DB.query(`update members set points = ${points}, inventory = '${JSON.stringify(inventory)}' where member_id = ${msg.member.id}`)
    .then(() => {
      msg.reply({ embeds: [sendEmbed(`You successfully bought **${amount} ${emoji} ${item.name}**. You now have ${point} **${Utils.normalizePrice(points)}** points.`)] })
    })
  },

  help: {
    enabled: false,
    title: '',
    description: ``,
  }
}