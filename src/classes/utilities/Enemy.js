module.exports = class Enemy {
  constructor(player) {
    this.player = player
  }

  name = 'Enemy'
  setName(arg) { this.name = arg; return this }

  battle

  async load() {
    await this.setHP()
    return this
  }
  
  health = {}
  async setHP() {
    const difficulty = await this.player.difficulty
    const hp = Math.floor(this.player.health.current * (difficulty * (Math.random() * 0.10 + 0.95)))
    this.health = { current: hp, max: hp }
  }

  async dodge() {
    const stat_def = await this.player.def
    const defense = stat_def.current

    const math = defense / 100
    const random = Math.random().toFixed(2)

    return random < math ? true : false
  }

  async calculateDamage() {
    const playerAtt = await this.player.att
    const playerDiff = await this.player.difficulty

    return Math.floor(playerAtt.current * ((Math.random() * 0.2) + 0.85)) * playerDiff
  }

  async setDamage() { 
      this.battle.damage = Math.floor(await this.calculateDamage())
  }

  async attack() {
    await this.setDamage()

    if (await this.dodge() === true) {
      this.battle.embedActions.setStatus(`**${this.player.member.displayName}** dodged!`)
      this.battle.embedActions.updateBattle(99)
      return false
    } else this.player.health.current -= this.battle.damage

    if (this.player.health.current < 1) {
      this.battle.embedActions.setStatus(`**${this.name}** did **${this.battle.damage}** damage and you died at **(${this.player.health.current}/${this.player.health.max})** HP!`)
      this.battle.embedActions.updateBattle(1)
      return true
    } 
    
    else {
      this.battle.embedActions.setStatus(`**${this.name}** did **${this.battle.damage}** damage to **${this.player.member.displayName} (${this.player.health.current}/${this.player.health.max})**`)
      this.battle.embedActions.updateBattle(1)
      return false
    }
  }

  run() {
    const chance = Math.floor(Math.random() * 5)
    if (chance == 1) { return true } else return false
  }
}