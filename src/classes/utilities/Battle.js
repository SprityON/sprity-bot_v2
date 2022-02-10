const Bot = require("../../Bot");
const DB = require("../database/DB");
const { sendEmbed } = require("./AdvancedEmbed");
const { colors } = require("./Utils");

module.exports = class Battle {
  constructor(player, enemy) {
    this.player = player
    this.enemy = enemy
  }

  async damageDone() { return Math.floor(await this.player.att * ((Math.random() * 0.3) + 0.85)) }

  async usePotion(options = { returnString: false }) {
    const shop = require('../../commands/points/shop.json')
    const shopPotion = shop.find(item => item.id === this.player.potion.id)
    const emote = this.player.potion ? (shopPotion.uploaded ? Bot.client.emojis.cache.find(e => e.name === shopPotion.emoji) : shopPotion.emoji) : null

    if (this.player.hp.current >= this.player.hp.max) {
      return ['skip', options ? `**${this.player.member.displayName}** is already at full health!` : { embeds: [sendEmbed(`**${this.player.member.displayName}** is already at full health!`, { color: colors.yellow })] }, shopPotion]
    } else {
      this.player.potion.amount -= 1

      this.player.potion.amount < 1
        ? await DB.query(`update members set potion = '' where member_id = ${this.player.member.id}`)
        : await DB.query(`update members set potion = '[${JSON.stringify(this.player.potion)}]' where member_id = ${this.player.member.id}`)

      this.player.hp.current += Math.floor(this.player.hp.max / 100 * shopPotion.heal_percentage)
      
      if (this.player.hp.current >= this.player.hp.max) this.player.hp.current = this.player.hp.max
      return [false, options.returnString ? `**${this.player.member.displayName}** used ${emote}` : { embeds: [sendEmbed(`**${this.player.member.displayName}** used ${emote}`, { color: colors.green })] }, shopPotion]
    }
  }

  async useThrowable(options = { returnString: false }) {
    const shop = require('../../commands/points/shop.json')
    let throwable = await this.player.throwable
    const shopThrowable = throwable ? shop.find(item => item.id === throwable.id) : null
    const emote = throwable ? (shopThrowable.uploaded ? Bot.client.emojis.cache.find(e => e.name === shopThrowable.emoji) : shopThrowable.emoji) : null

    throwable.amount -= 1

    this.enemy.hp.current -= shopThrowable.damage

    throwable.amount < 1
      ? await DB.query(`update members set throwable = '' where member_id = ${this.player.member.id}`)
      : await DB.query(`update members set throwable = '[${JSON.stringify(throwable)}]' where member_id = ${this.player.member.id}`)

    if (this.enemy.hp.current < 1)
      return [true, options.returnString ? `**${this.player.member.displayName}** killed **${this.enemy.name}** with ${emote}!` : { embeds: [sendEmbed(`**${this.player.member.displayName}** killed **${this.enemy.name}** with ${emote}!`, { color: colors.green })] }, shopThrowable]

    return [false, options.returnString ? `**${this.player.member.displayName}** threw a ${emote} **${shopThrowable.name}** and did **${shopThrowable.damage}** damage to **${this.enemy.name}'s (${this.enemy.hp.current}/${this.enemy.hp.max})**` : { embeds: [sendEmbed(`**${this.player.member.displayName}** threw a ${emote} **${shopThrowable.name}** and did **${shopThrowable.damage}** damage to **${this.enemy.name}'s (${this.enemy.hp.current}/${this.enemy.hp.max})**`, { color: colors.green })] }, shopThrowable]
  }

  async attack(options = { returnString: false }) {
    const damage = await this.damageDone()
    this.enemy.hp.current -= damage

    if (this.enemy.hp.current < 1) {
      if (this.run() === true) {
        return [
          false, 
          options.returnString 
            ? `Oh no, **${this.enemy.name}** ran away from **${this.player.member.displayName}**!` 
            : { embeds: [sendEmbed(`Oh no, **${this.enemy.name}** ran away from **${this.player.member.displayName}**!`, { color: colors.red }), 
          damage
        ]
      }]
        
      } else return [
        true, 
        options.returnString 
          ? `**${this.player.member.displayName}** killed **${this.enemy.name}** (**${this.enemy.hp.current}/${this.enemy.hp.max}**)` 
          : { embeds: [sendEmbed(`**${this.player.member.displayName}** killed **${this.enemy.name}** (**${this.enemy.hp.current}/${this.enemy.hp.max}**)`, { color: colors.green })] }, 
        damage
      ] 
    } 
    
    else return [
      'skip', 
      options.returnString 
        ? `**${this.player.member.displayName}** did **${damage}** damage to **${this.enemy.name} (${this.enemy.hp.current}/${this.enemy.hp.max})**` 
        : { embeds: [sendEmbed(`**${this.player.member.displayName}** did **${damage}** damage to **${this.enemy.name} (${this.enemy.hp.current}/${this.enemy.hp.max})**`, { color: colors.green })] }, 
      damage
    ]
  }

  run(options = { returnString: false }) {
    const chance = Math.floor(Math.random() * 3) + 1
    if (chance == 1) { 
      return [false, options.returnString ? `**${this.player.member.displayName}** couldn't run away from **${this.enemy.name}**!` : { embeds: [sendEmbed(`**${this.player.member.displayName}** couldn't run away from **${this.enemy.name}**!`, { color: colors.red })] }] 
    } else { 
      return [true, options.returnString ? `**${this.player.member.displayName}** successfully ran away from **${this.enemy.name}**!` : { embeds: [sendEmbed(`**${this.player.member.displayName}** successfully ran away from **${this.enemy.name}**!`, { color: colors.green })] }] 
    }
  }
}