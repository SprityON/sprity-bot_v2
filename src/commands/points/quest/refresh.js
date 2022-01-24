const Bot = require('../../../Bot')
const DB = require('../../../classes/database/DB')
const Player = require('../../../classes/utilities/Player')
const { sendEmbed } = require('../../../classes/utilities/AdvancedEmbed')
const { normalizePrice } = require('../../../classes/utilities/Utils')

module.exports.execute = async (msg, args, quest) => {
  const player = new Player(msg.member)
  const points = await player.points
  const point = Bot.client.emojis.cache.find(e => e.name === 'pointdiscord')
  if (points < 1000) return msg.reply({ embeds: [sendEmbed(`You do not have enough ${point} points to refresh!`)] })

  msg.reply({ embeds: [sendEmbed(`Are you sure you want to refresh your quests for ${point} **1000**? (Y/N)`)] })

  const filter = m => m.author.id === msg.author.id
  msg.channel.awaitMessages({filter, max: 1, timeout: 30000 })
  .then(collected => {
    const choice = collected.first().content.toLowerCase()

    if (choice === 'y') {
      msg.reply({ embeds: [sendEmbed(`**Refresh successful!** You now have ${point} **${normalizePrice(points - 1000)}**`)] })
      DB.query(`update members set points = ${points - 1000}, quests = '' where member_id = ${msg.member.id}; delete from trackers where member_id = ${msg.member.id}`)
    } else return msg.reply({ embeds: [sendEmbed(`Cancelled!`)] })

  }).catch(collected => {
    console.log(collected);
    msg.reply({ embeds: [sendEmbed(`Cancelled! (Out Of Time)`)] })
  })
}