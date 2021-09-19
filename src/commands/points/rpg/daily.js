const Utils = require('../../../classes/utilities/Utils')

module.exports = {
  name: Utils.getCmdName(__filename, __dirname),
  category: Utils.getCmdCategory(__filename),
  usage: 'daily',
  aliases: [],
  permissions: ['SEND_MESSAGES'],
  timeout: 1000,

  execute(msg, args) {
    console.log(args);
  },

  help: {
    enabled: false,
    title: '',
    description: ``,
  }
}