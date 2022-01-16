const DB = require('../../classes/database/DB')
const Utils = require('../../classes/utilities/Utils')

module.exports = {
  name: Utils.getCmdName(__filename, __dirname),
  category: Utils.getCmdCategory(__filename),
  usage: 'unmute <member>',
  aliases: [],
  permissions: ['MANAGE_MESSAGES'],
  timeout: 1000,

  async execute(msg, args) {
    const member = msg.mentions.members.first()
    if (!member) return msg.reply(`You did not mention a member.`)

    const role = msg.guild.roles.cache.find(role => role.name === "Muted")

    if (member.roles.cache.find(r => r.name == role.name)) {
      member.roles.remove(role)
      msg.reply(`**${member.user.username}** has been unmuted!`)
      await DB.query(`DELETE FROM timer_dates WHERE member_id = ${member.id} AND 'type' = 'mute'`)
    } else {
      msg.reply(`**${member.user.username}** is already unmuted.`)
    }
  },

  help: {
    enabled: false,
    title: '',
    description: ``,
  }
}