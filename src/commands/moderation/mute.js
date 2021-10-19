const Utils = require("../../classes/utilities/Utils")
const moment = require('moment')
const ms = require('ms')
const DB = require("../../classes/database/DB")

module.exports = {
  name: Utils.getCmdName(__filename, __dirname),
  category: Utils.getCmdCategory(__filename),
  usage: '<member> <duration> <reason>',
  aliases: [],
  permissions: ['MANAGE_MESSAGES'],
  timeout: 1000,

  execute(msg, args) {
    const role = msg.guild.roles.cache.find(role => role.name === "Muted")
    const member = msg.mentions.members.first()

    if (!member) return msg.inlineReply('You have to mention a member!')
    if (member.roles.cache.find(r => r.name === role.name)) return msg.inlineReply(`**${member.user.username}** has already been muted!`)

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
    
    if (accepted == false) return msg.inlineReply(`Invalid time unit!\nAccepted units: \`ms\` \`s\` \`m\` \`h\` \`d\` \`w\` \`y\``)

    const beginDate = moment().format(require('../../config.json').dateFormat)
    const endDate = moment().add(`${timeINT}`, `${unit}`).format('M/D/YYYY H:mm:ss:SSS')

    DB.query(`INSERT INTO timer_dates(member_id, begindate, enddate, type) VALUES ('${member.id}', '${beginDate}', '${endDate}', 'mute')`)
    member.roles.add(role)

    msg.inlineReply(`**${member.user.username}** has been muted for ${ms(ms(time), { long: true })}!`)

    setTimeout(() => {
      member.roles.remove(role)
      msg.inlineReply(`**${member.displayName}** has been unmuted!`)

      DB.query(`DELETE FROM timer_dates WHERE member_id = ${member.id} AND 'type' = 'mute'`)
    }, ms(time));
  },

  help: {
    enabled: true,
    title: 'Mute',
    description: `Mute a member.\nExample: \`$mute @robert 10m\` (mute for ten minutes)`,
  }
}