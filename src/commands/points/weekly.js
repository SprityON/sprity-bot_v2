const DB = require('../../classes/database/DB')
const Player = require('../../classes/utilities/Player')
const Utils = require('../../classes/utilities/Utils')
const moment = require('moment')
const Bot = require('../../Bot')

module.exports = {
  name: Utils.getCmdName(__filename, __dirname),
  category: Utils.getCmdCategory(__filename),
  usage: 'weekly',
  aliases: [],
  permissions: ['SEND_MESSAGES'],
  timeout: 1000,

  async execute(msg, args) {
    const player = new Player(msg.member)
    let points = await player.points
    const [overTime, arr, overTimeMessage] = await player.getWeekly()

    if (overTime) {
      await DB.query(`update timer_dates set enddate = '${moment().clone().add(7, 'days').format('M/D/YYYY H:mm:ss:SSS')}' where member_id = ${msg.member.id} and type = 'weekly'`)
      await DB.query(`update members set points = '${points += 1000}' where member_id = '${msg.member.id}'`)

      const point = Bot.client.emojis.cache.find(e => e.name === 'pointdiscord')
      return msg.replyEmbed(`You have received your ${point} **${Utils.normalizePrice(1000)}** weekly points!`)
    } else msg.replyEmbed(`You cannot claim your weekly yet.\nPlease wait: **${overTimeMessage}**`)
  },

  help: {
    enabled: true,
    title: 'Weekly',
    description: `Get your weekly points!`,
  }
}