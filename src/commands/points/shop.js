const Player = require('../../classes/utilities/Player');
const Utils = require('../../classes/utilities/Utils')

module.exports = {
  name: Utils.getCmdName(__filename, __dirname),
  category: Utils.getCmdCategory(__filename),
  usage: '',
  aliases: [],
  permissions: ['SEND_MESSAGES'],
  timeout: 1000,
  points: true,

  async execute(msg, args) {
    const shop = require('./shop.json')

    let page;
    let filter;

    isNaN(args[0])
      ? (filter = args[0], page = Math.floor(args[1]))
      : (filter = args[1], page = Math.floor(args[0]))

    const player = new Player(msg.member)
    const points = await player.points

    Utils.embedList({
      title: `**SHOP ──────────────────────── :yellow_circle: ${Utils.normalizePrice(points)}**`,
      type: 'shop',
      JSONlist: shop,
      member: msg.member,
      currPage: page,
      showAmountOfItems: 5,
      filter: filter
    }, message => msg.inlineReply(message))
  },

  help: {
    enabled: false,
    title: '',
    description: ``,
  }
}