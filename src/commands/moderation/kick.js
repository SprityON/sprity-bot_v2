const Utils = require('../../classes/utilities/Utils')
const { sendEmbed } = require('../../classes/utilities/AdvancedEmbed')

module.exports = {
  name: Utils.getCmdName(__filename, __dirname),
  category: Utils.getCmdCategory(__filename),
  usage: 'kick <member> <reason>',
  aliases: [],
  permissions: ['KICK_MEMBERS'],
  timeout: 1000,

  async execute(msg, args) {
    const member = msg.mentions.members.first()
    if (!member) return msg.reply({ embeds: [sendEmbed(`You have to mention a member.`)] })
    
    msg.reply({ embeds: [sendEmbed(`Are you sure you want to kick **${member.user.username}**? **(Y/N)**\n*NOTE: Members automatically get kicked by the warn system!*`)] })

    const filter = m => m.author.id === msg.author.id
    msg.channel.awaitMessages(filter, { timeout: 30000, max: 1 })
    .then(collected => {
      const answer = collected.first().content.toLowerCase()
      if (answer !== 'y') return msg.reply({ embeds: [sendEmbed(`**${member.user.username}** was not kicked!`)] })
      

      let firstArgumentMemberId = args[0].slice(3, -1)
      if (firstArgumentMemberId == member.id && args[0].startsWith('<') && args[0].endsWith('>')) {
        if (member.kickable) {
          let argsWithoutMention = args.splice(1)
          let reason = argsWithoutMention.join(' ')
          

          if (!reason) return msg.reply({ embeds: [sendEmbed(`You have to provide a reason.`)] })

          member.kick(reason)
          
          msg.reply({ embeds: [sendEmbed(`${member.displayName} was kicked for: ${reason}`)] })
          
        } else return msg.reply({ embeds: [sendEmbed('You cannot kick this member.')] })
      } else return msg.reply({ embeds: [sendEmbed(`Incorrect arguments. Working example:\n$kick <member> <reason>`)] })
    })
  },

  help: {
    enabled: true,
    title: 'Kick',
    description: `Kick a member. Working example:\n${require('../../config.json').defaultPrefix}kick <member> <reason>`,
  }
}