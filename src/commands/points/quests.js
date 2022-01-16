const Utils = require('../../classes/utilities/Utils')

module.exports = {
  name: Utils.getCmdName(__filename, __dirname),
  category: Utils.getCmdCategory(__filename),
  usage: 'quests <refresh/choose>',
  aliases: ['qs'],
  permissions: ['SEND_MESSAGES'],
  timeout: 1000,

  async execute(msg, args) {
    switch (args[0]) {
      case 'r': case 'refresh':
        require('./quest/refresh.js').execute(msg, args); break;
      case 'c': case 'choose':
        require('./quest/choose.js').execute(msg, args); break;
      default: 
        require('./quest/list').execute(msg, args); break;
    }
  },

  help: {
    enabled: true,
    title: 'Quests',
    description: `Show a list of quests.`,
  }
}