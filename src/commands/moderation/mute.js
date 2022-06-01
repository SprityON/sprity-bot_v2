const Utils = require("../../classes/utilities/Utils")
const ms = require('ms')
const { sendEmbed } = require("../../classes/utilities/AdvancedEmbed")

module.exports = {
  name: Utils.getCmdName(__filename, __dirname),
  category: Utils.getCmdCategory(__filename),
  usage: 'mute <member> <duration> <reason>',
  aliases: [],
  permissions: ['MANAGE_MESSAGES'],
  timeout: 1000,

  async execute(msg, args) {
    const member = msg.mentions.members.first()

    if (!member) return msg.reply({ embeds: [sendEmbed('You have to mention a member!')]})

    let time, timeINT = '';
    let unit = ''
    args[0].startsWith('<') && args[0].endsWith('>')
      ? time = args[1]
      : time = args[0]

    if (!time) time = '10m'

    const acceptableUnits = ["ms", "s", "m", "h", "d", "w", "y"]

    for (let i = 0; i < time.length; i++) {
      const char = time[i];
      if (isNaN(char)) {
        unit += char
        timeINT = time.replace(char, '')
      }
    }
    let accepted = false
    acceptableUnits.forEach(au => {
      if (unit == au) 
        accepted = true
    });
    
    if (accepted == false) return msg.reply({ embeds: [sendEmbed(`Invalid time unit!\nAccepted units: \`ms\` \`s\` \`m\` \`h\` \`d\` \`w\` \`y\``)]})

    if (member.isCommunicationDisabled()) {
      return msg.reply({ embeds: [sendEmbed(`Communication for ${member.displayName} is already disabled, and will be enabled at:\n\`${
        ms(member.communicationDisabledUntil, { long: true })}\``)] }) 
    }

    member.timeout(ms(time), `Muted by ${msg.member.displayName}`).then(() => {
      msg.reply({ embeds: [sendEmbed(`**${member.user.username}** has been muted for ${ms(ms(time), { long: true })}!`)] })
    }).catch(() => { msg.reply(`I do not have the highest role.`) })
  },

  help: {
    enabled: true,
    title: 'Mute',
    description: `Mute a member.\nExample: \`$mute @robert 10m\` (mute for ten minutes)`,
  }
}