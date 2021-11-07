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
      const role = msg.guild.roles.cache.find(e => e.name === "Sprity Fan")
      msg.member.roles.cache.find(e => e.name === role.name)
        ? (msg.member.roles.remove(role), msg.replyEmbed(`:x: Role disabled!`))
        : (msg.member.roles.add(role), msg.replyEmbed(`:white_check_mark: Role enabled!`))
    })
  },

  help: {
    enabled: false,
    title: '',
    description: ``,
  }
}