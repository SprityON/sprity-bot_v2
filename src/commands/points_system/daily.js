const DB = require('../../classes/database/DB')
const RPG = require('../../classes/utilities/RPG')
const Utils = require('../../classes/utilities/Utils')
const moment = require('moment')

module.exports = {
  name: Utils.getCmdName(__filename, __dirname),
  category: Utils.getCmdCategory(__filename),
  usage: 'daily',
  aliases: [],
  permissions: ['SEND_MESSAGES'],
  timeout: 1000,
  points: true,

  async execute(msg, args) {
    const player = new RPG(msg.member)
    let points = await player.points
    const [overTime, arr, overTimeMessage] = await player.getDaily()

    if (overTime) {
      DB.query(`update timer_dates set enddate = '${moment().clone().add(12, 'hour').format('M/D/YYYY H:mm:ss:SSS')}' where member_id = ${msg.member.id} and type = 'daily'`)

      DB.query(`update members set points = '${points += 100}' where member_id = '${msg.member.id}'`)
 
      return msg.replyEmbed(`You have received your **100** daily points!`)
    } else msg.replyEmbed(`You cannot claim your daily yet.\nPlease wait: **${overTimeMessage}**`)
  },

  help: {
    enabled: true,
    title: 'Daily',
    description: `Get your daily points!`,
  }
}