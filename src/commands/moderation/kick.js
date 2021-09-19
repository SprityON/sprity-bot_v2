const Utils = require('../../classes/utilities/Utils')

module.exports = {
  name: Utils.getCmdName(__filename, __dirname),
  category: Utils.getCmdCategory(__filename),
  usage: 'kick <member> <reason>',
  aliases: [],
  permissions: ['SEND_MESSAGES'],
  timeout: 1000,

  execute(msg, args) {
    const member = msg.mentions.members.first()
    if (!member) return msg.inlineReply(`You have to mention a member.`)

    let firstArgumentMemberId = args[0].slice(3, -1)
    if (firstArgumentMemberId == member.id && args[0].startsWith('<') && args[0].endsWith('>')) {
      if (member.kickable) {
        let argsWithoutMention = args.splice(1)
        let reason = argsWithoutMention.join(' ')
        if (!reason) return msg.inlineReply(`You have to provide a reason.`)

        member.kick(reason)

        msg.inlineReply(`${member.displayName} was kicked for: ${reason}`)
      }
      else return msg.inlineReply('You cannot kick this member.')
    }
    else return msg.inlineReply(`Incorrect arguments. Working example:\n$kick <member> <reason>`)
  },

  help: {
    enabled: true,
    title: 'Kick',
    description: `Kick a member. Working example:\n${require('../../config.json').defaultPrefix}kick <member> <reason>`,
  }
}