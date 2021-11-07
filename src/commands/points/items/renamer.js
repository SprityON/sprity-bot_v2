const Utils = require('../../../classes/utilities/Utils')

module.exports = {
  name: Utils.getCmdName(__filename, __dirname),
  category: Utils.getCmdCategory(__filename),
  usage: '',
  aliases: [],
  permissions: ['SEND_MESSAGES'],
  timeout: 1000,

  async execute(msg, args) {
    return new Promise((resolve, reject) => {
      msg.replyEmbed(`Please type in your new nickname.`, { footer: 'type cancel to cancel' })

      const filter = m => m.author.id === msg.author.id
      msg.channel.awaitMessages(filter, { timeout: 120000, max: 1 })
        .then(collected => {
          if (collected.first().content.toLowerCase() === 'cancel') return resolve([false, 'Cancelled!'])

          msg.member.setNickname(collected.first().content, 'Renamer tool')

          resolve([true])
      })
    })
  },

  help: {
    enabled: false,
    title: '',
    description: ``,
  }
}