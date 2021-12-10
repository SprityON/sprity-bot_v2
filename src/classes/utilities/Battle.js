const Bot = require("../../Bot");
const Player = require("./Player");

module.exports = class Battle extends Player {
  constructor(member, enemy = { name: 'Enemy', hp: 100, att: 10, def: 0 }) {
    super(member)

    this.enemy = enemy
    this.enemy.maxHealth = this.enemy.hp
    this.maxHealth = this.hp
    this.embed = new Bot.Discord.MessageEmbed().setColor('ffff00')
  }

  async playerHealth() { return await this.hp }
  async damageDone() { return Math.floor(await this.att * ((Math.random() * 0.3) + 0.85)) }

  async attack() {
    this.enemy.hp -= await this.damageDone()

    if (this.enemy.hp < 1) {
      if (this.enemyActions.run() === true) {
        return [false, `Oh no, **${this.enemy.name}** ran away from you!`]
      } else return [true, `You killed **${this.enemy.name}**`]
    } 
    
    else return ['skip', `You did **${await this.damageDone()}** damage! ***${this.enemy.name}'s* HP: ${this.enemy.hp}/${this.enemy.maxHealth}**`]
  }

  enemyActions = {
    attack: async (playerHealth) => {
      playerHealth -= this.enemy.att

      if (playerHealth < 1) {
        return [true, `**${this.enemy.name}** did **${this.enemy.att}** damage and you died with **${playerHealth}** HP!`]
      } else {
        return [false, `**${this.enemy.name}** did **${this.enemy.att}** damage. ***Your* HP: ${playerHealth}/${await this.maxHealth}**\n\nType \`attack\`, \`throw\`, \`potion\` or \`run\``]
      }
    },

    run: async() => {
      if (this.enemy.hp < 1) {
        const chance = Math.floor(Math.random() * 5) + 1
        if (chance == 1) { return true } else return false
      }
    }
  }

  embed = {
    setTitle(title) {

    },

    setDescription(description) {

    },

    setFooter(footer) {

    }
  }
}