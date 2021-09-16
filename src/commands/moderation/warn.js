const Utils = require('../../classes/utilities/Utils')
const DB = require("../../classes/database/DB")

module.exports = {
  name: Utils.getCmdName(__filename, __dirname),
  category: Utils.getCmdCategory(__filename),
  usage: '<member> <reason>',
  aliases: [],
  permissions: ['MANAGE_MESSAGES'],
  timeout: 1000,

  execute(msg, args) {
    let mentionedMember = msg.mentions.members.first()
    if (!mentionedMember) return msg.reply(`you did not mention a member!`)

    const warnRole1 = msg.guild.roles.cache.get('759688280923963392')
    const warnRole2 = msg.guild.roles.cache.get('759688483094396958')

    const warn1 = mentionedMember.roles.cache.find(role => role === warnRole1)
    const warn2 = mentionedMember.roles.cache.find(role => role === warnRole2)

    if (!args[1]) return msg.inlineReply(`You have to provide a reason.`)

    let argsWithoutMentions = args.filter(arg => !Discord.MessageMentions.USERS_PATTERN.test(arg))
    argsWithoutMentions = argsWithoutMentions.join(' ')

    DB.query(`SELECT * FROM members WHERE member_id = ${mentionedMember.id}`, data => {
      let result = data[0]
      if (warn1) { mentionedMember.roles.remove(warnRole1) }
      if (warn2) { mentionedMember.roles.remove(warnRole2) }

      if (result[0].warns == 0) {
        mentionedMember.roles.add(warnRole1)

        DB.query(`UPDATE members SET warning_reason_one = '${argsWithoutMentions}' WHERE member_id = ${mentionedMember.id}`)
        DB.query(`UPDATE members SET warns = 1 WHERE member_id = ${mentionedMember.id}`)
      } else if (result[0].warns == 1) {
        mentionedMember.roles.add(warnRole1)
        mentionedMember.roles.add(warnRole2)

        DB.query(`UPDATE members SET warning_reason_two = '${argsWithoutMentions}' WHERE member_id = ${mentionedMember.id}`)
        DB.query(`UPDATE members SET warns = 2 WHERE member_id = ${mentionedMember.id}`)
      } else if (result[0].warns == 2) {
        mentionedMember.roles.add(warnRole1)
        mentionedMember.roles.add(warnRole2)

        let kickedRole = mentionedMember.roles.cache.find(role => role.name === "Kicked")
        if (kickedRole) {
          if (!args[1]) return msg.reply(`this member has 2 warnings and is already kicked. You may ban **${mentionedMember.displayName}**!`)
        } else {
          if (!args[1]) return msg.reply(`this member has 2 warnings. You may kick **${mentionedMember.displayName}**!`)
        }
      }

      const embed = new Discord.MessageEmbed()
        .setColor(embedcolor)
        .addField(`${mentionedMember.displayName} was warned by ${msg.member.displayName}`, `Warns: ${result[0].warns + 1}\nReason: ${argsWithoutMentions}`)
      msg.channel.send(embed)
      Functions.updateDB.checkMemberWarns(mentionedMember)
    })
  },

  help: {
    enabled: false,
    title: '',
    description: ``,
  }
}