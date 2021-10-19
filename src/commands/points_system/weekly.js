const DB = require('../../classes/database/DB')
const RPG = require('../../classes/utilities/RPG')
const Utils = require('../../classes/utilities/Utils')
const moment = require('moment')

module.exports = {
  name: Utils.getCmdName(__filename, __dirname),
  category: Utils.getCmdCategory(__filename),
  usage: 'weekly',
  aliases: [],
  permissions: ['SEND_MESSAGES'],
  timeout: 1000,

  async execute(msg, args) {
    const player = new RPG(msg.member)
    const inventory = await player.inventory
    const [overTime, arr, overTimeMessage] = await player.getWeekly()

    if (overTime) {
      DB.query(`update timer_dates set enddate = '${moment().clone().add(7, 'days').format('M/D/YYYY H:mm:ss:SSS')}' where member_id = ${msg.member.id} and type = 'weekly'`)

      inventory[0].points += 2000
      DB.query(`update rpg set inventory = '${JSON.stringify(inventory)}' where member_id = '${msg.member.id}'`)

      return msg.replyEmbed(`You have received your **2000** weekly points!`)
    } else msg.replyEmbed(`You cannot claim your weekly yet.\nPlease wait: **${overTimeMessage}**`)
  },

  help: {
    enabled: true,
    title: 'Weekly',
    description: `Get your weekly points!`,
  }
}