const Utils = require('../../classes/utilities/Utils')

module.exports = {
  name: Utils.getCmdName(__filename, __dirname),
  category: Utils.getCmdCategory(__filename),
  usage: 'quests <number>',
  aliases: ['qs'],
  permissions: ['SEND_MESSAGES'],
  timeout: 1000,

  async execute(msg, args) {
    args.length > 0
      ? require('./quest').execute(msg, args)
      : require('./quest').execute(msg, ['list'])
  },

  help: {
    enabled: true,
    title: 'Quests',
    description: `Show a list of quests.\nTo activate a quest, type in a number as argument.`,
  }
}