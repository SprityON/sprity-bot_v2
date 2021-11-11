const Player = require('../../classes/utilities/Player')
const Utils = require('../../classes/utilities/Utils')
const moment = require('moment')
const DB = require('../../classes/database/DB')
const Bot = require('../../Bot')

module.exports = {
  name: Utils.getCmdName(__filename, __dirname),
  category: Utils.getCmdCategory(__filename),
  usage: 'monthly',
  aliases: [],
  permissions: ['SEND_MESSAGES'],
  timeout: 1000,

  async execute(msg, args) {
    const player = new Player(msg.member)
    let points = await player.points
    const [overTime, arr, overTimeMessage] = await player.getMonthly()

    if (overTime) {
      DB.query(`update timer_dates set enddate = '${moment().clone().add(1, 'month').format('M/D/YYYY H:mm:ss:SSS')}' where member_id = ${msg.member.id} and type = 'monthly'`)
      DB.query(`update members set points = '${points += 5000}' where member_id = '${msg.member.id}'`)

      const point = Bot.client.emojis.cache.find(e => e.name === 'pointdiscord')
      return msg.replyEmbed(`You have received your ${point} **${Utils.normalizePrice(5000)}** monthly points!`)
    } else msg.replyEmbed(`You cannot claim your monthly yet.\nPlease wait: **${overTimeMessage}**`)
  },

  help: {
    enabled: true,
    title: 'Monthly',
    description: `Get your Monthly points!`,
  }
}