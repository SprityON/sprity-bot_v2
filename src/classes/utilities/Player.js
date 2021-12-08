const DB = require("../database/DB")
const Utils = require("./Utils")
const moment = require('moment')

module.exports = class Player {
  constructor (member) {
    member
    ? this.member = member
    : (() => { throw new Error('Constructor needs member object') })
  }

  /** 
   * Creates account for member
   * @param {object} member 
   */
  async create() {
    DB.query(`insert into timer_dates (member_id, enddate, type) values ('${this.member.id}', '${moment().clone().format('M/D/YYYY H:mm:ss:SSS')}', 'daily')`)
    DB.query(`insert into timer_dates (member_id, enddate, type) values ('${this.member.id}', '${moment().clone().format('M/D/YYYY H:mm:ss:SSS')}', 'weekly')`)
    DB.query(`insert into timer_dates (member_id, enddate, type) values ('${this.member.id}', '${moment().clone().format('M/D/YYYY H:mm:ss:SSS')}', 'monthly')`)
  }

  hasAccount() {
    return new Promise(async (resolve, reject) => {
      const result = await DB.query(`SELECT * FROM timer_dates WHERE member_id = ${this.member.id}`)

      if (result[0][0]) {
        resolve(true)
      } else (resolve(false), this.create())
    })
  }

  async levelUp(amount, msg) {
    const level = await this.level
    const experience = amount ? await this.experience + amount : await this.experience
    let levelExperience = 0

    for (let i = 0; i <= level; i++) 
      levelExperience += ((i + 1) * 125) + i * 125

    if (experience >= levelExperience) {
      const attributes = (await DB.query(`select attributes from members where member_id = ${this.member.id}`))[0][0].attributes
      msg.replyEmbed(`You leveled up! You are now level **${level + 1}**.`)
      DB.query(`update members set level = ${level + 1}, experience = ${experience}, attributes = ${attributes + 3} where member_id = ${this.member.id}`)
    } else {
      DB.query(`update members set experience = ${experience} where member_id = ${this.member.id}`)
    }
  }

  get difficulty() {
    return new Promise(async (resolve, reject) => {
      const result = await DB.query(`select difficulty from members where member_id = ${this.member.id}`)
      resolve(result[0][0].difficulty)
    })
  }

  get stats() {
    return new Promise(async (resolve, reject) => {
      const result = await DB.query(`select stats from members where member_id = ${this.member.id}`)
      resolve(JSON.parse(result[0][0].stats))
    })
  }

  get health() {
    return new Promise(async (resolve, reject) => {
      const result = await DB.query(`select stats from members where member_id = ${this.member.id}`)
      resolve(JSON.parse(result[0][0].stats).health)
    })
  }

  get attack() {
    return new Promise(async (resolve, reject) => {
      const result = await DB.query(`select stats from members where member_id = ${this.member.id}`)
      resolve(JSON.parse(result[0][0].stats).attack)
    })
  }

  get defense() {
    return new Promise(async (resolve, reject) => {
      const result = await DB.query(`select stats from members where member_id = ${this.member.id}`)
      resolve(JSON.parse(result[0][0].stats).defense)
    })
  }

  get throwable() {
    return new Promise(async (resolve, reject) => {
      const result = await DB.query(`select throwable from members where member_id = ${this.member.id}`)
      const throwable = result[0][0].throwable

      resolve(throwable ? JSON.parse(throwable)[0] : '')
    })
  }

  get potion() {
    return new Promise(async (resolve, reject) => {
      const result = await DB.query(`select potion from members where member_id = ${this.member.id}`)
      const potion = result[0][0].potion

      resolve(potion ? JSON.parse(potion)[0] : '')
    })
  }

  get level() {
    return new Promise(async (resolve, reject) => {
      const result = await DB.query(`select level from members where member_id = ${this.member.id}`)
      resolve(result[0][0].level)
    })
  }

  get experience() {
    return new Promise(async (resolve, reject) => {
      const result = await DB.query(`select experience from members where member_id = ${this.member.id}`)
      resolve(result[0][0].experience)
    })
  }

  get inventory() {
    return new Promise(async (resolve, reject) => {
      const result = await DB.query(`select inventory from members where member_id = ${this.member.id}`)
      resolve(JSON.parse(result[0][0].inventory))
    })
  }

  get points() {
    return new Promise(async (resolve, reject) => {
      const result = await DB.query(`select points from members where member_id = ${this.member.id}`)
      const points = result[0][0].points
      resolve(points)
    })
  }

  get experience() {
    return new Promise(async (resolve, reject) => {
      const result = await DB.query(`select experience from members where member_id = ${this.member.id}`)
      const experience = result[0][0].experience
      resolve(experience)
    })
  }

  getDaily() {
    return new Promise(async (resolve, reject) => {
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
    return new Promise(async (resolve, reject) => {
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
    return new Promise(async (resolve, reject) => {
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
}