const Utils = require('../../classes/utilities/Utils')
const fs = require('fs')
const Player = require('../../classes/utilities/Player')
const DB = require('../../classes/database/DB')

module.exports = {
  name: Utils.getCmdName(__filename, __dirname),
  category: Utils.getCmdCategory(__filename),
  usage: 'use <item_id>',
  aliases: [],
  permissions: ['SEND_MESSAGES'],
  timeout: 1000,
  points: true,

  async execute(msg, args) {
    if (!args[0] || args[0] && !isNaN(args[0])) return msg.replyEmbed(`You have to provide a valid item ID!`)

    const player = new Player(msg.member)
    const inventory = await player.inventory

    const item_id = args.shift()

    const items = fs.readdirSync('./commands/points/items').filter(file => file.endsWith('.js'))
    const item = items.find(item => item.includes(item_id)) ? require(`./items/${item_id}`) : null

    if (!item) return msg.replyEmbed(`That item was not found!`)

    const shopItem = require('./shop.json').find(i => i.id === item_id)
    const invItem = inventory.find(item => item.id === item_id)
    if (!invItem || invItem.amount <= 0) return msg.replyEmbed(`You do not have that item!`)

    const [bool, message] = await item.execute(msg, args)
    if (bool === true) {
      inventory[invItem.pos].amount -= 1
      msg.replyEmbed(`You have used the item \`${shopItem.name}\``)
    } else return msg.replyEmbed(message)
    
    DB.query(`update members set inventory = '${JSON.stringify(inventory)}' where member_id = ${msg.member.id}`)
  },

  help: {
    enabled: true,
    title: 'Use',
    description: `Use an item from the shop!`,
  }
}