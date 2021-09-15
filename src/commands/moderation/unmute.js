const DB = require('../../classes/database/DB')
const Utils = require('../../classes/utilities/Utils')

module.exports = {
  name: Utils.getCmdName(__filename, __dirname),
  category: Utils.getCmdCategory(__filename),
  usage: '<member>',
  aliases: [],
  permissions: ['MANAGE_MESSAGES'],
  timeout: 1000,

  execute(msg, args) {
    const member = msg.mentions.members.first()
    if (!member) return msg.inlineReply(`You did not mention a member.`)

    const role = msg.guild.roles.cache.find(role => role.name === "Muted")

    if (member.roles.cache.find(r => r.name == role.name)) {
      member.roles.remove(role)
      msg.inlineReply(`**${msg.member.user.username}** has been unmuted!`)
      DB.query(`DELETE FROM timer_dates WHERE member_id = ${member.id}`)
    } else {
      msg.inlineReply(`**${member.user.username}** is already unmuted.`)
    }
  },

  help: {
    enabled: false,
    title: '',
    description: ``,
  }
}