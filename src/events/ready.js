const DB = require("../classes/database/DB")
const Utils = require("../classes/utilities/Utils")

module.exports.execute = async (client) => {
  console.log(`Ready as ${client.user.tag}!`)

  DB.connect().then(
    resolved => console.log(resolved),
    rejected => console.log(rejected))

  const prefix = await DB.guild.getPrefix()

  client.user.setActivity(`${prefix}help`, { type: 'WATCHING' })
  Utils.load();
}