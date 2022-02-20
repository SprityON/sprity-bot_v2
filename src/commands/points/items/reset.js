const DB = require('../../../classes/database/DB')
const Player = require('../../../classes/utilities/Player')

module.exports = {
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
}