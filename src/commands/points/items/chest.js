const Bot = require('../../../Bot');
const DB = require('../../../classes/database/DB');
const { sendEmbed } = require('../../../classes/utilities/AdvancedEmbed');
const Player = require('../../../classes/utilities/Player');
const Utils = require('../../../classes/utilities/Utils');

module.exports = {
  async execute(msg, args) {
    const item_id = args[0]
    
    const items = require('./items.json')
    const chest = items.find(i => i.id === item_id)
    const point = Bot.client.emojis.cache.find(e => e.name === 'pointdiscord')
    const player = new Player(msg.member)
    const inventory = await player.inventory
    const points = await player.points

    let receivedItems = [];
    let receivedPoints = 0
    
    chest.obtainables.forEach(obt => {
      const chance = Math.floor(Math.random() * 10000)
      const random = (Math.random() * 0.3) + 0.85
      
      if (obt.chance > chance) {
        if (obt.id === 'points') 
          return receivedPoints += Math.floor((10 * obt.amountMultiplier) * random)

        const item = require('../shop.json').find(i => i.id === obt.id)
        const emoji = Bot.client.emojis.cache.find(e => e.name === (item ? item.emoji : obt.id))
        const itemAmount = Math.floor((10) * obt.amountMultiplier * random)
        if (itemAmount < 1) itemAmount = 1
        const invItem = inventory.find(item => item.id === obt.id)

        invItem 
          ? inventory[invItem.pos].amount += itemAmount 
          : inventory.push({pos: inventory.length, id: obt.id, amount: inventory[invItem.pos].amount})
        
        receivedItems.push(`**${emoji} ${itemAmount}**`)
      }
    })

    if (!receivedItems) receivedItems.push('**nothing**')

    const receivedText = receivedPoints > 0 ? receivedItems ? ` and ${point} **${receivedPoints}**` : `${point} **${receivedPoints}**` : ''

    msg.reply({ embeds: [sendEmbed(`You got ${receivedItems.join(", ")}${receivedText}`)]})

    DB.query(`update members set inventory = '${JSON.stringify(inventory)}', points = ${points + receivedPoints} where member_id = ${msg.member.id}`)

    return [true, '', inventory]
  },
}