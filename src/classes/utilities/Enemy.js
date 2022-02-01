module.exports = class Enemy {
  constructor(player) {
    this.player = player
    this.name = 'Enemy'
    this.hp = this.player.hp.max * this.player.difficulty
    this.att = Math.floor(Math.floor(await (this.player.att * ((Math.random() * 0.2) + 0.85))) * await (this.player.difficulty))
  }

  /**
   * @param {String} arg
   */
  set setName(arg) { this.name = arg }
  get name() { return this.name }

  attack()  {
    this.player.hp.current -= Math.floor(this.enemy.att)

    if (this.player.hp.current < 1) {
      return [true, `**${this.enemy.name}** did **${this.enemy.att}** damage and you died with **${this.player.hp.current}** HP!`]
    } else {
      return [false, `**${this.enemy.name}** did **${this.enemy.att}** damage. ***Your* HP: ${this.player.hp.current}/${this.player.hp.max}**\n\nType \`attack\`, \`throw\`, \`potion\` or \`run\``]
    }
  }

  run() {
    if (this.enemy.hp < 1) {
      const chance = Math.floor(Math.random() * 4)
      if (chance == 1) { return true } else return false
    }
  }
}