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

  async att() {
    const playerAtt = await this.player.att
    const playerDiff = await this.player.difficulty
    
    return Math.floor(playerAtt * ((Math.random() * 0.2) + 0.85)) * playerDiff
  }

  async damageDone() { return Math.floor(await this.att()) }
  
  async attack()  {
    this.player.hp.current -= await this.damageDone()

    if (this.player.hp.current < 1) {
      return [true, `**${this.name}** did **${await this.damageDone()}** damage and you died with **${this.player.hp.current}** HP!`]
    } else {
      return [false, `**${this.name}** did **${await this.damageDone()}** damage. ***Your* HP: ${this.player.hp.current}/${this.player.hp.max}**\n\nType \`attack\`, \`throw\`, \`potion\` or \`run\``]
    }
  }

  run() {
    const chance = Math.floor(Math.random() * 5)
    if (chance == 1) { return true } else return false
  }
}