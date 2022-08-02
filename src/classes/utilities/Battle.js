const Bot = require("../../Bot");
const DB = require("../database/DB");
const Utils = require("./Utils");

module.exports = class Battle {
  constructor() {
    this.embed = new Bot.Discord.MessageEmbed()
    this.status = ''
    this.history = [this.status]
  }

  player
  enemy
  
  turn
  nextTurn

  players = []
  setPlayers(...players) {
    players.forEach(player => {
      this.players.push(player)
    })

    this.player = players[0]
    this.enemy = players[1]

    this.turn = players[0]
    this.nextTurn = players[1]
  }

  calculateNextTurn = () => {
    let temp = this.nextTurn
    this.nextTurn = this.turn
    this.turn = temp
  }

  embedActions = {
    updateBattle: (num, oldHealth) => {
      if (num !== 99) this.calculateNextTurn()
      const heart = Bot.client.emojis.cache.find(e => e.name === 'heart_rpg')

      this.embed.spliceFields(0, 99)

      this.players.forEach(player => {
        this.embed.addField(`${player.name}`, `${player.health.current}/${player.health.max} ${heart} ${num === 1
          ? this.damage ? `(-${this.damage})` : ''
          : num === 2
            ? player.potion 
              ? this.turn.health.current >= this.turn.health.max 
                ? `(+${Math.floor(player.health.max - oldHealth)})`
                : `(+${Math.floor(player.health.max / 100 * player.potion.percentage)})` : ''
              : ''
          }`, true)
      })

      this.embed.setTitle(`Battle: ${this.player.name} VS ${this.enemy.name}`)
      this.embed.setColor(Utils.colors.yellow)
      this.embed.addField(`\u200b`, `*Status: ${this.status}*`)

      return this.embed
    },

    setTitle: (title) => { this.embed.setTitle(title); return this.embedActions },
    setDescription: (description) => { this.embed.setDescription(description); return this.embedActions },
    setFooter: (footer) => { this.embed.setFooter(footer); return this.embedActions },
    setColor: (color) => { this.embed.setColor(color); return this.embedActions },
    addField: (key, value, inline) => { this.embed.addField(key, value, inline ? true : false); return this.embedActions },
    spliceFields: (index, deleteCount) => { this.embed.spliceFields(index, deleteCount); return this.embedActions },

    setStatus: (status) => {
      this.status = status
      this.history.push(status)
      return this.embedActions
    },

    description: '',
    showHistory: () => {
      this.embedActions.description = this.embed.description;
      this.embed
        .setTitle(`Battle: ${this.player.name} VS ${this.enemy.name} (History)`)
        .spliceFields(0, 99)
        .setDescription(this.history.join("\n\n"))
        .setColor(Utils.colors.grey)

      return this.embed
    },

    showBattle: () => {
      this.embedActions.description 
        ? this.embedActions.setDescription(this.embedActions.description)
        :  this.embed.description = null

      this.embedActions
        .updateBattle(99)
        .setColor(Utils.colors.yellow)

      return this.embed
    },

    request: {
      showRequest: async () => {
        const heart = Bot.client.emojis.cache.find(e => e.name === 'heart_rpg')
        const attack = Bot.client.emojis.cache.find(e => e.name == 'attack_rpg')
        const defense = Bot.client.emojis.cache.find(e => e.name == 'defense_rpg')

        const playerStats = await this.player.stats
        const mentionStats = await this.enemy.stats

        function showStats(stats) {
          const hp = stats.find(stat => stat.id === 'health')
          const att = stats.find(stat => stat.id === 'attack')
          const def = stats.find(stat => stat.id === 'defense')
          return `${heart} **${hp.current}**\n${attack} **${att.current}**\n${defense} **${def.current}**`
        }

        this.embedActions
          .setTitle(`Battle: ${this.player.name} VS ${this.enemy.name}`)
          .addField(`${this.player.name}`, showStats(playerStats), true)
          .addField(`${this.enemy.name}`, showStats(mentionStats), true)
          .setStatus(`Awaiting response from **${this.enemy.name}**`)
          .addField(`\u200b`, `*Status: ${this.status}*`)
          .setColor(Utils.colors.yellow)

        return this.embed
      },

      requestAccepted: () => {
        this.embedActions
          .spliceFields(this.embed.fields.length - 1, 1)
          .setStatus(`**${this.enemy.name}** has accepted the request`)
          .addField(`\u200b`, `*Status: ${this.status}*`)
          .setColor(Utils.colors.green)

        return this.embed
      },

      requestCancelled: () => {
        this.embedActions
          .spliceFields(this.embed.fields.length - 1, 1)
          .setStatus(`Battle has been cancelled`)
          .addField(`\u200b`, `*Status: ${this.status}*`)
          .setColor(Utils.colors.red)

        return this.embed
      },

      getButtons: (disabled) => {
        return new Bot.Discord.MessageActionRow().addComponents(
          new Bot.Discord.MessageButton()
            .setLabel(`Accept`)
            .setCustomId(`battle_accept`)
            .setDisabled(disabled ? true : false)
            .setStyle(disabled ? 'SECONDARY' : 'SUCCESS'),

          new Bot.Discord.MessageButton()
            .setLabel(`Calculate Chance`)
            .setCustomId(`battle_calculate`)
            .setDisabled(disabled ? true : false)
            .setStyle(disabled ? 'SECONDARY' : 'SECONDARY'),

          new Bot.Discord.MessageButton()
            .setLabel(`Cancel`)
            .setCustomId(`battle_cancel`)
            .setDisabled(disabled ? true : false)
            .setStyle(disabled ? 'SECONDARY' : 'DANGER')
        )
      },
    },

    getActionButtons: (disabled) => {
      return new Bot.Discord.MessageActionRow().addComponents(
        new Bot.Discord.MessageButton()
          .setCustomId('battle_attack')
          .setLabel('Attack')
          .setDisabled(disabled ? true : false)
          .setStyle(disabled ? 'SECONDARY' : 'SECONDARY'),

        new Bot.Discord.MessageButton()
          .setCustomId('battle_throw')
          .setLabel('Throw')
          .setDisabled(disabled ? true : false)
          .setStyle(disabled ? 'SECONDARY' : 'SECONDARY'),

        new Bot.Discord.MessageButton()
          .setCustomId('battle_potion')
          .setLabel('Potion')
          .setDisabled(disabled ? true : false)
          .setStyle(disabled ? 'SECONDARY' : 'SECONDARY'),

        new Bot.Discord.MessageButton()
          .setCustomId('battle_run')
          .setLabel('Run')
          .setDisabled(disabled ? true : false)
          .setStyle(disabled ? 'SECONDARY' : 'DANGER'),

        new Bot.Discord.MessageButton()
          .setCustomId('battle_history')
          .setLabel('History')
          .setDisabled(disabled ? true : false)
          .setStyle(disabled ? 'SECONDARY' : 'PRIMARY'),
      )
    },

    getHistoryButtons: (disabled) => {
      return new Bot.Discord.MessageActionRow().addComponents(
        new Bot.Discord.MessageButton()
          .setCustomId('battle_present')
          .setLabel('< Back')
          .setDisabled(disabled ? true : false)
          .setStyle(disabled ? 'SECONDARY' : 'SECONDARY'),
      )
    }
  }

  damage = 0
  async setDamage () {
    if (this.turn.isNPC) return this.damage = await this.turn.calculateDamage()
    const stat_att = await this.turn.att
    this.damage = Math.floor(stat_att.current * ((Math.random() * 0.3) + 0.85))
  }

  async dodge() {
    let defense

    if (this.turn.isNPC) {
      defense = 20
    } else {
      let stat_def = await this.turn.def
      defense = stat_def.current
    }

    const math = defense / 100
    const random = Math.random().toFixed(2)

    return random < math ? true : false
  }

  async usePotion() {
    const emote = this.turn.potion.shop.uploaded
      ? Bot.client.emojis.cache.find(e => e.name === this.turn.potion.shop.emoji)
      : this.turn.potion.shop.emoji

    if (this.turn.health.current >= this.turn.health.max) {
      this.embedActions.setStatus(`**${this.turn.name}** is already at full health!`)
      this.embedActions.updateBattle(99)
      return 'skip'
    } else {
      this.turn.potion.amount -= 1

      this.turn.potion.amount < 1
        ? await DB.query(`update members set potion = '' where member_id = ${this.turn.member.id}`)
        : await DB.query(`update members set potion = '[${JSON.stringify(this.turn.potion)}]' where member_id = ${this.turn.member.id}`)

      this.turn.health.current += Math.floor(this.turn.health.max / 100 * this.turn.potion.percentage)

      let oldHealth = this.turn.health.current
      if (this.turn.health.current >= this.turn.health.max) this.turn.health.current = this.turn.health.max

      this.embedActions.setStatus(`**${this.turn.name}** used ${emote}`)
      this.embedActions.updateBattle(2, oldHealth)
      return false
    }
  }

  async useThrowable() {
    let throwable = await this.turn.throwable
    const emote = throwable.shop.uploaded ? Bot.client.emojis.cache.find(e => e.name === throwable.shop.emoji) : throwable.shop.emoji

    throwable.amount -= 1

    this.damage = throwable.shop.damage
    this.nextTurn.health.current -= this.damage

    throwable.amount < 1
      ? await DB.query(`update members set throwable = '' where member_id = ${this.turn.member.id}`)
      : await DB.query(`update members set throwable = '[${JSON.stringify(throwable)}]' where member_id = ${this.turn.member.id}`)

    if (this.nextTurn.health.current < 1) {
      this.embedActions.setStatus(`**${this.turn.name}** killed **${this.nextTurn.name}** with ${emote}!`)
      this.embedActions.updateBattle(0)
      return true
    } else {
      this.embedActions.setStatus(`**${this.turn.name}** threw a ${emote} **${throwable.shop.name}** and did **${throwable.shop.damage}** damage to **${this.nextTurn.name}'s (${this.nextTurn.health.current}/${this.nextTurn.health.max})**`)
      this.embedActions.updateBattle(0)
      return false
    }
  }

  async attack() {
    await this.setDamage()

    if (await this.dodge() === true) {
      this.embedActions.setStatus(`**${this.nextTurn.name}** dodged!`)
      this.embedActions.updateBattle(98)
      return 'skip'
    }

    this.nextTurn.health.current -= this.damage

    if (this.nextTurn.health.current < 1) {
      if (this.run() === true) {
        this.embedActions.setStatus(`**${this.nextTurn.name}** ran away from **${this.turn.name}**!`)
        this.embedActions.updateBattle(0)
        return false
      }

      else {
        this.embedActions.setStatus(`**${this.turn.name}** killed **${this.nextTurn.name}** (**${this.nextTurn.health.current}/${this.nextTurn.health.max}**)`)
        this.embedActions.updateBattle(0)
        return true
      }
    }

    else {
      this.embedActions.setStatus(`**${this.turn.name}** did **${this.damage}** damage to **${this.nextTurn.name} (${this.nextTurn.health.current}/${this.nextTurn.health.max})**`)
      this.embedActions.updateBattle(0)
      return 'skip'
    }

  }

  run() {
    const chance = Math.floor(Math.random() * 4)

    if (chance < 3) {
      this.embedActions.setStatus(`**${this.turn.name}** couldn't run away from **${this.nextTurn.name}**!`)
      this.embedActions.updateBattle(99)
      return false
    } else {

      this.embedActions.setStatus(`**${this.turn.name}** successfully ran away from **${this.nextTurn.name}**!`)
      this.embedActions.updateBattle(99)
      return true
    }
  }
}