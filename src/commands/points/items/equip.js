const Bot = require("../../../Bot")
const DB = require("../../../classes/database/DB")
const Player = require("../../../classes/utilities/Player")
const { sendEmbed } = require('../../../classes/utilities/AdvancedEmbed')

module.exports.execute = async(msg, item_id, type) => {
  const player = new Player(msg.member)
  const inventory = await player.inventory

  const weapon = await player.throwable
  const shop = require('../shop.json')
  const newShopThrowable = shop.find(item => item.id === item_id)
  const newThrowableEmote = newShopThrowable.uploaded ? Bot.client.emojis.cache.find(e => e.name === newShopThrowable.emoji) : newShopThrowable.emoji

  if (weapon && weapon.id == item_id) {
    const item = inventory.find(item => item.id === item_id)
    if (!item) return msg.reply({ embeds: [sendEmbed(`You do not have that item!`)] })
    msg.reply({ embeds: [sendEmbed(`You are now using **${item.amount + weapon.amount}** of ${newThrowableEmote} **${newShopThrowable.name}** as a ${type}`)] })

    const invItemAmount = item.amount
    inventory[item.pos].amount -= item.amount
    await DB.query(`update members set ${type} = '[{"id": "${item_id}", "amount": ${invItemAmount + weapon.amount}}]', inventory = '${JSON.stringify(inventory)}' where member_id = ${msg.member.id}`)
  } else if (weapon) {

    const oldWeapon = weapon

    const oldWeaponInv = inventory.find(item => item.id === oldWeapon.id)
    const newWeaponInv = inventory.find(item => item.id === item_id)

    if (!newWeaponInv) return msg.reply({ embeds: [sendEmbed(`You do not have that item!`)] })
    msg.reply({ embeds: [sendEmbed(`You are now using ${newThrowableEmote} **${newShopThrowable.name}** as a ${type}`)] })
    
    const oldNewWeaponAmount = newWeaponInv.amount
    inventory[newWeaponInv.pos].amount -= newWeaponInv.amount
    inventory[oldWeaponInv.pos].amount += oldNewWeaponAmount

    await DB.query(`update members set ${type} = '[{"id": "${item_id}", "amount": ${oldNewWeaponAmount}}]', inventory = '${JSON.stringify(inventory)}' where member_id = ${msg.member.id}`)
  } else {
    const item = inventory.find(item => item.id === item_id)
    if (!item) return msg.reply({ embeds: [sendEmbed(`You do not have that item!`)] })
    msg.reply({ embeds: [sendEmbed(`You are now using ${newThrowableEmote} **${newShopThrowable.name}** as a ${type}`)] })
    const invItemAmount = item.amount
    inventory[item.pos].amount -= item.amount
    await DB.query(`update members set ${type} = '[{"id": "${item_id}", "amount": ${invItemAmount}}]', inventory = '${JSON.stringify(inventory)}' where member_id = ${msg.member.id}`)
  }
}