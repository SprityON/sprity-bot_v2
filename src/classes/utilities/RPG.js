const DB = require("../database/DB")
const Utils = require("./Utils")
const moment = require('moment')

module.exports = class RPG {
  constructor (member) {
    member
    ? this.member = member
    : (() => { throw new Error('Constructor needs member object') })
  }

  /** 
   * Creates RPG account for member
   * @param {object} member 
   */
  create(msg) {
    msg.replyEmbed(`Do you want to create an account? (Y/N)`)

    const filter = m => m.author.id === msg.author.id
    msg.channel.awaitMessages(filter, { 
      max: 1, 
      time: 30000 
    }).then(collected => {
      collected.first().content.toLowerCase() === 'y'
        ? msg.replyEmbed(`What will your username be?`)
          .then(async msg => {
            const collected = await msg.channel.awaitMessages(filter, { 
              max: 1, 
              timeout: 120000 
            }).catch(collected => {
              console.log(collected);

              msg.channel.send(`You were too late!`)
            })

            const username = collected.first().content

            msg.replyEmbed(`Your account was created!`)
            DB.query(`insert into rpg (member_id, username, inventory) values ('${this.member.id}', '${username}', '[{"points": 0}, {}]')`)
            DB.query(`insert into timer_dates (member_id, enddate, type) values ('${this.member.id}', '${moment().clone().format('M/D/YYYY H:mm:ss:SSS')}', 'daily')`)
            DB.query(`insert into timer_dates (member_id, enddate, type) values ('${this.member.id}', '${moment().clone().format('M/D/YYYY H:mm:ss:SSS')}', 'weekly')`)
            DB.query(`insert into timer_dates (member_id, enddate, type) values ('${this.member.id}', '${moment().clone().format('M/D/YYYY H:mm:ss:SSS')}', 'monthly')`)
          })
        : msg.replyEmbed(`Cancelled!`)
    }).catch(collected => {
      console.log(collected);

      msg.channel.send(`You were too late!`)
    })
  }

  /**
   * Deletes RPG account for member
   * @param {object} member 
   */
  delete(msg) {
    msg.replyEmbed(`Are you sure you want to delete your account? (Y/N)`)

    const filter = m => m.author.id === msg.author.id
    msg.channel.awaitMessages(filter, { 
      max: 1, 
      time: 120000 
    }).then(collected => {
      collected.first().content.toLowerCase() === 'y'
        ? 
        (() => {
          DB.query(`delete from rpg where member_id = ${msg.member.id}`)
          DB.query(`delete from timer_dates where member_id = ${msg.member.id}`)
          msg.replyEmbed(`Your account was deleted!`)
        })()
        : msg.replyEmbed(`Cancelled!`)
    })
    DB.query(`delete from rpg where member_id = ${this.member.id}`)
  }

  hasAccount(msg) {
    return new Promise(async (resolve, reject) => {
      const result = await DB.query(`SELECT * FROM rpg WHERE member_id = ${this.member.id}`)
      result[0][0]
        ? resolve(true)
        : (resolve(false), this.create(msg))
    })
  }

  get inventory() {
    return new Promise(async (resolve, reject) => {
      const result = await DB.query(`select * from rpg where member_id = ${this.member.id}`)
      resolve(JSON.parse(result[0][0].inventory))
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