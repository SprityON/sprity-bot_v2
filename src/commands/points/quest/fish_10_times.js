const Bot = require('../../../Bot');
const DB = require('../../../classes/database/DB');
const Player = require('../../../classes/utilities/Player');

module.exports.execute = async (msg, args, quest) => {
  const player = new Player(msg.member)
  const inventory = await player.inventory

  const tracker = (await DB.query(`select * from trackers where member_id = ${msg.member.id} and type = 'fish10'`))[0][0]
  if (!tracker) {
    await DB.query(`insert into trackers (member_id, type, current, goal) VALUES (${msg.member.id}, 'fish10', 0, ${Math.floor(10 * await player.difficulty)})`)
    msg.replyEmbed(`You need to fish ** ${Math.floor(10 * await player.difficulty)}** times to claim your reward.`, { footer: 'This process is done automatically' })
    return ['skip']
  }

  if (tracker.current < tracker.goal) {
    msg.replyEmbed(`You need to fish **${tracker.goal - tracker.current}** times to claim your reward.`, {footer: 'This process is done automatically'})
    return ['skip']
  } else return [true, inventory, tracker]
}