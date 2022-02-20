const DB = require('../../../classes/database/DB')
const { sendEmbed } = require('../../../classes/utilities/AdvancedEmbed')
const Player = require('../../../classes/utilities/Player')

module.exports = {
  async execute(msg, args) {
    return new Promise(async (resolve, reject) => {
      const messages = (await DB.query(`select messages from members where member_id = ${msg.member.id}`))[0][0].messages
      const player = new Player(msg.member)
      const points = await player.points
      const reward = messages * 1.25
      await DB.query(`update members set messages = 0, points = ${points + Math.ceil(reward)} where member_id = ${msg.member.id}`)
      msg.reply({ embeds: [sendEmbed(`You converted **${messages}** messages into **${Math.ceil(reward)}** points!`)]})
    })
  },
}