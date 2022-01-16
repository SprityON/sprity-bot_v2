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
      return msg.reply(`That is not a valid number.`).then(msg => msg.delete({ timeout: 5000 }));

    if (args[0] > 100) 
      return msg.reply(`I can only delete up to 100 messages.`).then(msg => msg.delete({ timeout: 5000 }));

    if (args[0] < 1) 
      return msg.reply(`I can only delete messages starting from 1.`).then(msg => msg.delete({ timeout: 5000 }))

    msg.delete()

    msg.channel.bulkDelete(args[0])

    msg.channel.send(`Cleared ${args[0]} messages.`).then(msg => msg.delete({ timeout: 5000 }));
  },

  help: {
    enabled: true,
    title: '',
    description: ``,
  }
}