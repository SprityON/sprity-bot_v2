const { sendEmbed } = require('../../../classes/utilities/AdvancedEmbed')

module.exports = {
  async execute(msg, args) {
    return new Promise((resolve, reject) => {
      const role = msg.guild.roles.cache.find(e => e.name === "Sprity Fan")
      
      msg.member.roles.cache.find(e => e.name === role.name)
        ? (msg.member.roles.remove(role), msg.reply({ embeds: [sendEmbed(`:x: Role disabled!`)] }))
        : (msg.member.roles.add(role), msg.reply({ embeds: [sendEmbed(`:white_check_mark: Role enabled!`)] }))
    })
  },
}