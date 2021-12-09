const Bot = require("../../../Bot")
const DB = require("../../../classes/database/DB")
const Player = require("../../../classes/utilities/Player")

module.exports.execute = async(msg, item_id, type) => {
  const player = new Player(msg.member)
  const inventory = await player.inventory

  const weapon = await player[type]
  const shop = require('../shop.json')
  const shopThrowable = weapon ? shop.find(item => item.id === weapon.id) : null
  const throwableEmote = weapon ? (shopThrowable.uploaded ? Bot.client.emojis.cache.find(e => e.name === shopThrowable.emoji) : shopThrowable.emoji) : null
  const newShopThrowable = shop.find(item => item.id === item_id)
  const newThrowableEmote = newShopThrowable.uploaded ? Bot.client.emojis.cache.find(e => e.name === newShopThrowable.emoji) : newShopThrowable.emoji

  if (weapon && weapon.id == item_id) {
    const item = inventory.find(item => item.id === item_id)
    msg.replyEmbed(`You are now using **${item.amount + weapon.amount}** of ${newThrowableEmote} **${newShopThrowable.name}** as a ${type}`)

    const invItemAmount = item.amount
    inventory[item.pos].amount -= item.amount
    await DB.query(`update members set ${type} = '[{"id": "${item_id}", "amount": ${invItemAmount + weapon.amount}}]', inventory = '${JSON.stringify(inventory)}' where member_id = ${msg.member.id}`)
  } else if (weapon) {
    msg.replyEmbed(`You are now using ${newThrowableEmote} **${newShopThrowable.name}** as a ${type}`)

    const oldWeapon = weapon

    const oldWeaponInv = inventory.find(item => item.id === oldWeapon.id)
    const newWeaponInv = inventory.find(item => item.id === item_id)
    
    const oldNewWeaponAmount = newWeaponInv.amount
    inventory[newWeaponInv.pos].amount -= newWeaponInv.amount
    inventory[oldWeaponInv.pos].amount += oldNewWeaponAmount

    await DB.query(`update members set ${type} = '[{"id": "${item_id}", "amount": ${oldNewWeaponAmount}}]', inventory = '${JSON.stringify(inventory)}' where member_id = ${msg.member.id}`)
  } else {
    msg.replyEmbed(`You are now using ${newThrowableEmote} **${newShopThrowable.name}** as a ${type}.`)
    const item = inventory.find(item => item.id === item_id)
    console.log(item);
    const invItemAmount = item.amount
    inventory[item.pos].amount -= item.amount
    await DB.query(`update members set ${type} = '[{"id": "${item_id}", "amount": ${invItemAmount}}]', inventory = '${JSON.stringify(inventory)}' where member_id = ${msg.member.id}`)
  }
}