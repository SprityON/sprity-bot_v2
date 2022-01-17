const DB = require('../../classes/database/DB');
const { sendEmbed } = require('../../classes/utilities/AdvancedEmbed');
const Player = require('../../classes/utilities/Player');
const Utils = require('../../classes/utilities/Utils')

module.exports = {
  name: Utils.getCmdName(__filename, __dirname),
  category: Utils.getCmdCategory(__filename),
  usage: '$settings <setting> <enable/disable>',
  aliases: [],
  permissions: ['SEND_MESSAGES'],
  timeout: 1000,

  async execute(msg, args) {
    const settingsJSON = require('./settings.json')
    const setting = args[0] ? args[0].toLowerCase() : null
    const player = new Player(msg.member)
    const playerSettings = await player.settings

    const list = await player.showSettings(!isNaN(setting) ? setting : 1)
    
    if (!setting || !isNaN(setting)) return msg.reply(typeof list === 'string' ? list : { embeds: [list] })
    if (setting && !settingsJSON.find(s => s.id === setting)) return msg.reply({ embeds: [sendEmbed(`That setting does not exist.`)]})

    const memberSettings = playerSettings.length > 0 ? playerSettings : []
    const findSetting = playerSettings.find(s => s.id == setting)

    function oppositeStatus() { 
      if (findSetting && findSetting.enabled === true) { return false } 
      else { 
        if (!findSetting && settingsJSON.find(s => s.id === setting).default === true) return false
        return true 
      }
    }

    const status = args[1] ? args[1] : oppositeStatus()
    
    if (setting) findSetting ? memberSettings[findSetting.pos].enabled = status : memberSettings.push({ id: setting, pos: memberSettings.length, enabled: status })
    msg.reply({ embeds: [sendEmbed(`Setting \`${setting}\` was set to \`${status === true ? 'enabled' : 'disabled'}\``)]})
    
    playerSettings.length > 0
      ? DB.query(`update settings set settings = '${JSON.stringify(memberSettings)}' where member_id = ${msg.member.id}`)
      : DB.query(`insert into settings (member_id, settings) values (${msg.member.id}, '${JSON.stringify(memberSettings)}')`)
  },

  help: {
    enabled: true,
    title: 'Settings',
    description: `See your settings list!`,
  }
}