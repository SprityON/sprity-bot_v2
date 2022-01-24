const { Discord } = require('../../Bot')
const DB = require('../../classes/database/DB')
const Player = require('../../classes/utilities/Player')
const Utils = require('../../classes/utilities/Utils')
const { sendEmbed } = require('../../classes/utilities/AdvancedEmbed')

module.exports = {
  name: Utils.getCmdName(__filename, __dirname),
  category: Utils.getCmdCategory(__filename),
  usage: '',
  aliases: ['points', 'messages'],
  permissions: ['SEND_MESSAGES'],
  timeout: 1000,

  async execute(msg, args) {
    const player = new Player(msg.member)
    const result = await DB.query(`select * from members where member_id = ${msg.member.id}`)

    const date = new Date(msg.member.joinedAt)
    const joinedDate = `${date.getDate()}/${date.getMonth()}/${date.getFullYear()} *(EU)*`

    const embed = new Discord.MessageEmbed().setColor('#3E4BDD')
      .setTitle(`${msg.author.username}'s profile`)
      .setThumbnail(msg.author.avatarURL({dynamic: true}))
      .addField(`Messages`, Utils.normalizePrice(result[0][0].messages), true)
      .addField(`Points`, Utils.normalizePrice(await player.points), true)
      .addField(`Join Date`, joinedDate, true)

    msg.reply({ embeds: [embed] })
  },

  help: {
    enabled: true,
    title: 'Profile',
    description: `See your profile`,
  }
}