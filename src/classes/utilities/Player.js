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

  get inventory() {
    return new Promise(async (resolve, reject) => {
      const result = await DB.query(`select * from members where member_id = ${this.member.id}`)
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