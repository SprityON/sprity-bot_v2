const Player = require('../../classes/utilities/Player')
const Utils = require('../../classes/utilities/Utils')
const Bot = require('../../Bot')
const DB = require('../../classes/database/DB')
const { sendEmbed } = require('../../classes/utilities/AdvancedEmbed')

module.exports = {
  name: Utils.getCmdName(__filename, __dirname),
  category: Utils.getCmdCategory(__filename),
  usage: '',
  aliases: [],
  permissions: ['SEND_MESSAGES'],
  timeout: 30000,

  async execute(msg, args) {
    const player = new Player(msg.member)
    const inventory = await player.inventory
    const obtainables = require('./items/items.json').filter(obt => obt.type === 'aquatic')

    const fished = []
    obtainables.forEach(obt => {
      const chance = Math.floor(Math.random() * 10000)
      const amount = Math.floor((Math.random() * 10) * obt.amountNultiplier)

      if (amount < 1) return

      if (chance < obt.chance) {
        const emote = obt.uploaded ? Bot.client.emojis.cache.find(e => e.name === obt.id) : obt.emoji
        fished.push(`${amount} ${emote}`)
        
        const invItem = inventory.find(item => item.id === obt.id)
        invItem
          ? inventory[invItem.pos].amount += amount
          : inventory.push({ pos: inventory.length, id: obt.id, amount: amount })
      }
    })
  
    if (fished.length < 1) return msg.reply({ embeds: [sendEmbed(`You went fishing and got **nothing**!`)] })

    await DB.query(`update members set inventory = '${JSON.stringify(inventory)}' where member_id = ${msg.member.id}`)

    msg.reply({ embeds: [sendEmbed(`You went fishing and got **${fished.join(", ")}**`)] })
  },

  help: {
    enabled: true,
    title: 'Go fish!',
    description: `Pretty simple ain't it. It's fishing.`,
  }
}