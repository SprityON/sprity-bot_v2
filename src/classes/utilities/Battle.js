const Bot = require("../../Bot");
const DB = require("../database/DB");
const { sendEmbed } = require("./AdvancedEmbed");

module.exports = class Battle {
  constructor(player, enemy) {
    this.player = player
    this.enemy = enemy
  }

  async damageDone() { return Math.floor(await this.player.att * ((Math.random() * 0.3) + 0.85)) }

  async usePotion() {
    const shop = require('../../commands/points/shop.json')
    const shopPotion = shop.find(item => item.id === this.player.potion.id)
    const emote = this.player.potion ? (shopPotion.uploaded ? Bot.client.emojis.cache.find(e => e.name === shopPotion.emoji) : shopPotion.emoji) : null

    if (this.player.hp.current >= this.player.hp.max) {
      return [{ embeds: [sendEmbed(`You are already at full health!\n\nType \`attack\`, \`throw\`, \`potion\` or \`run\``, { color: 'ffff00' })] }]
    } else {
      this.player.potion.amount -= 1

      this.player.potion.amount < 1
        ? await DB.query(`update members set potion = '' where member_id = ${this.player.member.id}`)
        : await DB.query(`update members set potion = '[${JSON.stringify(this.player.potion)}]' where member_id = ${this.player.member.id}`)

      this.player.hp.current += Math.floor(this.player.hp.max / shopPotion.heal_percentage)

      if (this.player.hp.current >= this.player.hp.max) this.player.hp.current = this.player.hp.max
      return { embeds: [sendEmbed(`You restored ${shopPotion.heal_percentage}% of your health by using ${emote} **${shopPotion.name}**\n***Your* HP: ${this.player.hp.current}/${this.player.hp.max}**`, { color: 'ffff00' })] }
    }
  }

  async useThrowable() {
    const shop = require('../../commands/points/shop.json')
    let throwable = await this.player.throwable
    const shopThrowable = throwable ? shop.find(item => item.id === throwable.id) : null
    const emote = throwable ? (shopThrowable.uploaded ? Bot.client.emojis.cache.find(e => e.name === shopThrowable.emoji) : shopThrowable.emoji) : null

    throwable.amount -= 1

    this.enemy.hp.current -= shopThrowable.damage

    throwable.amount < 1
      ? await DB.query(`update members set throwable = '' where member_id = ${this.player.member.id}`)
      : await DB.query(`update members set throwable = '[${JSON.stringify(throwable)}]' where member_id = ${this.player.member.id}`)

    if (minionHealth < 1)
      return [true, { embeds: [sendEmbed(`You killed **${minionName}** with ${emote}!`, { color: '00ff00' })] }]

    return [false, { embeds: [sendEmbed(`You threw a ${emote} **${shopThrowable.name}** and did **${shopThrowable.damage}** damage! ***${this.enemy.name}'s* HP: ${this.enemy.hp.current}/${this.enemy.hp.max}**`, { color: 'ffff00' })] }]
  }

  async attack() {
    this.enemy.hp.current -= Math.floor(await this.damageDone())

    if (this.enemy.hp.current < 1) {
      if (this.enemy.run() === true) {
        return [false, `Oh no, **${this.enemy.name}** ran away from you!`]
      } else return [true, `You killed **${this.enemy.name}**`]
    } 
    
    else return ['skip', `You did **${await this.damageDone()}** damage! ***${this.enemy.name}'s* HP: ${this.enemy.hp.current}/${this.enemy.hp.max}**`]
  }

  run() {
    const chance = Math.floor(Math.random() * 3) + 1
    if (chance == 1) { return true } else { return true }
  }
}