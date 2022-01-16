const Utils = require('../../classes/utilities/Utils')
const { sendEmbed } = require('../../classes/utilities/AdvancedEmbed')

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

    msg.reply({ embeds: [sendEmbed(`Channel unlocked.`)] })
  },

  help: {
    enabled: true,
    title: 'Unlock Channel',
    description: `Unlock a channel`,
  }
}