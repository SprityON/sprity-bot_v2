const Utils = require('../../classes/utilities/Utils')

module.exports = {
  name: Utils.getCmdName(__filename, __dirname),
  category: Utils.getCmdCategory(__filename),
  usage: 'ban <member> <reason>',
  aliases: [],
  permissions: ['BAN_MEMBERS'],
  timeout: 1000,

  execute(msg, args) {
    const member = msg.mentions.members.first()
    if (!member) return msg.inlineReply(`You have to mention a member!`)

    if (args[0] == member.id && args[0].startsWith('<@') && args[0].endsWith('>')) {
      if (member.bannable) {
        let argsWithoutMention = args.splice(1)
        let reason = argsWithoutMention.join(' ')
        if (!reason) return msg.inlineReply(`please provide a reason!`)

        member.ban(reason)

        msg.inlineReply(`${member.user.username} was banned for: ${reason}`)
      } else return msg.inlineReply('You cannot ban this member.')
    } else return msg.inlineReply(`You have to provide a reason.`)
  },

  help: {
    enabled: true,
    title: 'Ban',
    description: `Ban a member. Working example:\n${require('../../config.json').defaultPrefix}ban @john Disobeying the rules`
  }
}