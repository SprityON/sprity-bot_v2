const Utils = require('../../classes/utilities/Utils')
const { sendEmbed } = require('../../classes/utilities/AdvancedEmbed')

module.exports = {
  name: Utils.getCmdName(__filename, __dirname),
  category: Utils.getCmdCategory(__filename),
  usage: '',
  aliases: [],
  permissions: ['MANAGE_MESSAGES'],
  timeout: 1000,

  async execute(msg, args) {
    await msg.channel.permissionOverwrites.edit(msg.guild.id, { SEND_MESSAGES: true });
    msg.reply({ embeds: [sendEmbed(`Channel unlocked.`)] })
  },

  help: {
    enabled: true,
    title: 'Lock Channel',
    description: `Lock a channel.`,
  }
}