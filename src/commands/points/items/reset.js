const DB = require('../../../classes/database/DB')
const Player = require('../../../classes/utilities/Player')
const Utils = require('../../../classes/utilities/Utils')

module.exports = {
  name: Utils.getCmdName(__filename, __dirname),
  category: Utils.getCmdCategory(__filename),
  usage: '',
  aliases: [],
  permissions: ['SEND_MESSAGES'],
  timeout: 1000,

  async execute(msg, args) {
    const player = new Player(msg.member)
    const attributes = await player.level * 3
    
    const stats = await player.stats
    stats.health = 50
    stats.attack = 20
    stats.defense = 0

    await DB.query(`update members set attributes = ${attributes}, stats = '${JSON.stringify(stats)}' where member_id = ${msg.member.id}`)
    return [true]
  },

  help: {
    enabled: false,
    title: '',
    description: ``,
  }
}