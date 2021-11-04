const DB = require('../../classes/database/DB')
const Player = require('../../classes/utilities/Player')
const Utils = require('../../classes/utilities/Utils')

module.exports = {
  name: Utils.getCmdName(__filename, __dirname),
  category: Utils.getCmdCategory(__filename),
  usage: '',
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
    const emoji = item.uploaded ? item.emoji : Bot.client.emojis.cache.find(e => e.name === item.id)

    if (!item) return msg.replyEmbed(`That item was not found!`)

    const player = new Player(msg.member)
    let inventory = await player.inventory
    let points = await player.points

    const invItem = inventory.find(i => i.id === itemID)
    if (invItem && invItem.amount >= amount) {
      points += item.price * amount
      inventory[invItem.pos].amount -= amount
      
      DB.query(`update members set inventory = '${JSON.stringify(inventory)}', points = ${points} where member_id = ${msg.member.id}`)
        .then(() => {
          msg.replyEmbed(`You successfully sold ${emoji} **${amount} ${item.name}**`)
        })
    } else return msg.replyEmbed(`You do not have that many ${emoji} **${item.name}**`)
  },

  help: {
    enabled: false,
    title: '',
    description: ``,
  }
}