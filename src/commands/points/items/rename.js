const Utils = require('../../../classes/utilities/Utils')

module.exports = {
  name: Utils.getCmdName(__filename, __dirname),
  category: Utils.getCmdCategory(__filename),
  usage: '',
  aliases: [],
  permissions: ['SEND_MESSAGES'],
  timeout: 1000,

  async execute(msg, args) {
    return new Promise((resolve, reject) => {
      require('./renamer').execute(msg, args)
        .then(arr => {
          resolve(arr)
        })
    })
  },

  help: {
    enabled: false,
    title: '',
    description: ``,
  }
}