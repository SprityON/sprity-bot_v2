const { sendEmbed } = require('../../classes/utilities/AdvancedEmbed')
const Utils = require('../../classes/utilities/Utils')

module.exports = {
  name: Utils.getCmdName(__filename, __dirname),
  category: Utils.getCmdCategory(__filename),
  usage: 'ban <member> <reason>',
  aliases: [],
  permissions: ['BAN_MEMBERS'],
  timeout: 1000,

  async execute(msg, args) {
    const member = msg.mentions.members.first()
    if (!member) return msg.reply({embeds: [sendEmbed(`You have to mention a member!`)]})

    msg.reply({ embeds: [sendEmbed(`Are you sure you want to ban **${member.displayName}**? **(Y/N)**\n*NOTE: Members automatically get banned by the warn system!*`)]})

    const filter = m => m.author.id === msg.author.id
    msg.channel.awaitMessages({filter, timeout: 30000, max: 1 })
      .then(collected => {
        const answer = collected.first().content.toLowerCase()
        if (answer !== 'y') return msg.reply({ embeds: [sendEmbed(`**${member.displayName}** was not kicked!`)] })

        if (args[0] == member.id && args[0].startsWith('<@') && args[0].endsWith('>')) {
          if (member.bannable) {
            let argsWithoutMention = args.splice(1)
            let reason = argsWithoutMention.join(' ')
            if (!reason) return msg.reply({ embeds: [sendEmbed(`Please provide a reason!`)] })
            
            member.ban(reason)
            
            msg.reply({ embeds: [sendEmbed([
              [`${member.displayName} was banned for:`], [`${reason}`]
            ])] })
          } else return msg.reply({ embeds: [sendEmbed('I cannot ban this member.')] })
        } else return msg.reply({ embeds: [sendEmbed(`You have to provide a reason.`)] })
      })
  },

  help: {
    enabled: true,
    title: 'Ban',
    description: `Ban a member. Working example:\n${require('../../config.json').defaultPrefix}ban @john Disobeying the rules`
  }
}