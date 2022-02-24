const { sendEmbed } = require("./AdvancedEmbed")
const { colors } = require("./Utils")

module.exports = class Enemy {
  constructor(player) {
    this.player = player
    this.name = 'Enemy'
    this.hp = { current: 0, max: 0 }
  }

  /**
   * @param {String} arg
   */
  set setName(arg) { this.name = arg }

  /**
   * @param {Number} hp
   */
  set setHP(hp) { this.hp.current = hp, this.hp.max = hp }

  dodged() {
    const random = Math.floor(Math.random() * 4)
    const dodged = random === 1 ? true : false

    return dodged
  }

  async calculateDamage() {
    const playerAtt = await this.player.att
    const playerDiff = await this.player.difficulty
    
    return Math.floor(playerAtt * ((Math.random() * 0.2) + 0.85)) * playerDiff
  }

  async damageDone() { return Math.floor(await this.calculateDamage()) }
  
  async attack() {
    if (this.dodged() === true) {
      return [
        false,
        `**${this.player.member.displayName}** dodged!`
      ]
    }

    const damage = await this.damageDone()
    this.player.hp.current -= damage

    if (this.player.hp.current < 1) {
      return [
        true, 
        `**${this.name}** did **${damage}** damage and you died at **(${this.player.hp.current}/${this.player.hp.max})** HP!`,
        damage
      ]
    } else {
      return [
        false, 
        `**${this.name}** did **${damage}** damage to **${this.player.member.displayName} (${this.player.hp.current}/${this.player.hp.max})**`,
        damage
      ]
    }
  }

  run() {
    const chance = Math.floor(Math.random() * 5)
    if (chance == 1) { return true } else return false
  }
}