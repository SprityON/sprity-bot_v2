const Bot = require('../../Bot');
const Player = require('../../classes/utilities/Player');
const Utils = require('../../classes/utilities/Utils')

module.exports = {
  name: Utils.getCmdName(__filename, __dirname),
  category: Utils.getCmdCategory(__filename),
  usage: 'inventory',
  aliases: ['inv'],
  permissions: ['SEND_MESSAGES'],
  timeout: 5000,

  async execute(msg, args) {
    let page, filter;

    isNaN(args[0])
      ? (filter = args[0], page = Math.floor(args[1]))
      : (filter = args[1], page = Math.floor(args[0]))

    const player = new Player(msg.member)
    const points = await player.points

    const point = Bot.client.emojis.cache.find(e => e.name === 'pointdiscord')

    let allJSON = require(`./shop.json`).concat(require('./items/items.json'))

    Utils.embedList({
      title: `**𝗜𝗡𝗩𝗘𝗡𝗧𝗢𝗥𝗬 ─────────── ${point} ${Utils.normalizePrice(points)}**`,
      type: 'inventory',
      selectQuery: `SELECT * FROM members WHERE member_id = ${msg.member.id}`,
      JSONlist: allJSON,
      member: msg.member,
      currPage: page,
      showAmountOfItems: 5,
      filter: filter
    }, message => msg.reply({ embeds: [message] }))
  },

  help: {
    enabled: false,
    title: '',
    description: ``,
  }
}