const Utils = require('../../classes/utilities/Utils')

module.exports = {
  name: Utils.getCmdName(__filename, __dirname),
  category: Utils.getCmdCategory(__filename),
  usage: '',
  aliases: [],
  permissions: ['SEND_MESSAGES'],
  timeout: 1000,

  async execute(msg, args) {
    const role = msg.guild.roles.cache.find(r => r.name === '@everyone')
    console.log(role);
    await msg.channel.updateOverwrite(role, {
      SEND_MESSAGES: false
    });

     msg.replyEmbed(`Channel locked.`)
  },

  help: {
    enabled: true,
    title: 'Lock Channel',
    description: `Lock a channel.`,
  }
}