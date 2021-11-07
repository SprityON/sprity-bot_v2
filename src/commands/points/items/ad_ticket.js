const { Discord } = require('../../../Bot')
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
      msg.replyEmbed(`Please type in your advertisement!`, { footer: 'type cancel to cancel' })

      const filter = m => m.author.id === msg.author.id
      msg.channel.awaitMessages(filter, { timeout: 1000000, max: 1 })
      .then(collected => {
        if (collected.first().content.toLowerCase() === 'cancel') return resolve([false, `Cancelled!`])

        const adChannel = msg.guild.channels.cache.get('818558571410096148')
        adChannel.send(
          new Discord.MessageEmbed().setColor('#3E4BDD')
          .setAuthor(`${msg.author.username} made an advertisement`, msg.author.avatarURL({dynamic: true}))
          .setDescription(collected.first().content)
          .setFooter(`Want to advertise? Buy an Ad Ticket from the shop!`)
        )

        resolve([true])
      }).catch(() => resolve([false, 'Out of time!']))
    })
  },

  help: {
    enabled: false,
    title: '',
    description: ``,
  }
}