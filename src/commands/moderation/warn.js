const Utils = require('../../classes/utilities/Utils')
const DB = require("../../classes/database/DB")
const Bot = require('../../Bot')

module.exports = {
  name: Utils.getCmdName(__filename, __dirname),
  category: Utils.getCmdCategory(__filename),
  usage: 'warn <member> <reason>',
  aliases: [],
  permissions: ['KICK_MEMBERS'],
  timeout: 1000,

  async execute(msg, args) {
    const member = msg.mentions.members.first()
    if (!member) return msg.inlineReply(`You have to mention a member.`)
    let warns = JSON.parse(await DB.member.getWarns(member))
    if (!args[1]) return msg.inlineReply(`You have to provide a reason.`)

    const warning1 = msg.guild.roles.cache.find(role => role.name === 'Warning 1')
    const warning2 = msg.guild.roles.cache.find(role => role.name === 'Warning 2')

    const reason = args.filter(arg => !Bot.Discord.MessageMentions.USERS_PATTERN.test(arg)).join(' ')

    warns.push(reason)

    switch (warns.length - 1) {
      case 0:
        member.roles.add(warning1)

        DB.query(`UPDATE members SET warns = '${JSON.stringify(warns)}' WHERE member_id = ${member.id}`)

        break;
      case 1:
        member.roles.add(warning2)

        DB.query(`UPDATE members SET warns = '${JSON.stringify(warns)}' WHERE member_id = ${member.id}`)

        break;
      case 2:
        member.roles.cache.find(role => role.name === "Kicked")
          ? (
            msg.inlineReply(`**${member.user.username}** Banned by warning system.`),
            member.ban(reason)
          )
          : (
            msg.inlineReply(`**${member.user.username}** kicked by warning system.`),
            DB.query(`update members set kicked = 1, warns = '[]' where member_id = ${member.id}`),
            member.kick(reason)
          )
        break;
    }

    msg.replyEmbed([], { title: `${member.user.username} was warned by ${msg.member.user.username} for:`, description: `\`${reason}\`` })
  },

  help: {
    enabled: true,
    title: 'Warn',
    description: `Warn a member. Working example:\n$warn @ingo Spamming constantly`,
  }
}