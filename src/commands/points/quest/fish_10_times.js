const Bot = require('../../../Bot');
const DB = require('../../../classes/database/DB');
const Player = require('../../../classes/utilities/Player');
const { sendEmbed } = require('../../../classes/utilities/AdvancedEmbed')

module.exports.execute = async (msg, args, quest) => {
  const player = new Player(msg.member)
  const inventory = await player.inventory
  const tracker = (await DB.query(`select * from trackers where member_id = ${msg.member.id} and name = 'fish_10_times'`))[0][0]
  return [true, inventory, tracker]
}