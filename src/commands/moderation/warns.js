const Bot = require('../../Bot');
const DB = require('../../classes/database/DB');
const { sendEmbed } = require('../../classes/utilities/AdvancedEmbed');
const Utils = require('../../classes/utilities/Utils')

module.exports = {
  name: Utils.getCmdName(__filename, __dirname),
  category: Utils.getCmdCategory(__filename),
  usage: 'warns <member>',
  aliases: [],
  permissions: ['SEND_MESSAGES'],
  timeout: 1000,

  async execute(msg, args) {
    let member = msg.mentions.members.first()
    if (!member) return msg.reply({ embeds: [sendEmbed(`You have to mention a member.`)]})
    const embed = new Bot.Discord.MessageEmbed()
      .setTitle(`${member.user.username}'s warnings`)
      .setColor(require('../../config.json').embedColor)
      .setThumbnail(member.user.displayAvatarURL({dynamic: true}))

    DB.query(`SELECT * FROM members WHERE member_id = ${member.id} and guild_id = ${msg.guild.id}`).then(data => {
      let row = data[0][0]
      if (Utils.advancedReplace(args[0], '<@!>', '', { charOnly: true }).length === 18) {
        let pos = 0

        JSON.parse(row.warns).length === 0
          ? embed.setDescription('This member has no warnings.')
          : JSON.parse(row.warns).forEach(warning => {
            pos++
            embed.addField(`#${pos}`, `${warning}`, true)
          })

        row.kicked == 0
          ? embed.addField(`Kicked?`, 'No')
          : embed.addField(`Kicked?`, 'Yes')

        return msg.reply({ embeds: [embed] })
      }
    })
  },

  help: {
    enabled: true,
    title: 'Warns',
    description: `See a list of a member's warns.`,
  }
}