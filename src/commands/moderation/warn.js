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
    let warns = await DB.member.getWarns(member)
    if (!args[1]) return msg.inlineReply(`You have to provide a reason.`)

    const warning1 = msg.guild.roles.cache.find(role => role.name === 'Warning 1')
    const warning2 = msg.guild.roles.cache.find(role => role.name === 'Warning 2')

    const reason = args.filter(arg => !Bot.Discord.MessageMentions.USERS_PATTERN.test(arg)).join(' ')

    if (warns == 0 || warns == 3) {

    } else if (warns == 1 || warns == 4) {

    } else if (warns == 2 || warns == 5) {}

    switch (warns) {
      case 0: case 3:
        member.roles.add(warning1)

        warns++
        DB.query(`UPDATE members SET warning_reason_one = ?, warns = ${warns} WHERE member_id = ${member.id}`, [reason])

        break;
      case 1: case 4:
        member.roles.add(warning2)

        warns++
        DB.query(`UPDATE members SET warning_reason_two = ?, warns = ${warns} WHERE member_id = ${member.id}`, [reason])

        break;
      case 2: case 5:
        warns++
        DB.query(`UPDATE members SET warning_reason_two = ?, warns = ${warns} WHERE member_id = ${member.id}`, [reason])

        member.roles.cache.find(role => role.name === "Kicked")
          ? (() => { 
            msg.inlineReply(`**${member.user.username}** Banned by warning system.\n\nReason:\n\`${reason}\``)
            member.ban(reason)
          })()
          : (() => {
            msg.inlineReply(`**${member.user.username}** kicked by warning system.\n\nReason:\n\`${reason}\``)
            DB.query(`update members set kicked = 1 where member_id = ${member.id}`)
            member.kick(reason)
          })()
        break;
    }

    msg.channel.send(new Bot.Discord.MessageEmbed()
      .addField(`${member.user.username} was warned by ${msg.member.user.username}`, `Warns: ${warns}\nReason: ${reason}`))
  },

  help: {
    enabled: true,
    title: 'Warn',
    description: `Warn a member. Working example:\n$warn @ingo Spamming constantly`,
  }
}