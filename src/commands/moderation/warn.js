const Utils = require('../../classes/utilities/Utils')
const { sendEmbed } = require('../../classes/utilities/AdvancedEmbed')
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
    if (!member) return msg.reply({ embeds: [sendEmbed(`You have to mention a member.`)]})
    let warns = JSON.parse(await DB.member.getWarns(member))
    if (!args[1]) return msg.reply({ embeds: [sendEmbed(`You have to provide a reason.`)]})

    let warning1 = msg.guild.roles.cache.find(role => role.name === 'Warning 1')
    let warning2 = msg.guild.roles.cache.find(role => role.name === 'Warning 2')
    let kicked = msg.guild.roles.cache.find(role => role.name === 'Kicked')
    const reason = args.filter(arg => !Bot.Discord.MessageMentions.USERS_PATTERN.test(arg)).join(' ')

    warns.push(reason)

    switch (warns.length - 1) {
      case 0:
        member.roles.add(warning1)

        await DB.query(`UPDATE members SET warns = '${JSON.stringify(warns)}' WHERE member_id = ${member.id}`)

        break;
      case 1:
        member.roles.add(warning2)

        await DB.query(`UPDATE members SET warns = '${JSON.stringify(warns)}' WHERE member_id = ${member.id}`)

        break;
      case 2:
        member.roles.cache.find(role => role.name === "Kicked")
          ? (
            msg.reply({ embeds: [sendEmbed(`**${member.user.username}** banned by warning system.`)]}),
            await DB.query(`delete from members where guild_id = ${msg.guild.id} and member_id = ${msg.member.id}`),
            member.ban(reason)
          )
          : (
            msg.reply({ embeds: [sendEmbed(`**${member.user.username}** kicked by warning system.`)]}),
            await DB.query(`update members set kicked = 1, warns = '[]' where member_id = ${member.id}`),
            member.kick(reason)
          )
        break;
    }
    msg.reply({ embeds: [sendEmbed([], { title: `${member.user.username} was warned by ${msg.member.user.username} for:`, description: `\`${reason}\`` })] })
  },

  help: {
    enabled: true,
    title: 'Warn',
    description: `Warn a member. Working example:\n$warn @ingo Spamming constantly`,
  }
}