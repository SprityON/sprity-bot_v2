const Utils = require('../../classes/utilities/Utils')

module.exports = {
  name: Utils.getCmdName(__filename, __dirname),
  category: Utils.getCmdCategory(__filename),
  usage: '',
  aliases: [],
  permissions: ['BAN_MEMBERS'],
  timeout: 1000,

  async execute(msg, args) {
    const role = msg.guild.roles.cache.find(r => r.name === '@everyone')
    await msg.channel.updateOverwrite(role, {
      SEND_MESSAGES: true
    });

    msg.replyEmbed(`Channel unlocked.`)
  },

  help: {
    enabled: true,
    title: 'Unlock Channel',
    description: `Unlock a channel`,
  }
}