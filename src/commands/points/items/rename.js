const Utils = require('../../../classes/utilities/Utils')

module.exports = {
  async execute(msg, args) {
    return new Promise((resolve, reject) => {
      require('./renamer').execute(msg, args)
        .then(arr => {
          resolve(arr)
        })
    })
  },
}