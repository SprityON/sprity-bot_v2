const Bot = require('../../../Bot');
const Player = require('../../../classes/utilities/Player');

module.exports.execute = async (msg, args, quest) => {
  const player = new Player(msg.member)
  const inventory = await player.inventory
  return [true, inventory]
}