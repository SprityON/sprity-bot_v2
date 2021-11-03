const DB = require('../../classes/database/DB')
const RPG = require('../../classes/utilities/RPG')
const Utils = require('../../classes/utilities/Utils')
const fs = require('fs')

module.exports = {
  name: Utils.getCmdName(__filename, __dirname),
  category: Utils.getCmdCategory(__filename),
  usage: '',
  aliases: ['r'],
  permissions: ['SEND_MESSAGES'],
  timeout: 1000,

  async execute(msg, args) {
    return msg.sendEmbed(`Unavailable.`)
    const player = new RPG(msg.member)
    
    if (await player.hasAccount(msg)) {
      const command = args.splice(0,1)[0]

      fs.readdirSync(`${Utils.advancedReplace(__dirname, '\\', '/')}/rpg`)
      .forEach(file => {
        if (file.endsWith('.js')) {
          const searchCommand = require(`./rpg/${file}`)
          if (searchCommand.name === command) searchCommand.execute(msg, args)
        }
      })
    }
  },

  help: {
    enabled: false,
    title: '',
    description: ``,
  }
}