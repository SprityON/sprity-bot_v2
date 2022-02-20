const { Discord } = require('../../../Bot')
const { sendEmbed } = require('../../../classes/utilities/AdvancedEmbed')

module.exports = {
  async execute(msg, args) {
    return new Promise((resolve, reject) => {

      msg.reply({ embeds: [sendEmbed(`Please type in your advertisement!`, { footer: 'type cancel to cancel' })] })

      const filter = m => m.author.id === msg.author.id
      msg.channel.awaitMessages({filter, timeout: 1000000, max: 1 })
      .then(collected => {
        if (collected.first().content.toLowerCase() === 'cancel') return resolve([false, `Cancelled!`])

        const adChannel = msg.guild.channels.cache.get('818558571410096148')
        adChannel.send(
          new Discord.MessageEmbed().setColor('#3E4BDD')
          .setAuthor({name: `${msg.author.username} made an advertisement`, iconURL: msg.author.avatarURL({dynamic: true})})
          .setDescription(collected.first().content)
          .setFooter({ text: `Want to advertise? Buy an Ad Ticket from the shop!`})
        )

        resolve([true])
      }).catch(() => resolve([false, 'Out of time!']))
    })
  },
}