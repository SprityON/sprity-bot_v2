const DB = require("../database/DB")
const Utils = require("./Utils")
const moment = require('moment')
const { sendEmbed } = require("./AdvancedEmbed")
const { MessageEmbed } = require("discord.js")

module.exports = class Player {
  constructor(member, msg) {
    this.msg = msg
    this.member = member
    this.name = this.member.displayName
  }

  /** 
   * Creates account for member
   * @param {object} member 
   */
  async create() {
    await DB.query(`insert into timer_dates (member_id, enddate, type) values ('${this.member.id}', '${moment().clone().format('M/D/YYYY H:mm:ss:SSS')}', 'daily');insert into timer_dates (member_id, enddate, type) values ('${this.member.id}', '${moment().clone().format('M/D/YYYY H:mm:ss:SSS')}', 'weekly');insert into timer_dates (member_id, enddate, type) values ('${this.member.id}', '${moment().clone().format('M/D/YYYY H:mm:ss:SSS')}', 'monthly');`)
  }

  /**
   * Checks if member has an account. If not, create one.
   * @returns {Boolean} 
   */
  hasAccount() {
    return new Promise(async (resolve) => {
      const result = await DB.query(`SELECT * FROM timer_dates WHERE member_id = ${this.member.id}`)

      if (result[0][0]) {
        resolve(true)
      } else (resolve(false), this.create())
    })
  }

  /**
   * Checks if player is able to level up. If true, then the player levels up.
   * @param {Number} amount 
   */
  async levelUp(amount) {
    const level = await this.level
    const experience = amount ? await this.experience + amount : await this.experience
    let levelExperience = 0

    for (let i = 0; i <= level; i++) 
      levelExperience += ((i + 1) * 125) + i * 125

    if (experience >= levelExperience) {
      const attributes = (await DB.query(`select attributes from members where member_id = ${this.member.id}`))[0][0].attributes
      this.msg.reply({ embeds: [sendEmbed(`You leveled up! You are now level **${level + 1}**.`)] })
      await DB.query(`update members set level = ${level + 1}, experience = ${experience}, attributes = ${attributes + 3} where member_id = ${this.member.id}`)
    } else {
      await DB.query(`update members set experience = ${experience} where member_id = ${this.member.id}`)
    }
  }

  get difficulty() {
    return new Promise(async (resolve) => {
      const result = await DB.query(`select difficulty from members where member_id = ${this.member.id}`)
      resolve(result[0][0].difficulty)
    })
  }

  get stats() {
    return new Promise(async (resolve) => {
      const result = await DB.query(`select stats from members where member_id = ${this.member.id}`)
      resolve(JSON.parse(result[0][0].stats))
    })
  }

  get att() {
    return new Promise(async (resolve) => {
      const stats = await this.stats
      resolve(stats.find(stat => stat.id === 'attack'))
    })
  }

  get def() {
    return new Promise(async (resolve) => {
      const stats = await this.stats
      resolve(stats.find(stat => stat.id === 'defense'))
    })
  }

  get throwable() {
    return new Promise(async (resolve) => {
      const result = await DB.query(`select throwable from members where member_id = ${this.member.id}`)
      let throwable = result[0][0].throwable

      resolve(throwable ? (() => {
        throwable = JSON.parse(throwable)[0]
        const throwableShop = require('../../commands/points/shop.json').find(t => t.id === throwable.id)
        throwable.damage = throwableShop.damage
        throwable.shop = throwableShop
        return throwable
      })() : '')
    })
  }

  async load() {
    await this.setHP()
    await this.setPotion()
    return this
  }

  health = {}
  async setHP() {
    const stats = await this.stats
    const health = stats.find(stat => stat.id === 'health')
    this.health = { current: health.current, max: health.current, cap: health.cap }
  }

  potion = {}
  async setPotion() {
    const result = await DB.query(`select potion from members where member_id = ${this.member.id}`)
    let potion = result[0][0].potion
    potion ? (() => {
      potion = JSON.parse(potion)[0]
      const potionShop = require('../../commands/points/shop.json').find(p => p.id === potion.id)
      potion.percentage = potionShop.heal_percentage
      potion.shop = potionShop
      this.potion = potion
     })() : this.potion = null
  }

  get level() {
    return new Promise(async (resolve) => {
      const result = await DB.query(`select level from members where member_id = ${this.member.id}`)
      resolve(result[0][0].level)
    })
  }

  get experience() {
    return new Promise(async (resolve) => {
      const result = await DB.query(`select experience from members where member_id = ${this.member.id}`)
      resolve(result[0][0].experience)
    })
  }

  get inventory() {
    return new Promise(async (resolve) => {
      const result = await DB.query(`select inventory from members where member_id = ${this.member.id}`)
      resolve(JSON.parse(result[0][0].inventory))
    })
  }

  get currentQuest() {
    return new Promise(async (resolve) => {
      const result = await DB.query(`select quests from members where member_id = ${this.member.id}`)
      const quests = JSON.parse(result[0][0].quests)
      resolve(quests.find(q => q.active === true && !q.tracker))
    })
  }

  get points() {
    return new Promise(async (resolve) => {
      const result = await DB.query(`select points from members where member_id = ${this.member.id}`)
      const points = result[0][0].points
      resolve(points)
    })
  }

  get messages() {
    return new Promise(async (resolve) => {
      const result = await DB.query(`select messages from members where member_id = ${this.member.id}`)
      const messages = result[0][0].messages
      resolve(messages)
    })
  }

  get experience() {
    return new Promise(async (resolve) => {
      const result = await DB.query(`select experience from members where member_id = ${this.member.id}`)
      const experience = result[0][0].experience
      resolve(experience)
    })
  }

  getDaily() {
    return new Promise(async (resolve) => {
      const result = await DB.query(`select enddate from timer_dates where member_id = ${this.member.id} and type = 'daily'`)
      if (result[0][0]) {
        const enddate = result[0][0].enddate

        const [arr, ongoing, message] = Utils.dateDifference(enddate)

        ongoing
          ? resolve([false, arr, message])
          : resolve([true])
      } else resolve([true])
    })
  }

  getWeekly() {
    return new Promise(async (resolve) => {
      const result = await DB.query(`select enddate from timer_dates where member_id = ${this.member.id} and type = 'weekly'`)
      if (result[0][0]) {
        const enddate = result[0][0].enddate

        const [arr, ongoing, message] = Utils.dateDifference(enddate)

        ongoing
          ? resolve([false, arr, message])
          : resolve([true])
      } else resolve([true])
    })
  }

  getMonthly() {
    return new Promise(async (resolve) => {
      const result = await DB.query(`select enddate from timer_dates where member_id = ${this.member.id} and type = 'monthly'`)
      if (result[0][0]) {
        const enddate = result[0][0].enddate

        const [arr, ongoing, message] = Utils.dateDifference(enddate)

        ongoing
          ? resolve([false, arr, message])
          : resolve([true])
      } else resolve([true])
    })
  }

  get settings() {
    return new Promise(async (resolve) => {
      const result = await DB.query(`select settings from settings where member_id = ${this.member.id}`)
      const settings = result[0][0] ? JSON.parse(result[0][0].settings) : []
      resolve(settings)
    })
  }

  /**
   * Checks whether or not a setting is enabled.
   * @param {String} setting 
   * @returns {Boolean}
   */
  settingIsEnabled = async (setting) => {
    return await new Promise(async (resolve) => {
      const settings = await this.settings
      settings.find(s => s.id === setting)
        ? resolve(true)
        : resolve(false)
    })
  }

  /**
   * Returns an embed of member's settings list.
   * @returns {MessageEmbed}
   */
  async showSettings(page) {
    const settingsJSON = require('../../commands/settings/settings.json')
    
    let message = await new Promise((resolve) => {
      Utils.embedList({
        JSONlist: settingsJSON,
        currPage: page,
        member: this.member,
        type: 'settings',
        showAmountOfItems: 5,
        title: `:gear: **${this.member.user.username}'s Settings**`
      }, message => resolve(message))
    })

    return message
  }
}