const Utils = require("../../classes/utilities/Utils")

module.exports = {
  name: Utils.getCmdName(__filename, __dirname),
  category: Utils.getCmdCategory(__filename),
  usage: 'say <message>',
  aliases: [],
  permissions: ['SEND_MESSAGES'],
  timeout: 1000,

  async execute(msg, args) {
    msg.delete()
    msg.sendEmbed([
          [`${msg.author.username} said:`, `\`\`\`` + msg.content.slice(msg.content.split(" ")[0].length + 1) + `\`\`\``]
        ], { color: Utils.randomColor() }
    );
  },

  help: {
    enabled: true,
    title: 'Say',
    description: `I will say your message!`
  }
}