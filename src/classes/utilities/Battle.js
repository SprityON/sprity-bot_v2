const Bot = require("../../Bot");
const DB = require("../database/DB");
const Utils = require("./Utils");

module.exports = class Battle {
  constructor() {
    this.embed = new Bot.Discord.MessageEmbed()
    this.status = 'No Interaction'
    this.history = [this.status]
  }

  player
  enemy

  embedActions = {
    updateBattle: (num) => {
      const heart = Bot.client.emojis.cache.find(e => e.name === 'heart_rpg')

      this.embed.spliceFields(0, 99)
        .addField(`${this.player.name}`, `${this.player.health.current}/${this.player.health.max} ${heart} ${num === 1
          ? this.damage ? `(-${this.damage})` : ''
          : num === 2
            ? `(+${Math.floor(this.player.health.max / 100 * this.player.potion.percentage)})`
            : ''
          }`, true)
        .addField(`${this.enemy.name}`, `${this.enemy.health.current}/${this.enemy.health.max} ${heart} ${num === 0
          ? this.damage ? `(-${this.damage})` : ''
          : num === 3
            ? `(+${Math.floor(this.player.health.max / 100 * this.player.potion.percentage)})`
            : ''
          }`, true)
        .addField(`\u200b`, `*Status: ${this.status}*`)

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
        .spliceFields(0, 99)
        .setDescription(this.history.join("\n\n"))
        .setColor(Utils.colors.grey)

      return this.embed
    },

    showBattle: () => {
      this.embedActions
        .setDescription(this.embedActions.description)
        .updateBattle(99)
        .setColor(Utils.colors.red)

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
  async setDamage() {
    console.log(await this.player);
    const stat_att = await this.player.att
    this.damage = Math.floor(stat_att.current * ((Math.random() * 0.3) + 0.85))
  }

  async dodge() {
    const stat_def = await this.player.def
    const defense = stat_def.current

    const math = defense / 100
    const random = Math.random().toFixed(2)

    return random < math ? true : false
  }

  async usePotion() {
    const emote = this.player.potion.shop.uploaded
      ? Bot.client.emojis.cache.find(e => e.name === this.player.potion.shop.emoji)
      : this.player.potion.shop.emoji

    if (this.player.health.current >= this.player.health.max) {
      this.embedActions.setStatus(`**${this.player.name}** is already at full health!`)
      this.embedActions.updateBattle(99)
      return 'skip'
    } else {
      this.player.potion.amount -= 1

      this.player.potion.amount < 1
        ? await DB.query(`update members set potion = '' where member_id = ${this.player.member.id}`)
        : await DB.query(`update members set potion = '[${JSON.stringify(this.player.potion)}]' where member_id = ${this.player.member.id}`)

      this.player.health.current += Math.floor(this.player.health.max / 100 * this.player.potion.percentage)

      if (this.player.health.current >= this.player.health.max) this.player.health.current = this.player.health.max

      this.embedActions.setStatus(`**${this.player.name}** used ${emote}`)
      this.embedActions.updateBattle(2)
      return false
    }
  }

  async useThrowable() {
    let throwable = await this.player.throwable
    const emote = throwable.shop.uploaded ? Bot.client.emojis.cache.find(e => e.name === throwable.shop.emoji) : throwable.shop.emoji

    throwable.amount -= 1

    this.damage = throwable.shop.damage
    this.enemy.health.current -= this.damage

    throwable.amount < 1
      ? await DB.query(`update members set throwable = '' where member_id = ${this.player.member.id}`)
      : await DB.query(`update members set throwable = '[${JSON.stringify(throwable)}]' where member_id = ${this.player.member.id}`)

    if (this.enemy.hp.current < 1) {
      this.embedActions.setStatus(`**${this.player.name}** killed **${this.enemy.name}** with ${emote}!`)
      this.embedActions.updateBattle(0)
      return true
    } else {
      this.embedActions.setStatus(`**${this.player.name}** threw a ${emote} **${throwable.shop.name}** and did **${throwable.shop.damage}** damage to **${this.enemy.name}'s (${this.enemy.health.current}/${this.enemy.health.max})**`)
      this.embedActions.updateBattle(0)
      return false
    }
  }

  async attack() {
    await this.setDamage()

    if (await this.dodge() === true) {
      this.embedActions.setStatus(`**${this.enemy.name}** dodged!`)
      this.embedActions.updateBattle(99)
      return 'skip'
    }

    this.enemy.health.current -= this.damage

    if (this.enemy.health.current < 1) {
      if (this.run() === true) {
        this.embedActions.setStatus(`Oh no, **${this.enemy.name}** ran away from **${this.player.name}**!`)
        this.embedActions.updateBattle(0)
        return false
      }

      else {
        this.embedActions.setStatus(`**${this.player.name}** killed **${this.enemy.name}** (**${this.enemy.health.current}/${this.enemy.hp.max}**)`)
        this.embedActions.updateBattle(0)
        return true
      }
    }

    else {
      this.embedActions.setStatus(`**${this.player.name}** did **${this.damage}** damage to **${this.enemy.name} (${this.enemy.health.current}/${this.enemy.health.max})**`)
      this.embedActions.updateBattle(0)
      return 'skip'
    }

  }

  run() {
    const chance = Math.floor(Math.random() * 3) + 1

    if (chance == 1) {
      this.embedActions.setStatus(`**${this.player.name}** couldn't run away from **${this.enemy.name}**!`)
      this.embedActions.updateBattle(99)
      return false
    } else {

      this.embedActions.setStatus(`**${this.player.name}** successfully ran away from **${this.enemy.name}**!`)
      this.embedActions.updateBattle(99)
      return true
    }
  }
}