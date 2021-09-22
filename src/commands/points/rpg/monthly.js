const RPG = require('../../../classes/utilities/RPG')
const Utils = require('../../../classes/utilities/Utils')
const moment = require('moment')
const DB = require('../../../classes/database/DB')

module.exports = {
  name: Utils.getCmdName(__filename, __dirname),
  category: Utils.getCmdCategory(__filename),
  usage: 'monthly',
  aliases: [],
  permissions: ['SEND_MESSAGES'],
  timeout: 1000,

  async execute(msg, args) {
    const player = new RPG(msg.member)
    const inventory = await player.inventory
    const [overTime, arr, overTimeMessage] = await player.getMonthly()

    if (overTime) {
      DB.query(`update timer_dates set enddate = '${moment().clone().add(1, 'month').format('M/D/YYYY H:mm:ss:SSS')}' where member_id = ${msg.member.id} and type = 'monthly'`)

      inventory[0].points += 10000
      DB.query(`update rpg set inventory = '${JSON.stringify(inventory)}' where member_id = '${msg.member.id}'`)

      return msg.replyEmbed(`You have received your 10000 monthly points!`)
    } else msg.replyEmbed(`You cannot claim your monthly yet.\nPlease wait: **${overTimeMessage}**`)
  },

  help: {
    enabled: true,
    title: 'Monthly',
    description: `Get your Monthly points!`,
  }
}