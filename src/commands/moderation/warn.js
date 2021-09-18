const Utils = require('../../classes/utilities/Utils')
const DB = require("../../classes/database/DB")
const Bot = require('../../Bot')
const Member = require('../../classes/guild/Member')

module.exports = {
  name: Utils.getCmdName(__filename, __dirname),
  category: Utils.getCmdCategory(__filename),
  usage: '<member> <reason>',
  aliases: [],
  permissions: ['KICK_MEMBERS'],
  timeout: 1000,

  async execute(msg, args) {
    const member = msg.mentions.members.first()
    console.log(msg);
    if (!member) return msg.inlineReply(`You have to mention a member.`)
    const warns = await new Member(member).warns
    if (!args[1]) return msg.inlineReply(`You have to provide a reason.`)

    const warning1 = msg.guild.roles.cache.find(role => role.name === 'Warning 1')
    const warning2 = msg.guild.roles.cache.find(role => role.name === 'Warning 2')

    const reason = args.filter(arg => !Bot.Discord.MessageMentions.USERS_PATTERN.test(arg)).join(' ')
    msg.channel.send(new Bot.Discord.MessageEmbed()
      .addField(`${member.displayName} was warned by ${msg.member.displayName}`, `Warns: ${warns + 1}\nReason: ${reason}`))

    switch (warns) {
      case 0:
        member.roles.add(warning1)

        DB.query(`UPDATE members SET warning_reason_one = ?, warns = 1 WHERE member_id = ${member.id}`, [reason])

        break;
      case 1:
        member.roles.add(warning2)

        DB.query(`UPDATE members SET warning_reason_two = ?, warns = 2 WHERE member_id = ${member.id}`, [reason])

        break;
      case 2:
        member.roles.cache.find(role => role.name === "Kicked")
          ? (() => { 
            msg.inlineReply(`**${member.user.username}** Banned by warning system.\n\nReason:\n\`${reason}\``)
            new Member(member).ban(reason) 
          })()
          : (() => {
            msg.inlineReply(`**${member.user.username}** kicked by warning system.\n\nReason:\n\`${reason}\``)
            new Member(member).kick(reason)
          })()
        break;
    }
  },

  help: {
    enabled: true,
    title: 'Warn',
    description: `Warn a member. Working example:\n$warn @ingo Spamming constantly`,
  }
}