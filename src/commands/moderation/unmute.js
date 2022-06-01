const DB = require('../../classes/database/DB')
const { sendEmbed } = require('../../classes/utilities/AdvancedEmbed')
const Utils = require('../../classes/utilities/Utils')

module.exports = {
  name: Utils.getCmdName(__filename, __dirname),
  category: Utils.getCmdCategory(__filename),
  usage: 'unmute <member>',
  aliases: [],
  permissions: ['MANAGE_MESSAGES'],
  timeout: 1000,

  async execute(msg, args) {
    const member = msg.mentions.members.first()
    if (!member) return msg.reply({ embeds: [sendEmbed(`You did not mention a member.`)]})

    if (!member.isCommunicationDisabled()) return msg.reply({embeds: [sendEmbed(`Communication for ${member.displayName} is already enabled.`)]}) 
    member.timeout(null, `Communication enabled by ${msg.member.displayName}`)
    return msg.reply({ embeds: [sendEmbed(`Communication for **${member.displayName}** is now disabled.`)] }) 
  },

  help: {
    enabled: true,
    title: 'Unmute Member',
    description: `Unmute a member.`,
  }
}