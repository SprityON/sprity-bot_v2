const { sendEmbed } = require('../../../classes/utilities/AdvancedEmbed')

module.exports = {
  async execute(msg, args) {
    return new Promise((resolve, reject) => {
      msg.reply({ embeds: [sendEmbed(`Please type in your new nickname.`, { footer: 'type cancel to cancel' })] })

      const filter = m => m.author.id === msg.author.id
      msg.channel.awaitMessages({filter, timeout: 120000, max: 1 })
        .then(collected => {
          if (collected.first().content.toLowerCase() === 'cancel') return resolve([false, 'Cancelled!'])

          if (!msg.member.managable) return msg.reply({ embeds: [sendEmbed(`I cannot configure your profile!`)] })
          msg.member.setNickname(collected.first().content, 'Renamer tool')

          resolve([true])
      })
    })
  },
}