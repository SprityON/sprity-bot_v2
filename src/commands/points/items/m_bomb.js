const Utils = require('../../../classes/utilities/Utils')

module.exports = {
  name: Utils.getCmdName(__filename, __dirname),
  category: Utils.getCmdCategory(__filename),
  usage: '',
  aliases: [],
  permissions: ['SEND_MESSAGES'],
  timeout: 1000,

  async execute(msg, args) {
    return new Promise(async (resolve, reject) => {
      require('./equip').execute(msg, this.name, 'throwable')
    })
  },

  help: {
    enabled: false,
    title: '',
    description: ``,
  }
}