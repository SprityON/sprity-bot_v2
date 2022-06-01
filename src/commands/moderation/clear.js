const { sendEmbed } = require('../../classes/utilities/AdvancedEmbed')
const Utils = require('../../classes/utilities/Utils')

module.exports = {
  name: Utils.getCmdName(__filename, __dirname),
  category: Utils.getCmdCategory(__filename),
  usage: 'clear <amount>',
  aliases: [],
  permissions: ['MANAGE_MESSAGES'],
  timeout: 1000,

  async execute(msg, args) {
    if (!args[0] || isNaN(args[0]))
      return msg.reply({ embeds: [sendEmbed(`That is not a valid number.`)] }).then(msg => {
        Utils.wait(5000).then(() => msg.delete().catch(() => { }))
      })

    if (args[0] > 100)
      return msg.reply({ embeds: [sendEmbed(`I can only delete up to 100 messages.`)] }).then(msg => {
        Utils.wait(5000).then(() => msg.delete().catch(() => { }))
      })

    if (args[0] < 1)
      return msg.reply({ embeds: [sendEmbed(`I can only delete messages starting from 1.`)] }).then(msg => {
        Utils.wait(5000).then(() => msg.delete().catch(() => { }))
      })

    await msg.delete().catch(() => { })

    msg.channel.bulkDelete(args[0])

    msg.channel.send({ embeds: [sendEmbed(`Cleared ${args[0]} message(s).`)] }).then(msg => {
      Utils.wait(5000).then(() => msg.delete().catch(() => { }))
    })
  },

  help: {
    enabled: true,
    title: 'Clear Messages',
    description: `Clear a certain amount of messages.`,
  }
}