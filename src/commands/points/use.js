const Utils = require('../../classes/utilities/Utils')
const fs = require('fs')
const Player = require('../../classes/utilities/Player')

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

    const items = fs.readdirSync('./items').filter(file => file.endsWith('.js'))
    const item = items.find(item => item === item_id) ? require(`./items/${item_id}`) : null

    if (!item) msg.replyEmbed(`That item was not found!`)

    const invItem = inventory.find(item => item.id === item_id)
    if (!invItem || invItem.amount <= 0) return msg.replyEmbed(`You do not have that item!`)


    await item.execute(msg, args)
    inventory[invItem.pos].amount -= 1
  },

  help: {
    enabled: false,
    title: '',
    description: ``,
  }
}