const Utils = require('../../classes/utilities/Utils')

module.exports = {
  name: Utils.getCmdName(__filename, __dirname),
  category: Utils.getCmdCategory(__filename),
  usage: '',
  aliases: [],
  permissions: ['SEND_MESSAGES'],
  timeout: 1000,

  async execute(msg, args) {
    const roles = msg.guild.roles.cache
    roles.forEach(role => {
      msg.channel.updateOverwrite(role, {
        SEND_MESSSAGES: false
      })
    })

     msg.replyEmbed(`Channel locked.`)
  },

  help: {
    enabled: true,
    title: 'Lock Channel',
    description: `Lock a channel.`,
  }
}