const DB = require('../../classes/database/DB')
const Player = require('../../classes/utilities/Player')
const Utils = require('../../classes/utilities/Utils')
const moment = require('moment')
const Bot = require('../../Bot')
const { sendEmbed } = require('../../classes/utilities/AdvancedEmbed')

module.exports = {
  name: Utils.getCmdName(__filename, __dirname),
  category: Utils.getCmdCategory(__filename),
  usage: 'daily',
  aliases: [],
  permissions: ['SEND_MESSAGES'],
  timeout: 1000,

  async execute(msg, args) {
    const player = new Player(msg.member)
    let points = await player.points
    const [overTime, arr, overTimeMessage] = await player.getDaily()

    if (overTime) {
      await DB.query(`update timer_dates set enddate = '${moment().clone().add(12, 'hour').format('M/D/YYYY H:mm:ss:SSS')}' where member_id = ${msg.member.id} and type = 'daily'`)
      await DB.query(`update members set points = '${points += 250}' where member_id = '${msg.member.id}'`)

      const point = Bot.client.emojis.cache.find(e => e.name === 'pointdiscord')
      
      return msg.reply({ embeds: [sendEmbed(`You have received your ${point} **250** daily points!`)] })
    } else msg.reply({ embeds: [sendEmbed(`You cannot claim your daily yet.\nPlease wait: **${overTimeMessage}**`)] })
  },

  help: {
    enabled: true,
    title: 'Daily',
    description: `Get your daily points!`,
  }
}