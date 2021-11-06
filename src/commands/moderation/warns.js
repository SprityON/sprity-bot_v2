const Bot = require('../../Bot');
const DB = require('../../classes/database/DB');
const Utils = require('../../classes/utilities/Utils')

module.exports = {
  name: Utils.getCmdName(__filename, __dirname),
  category: Utils.getCmdCategory(__filename),
  usage: 'warns <member>',
  aliases: [],
  permissions: ['SEND_MESSAGES'],
  timeout: 1000,

  execute(msg, args) {
    let member = msg.mentions.members.first()
    if (!member) return msg.inlineReply(`You have to mention a member.`)
    const embed = new Bot.Discord.MessageEmbed()
      .setTitle(`${member.user.username}'s warnings`)
      .setColor(require('../../config.json').embedColor)
      .setFooter(`use '$warns help' for more information about this command`)
      .setThumbnail(member.user.avatarURL({dynamic: true}))

    DB.query(`SELECT * FROM members WHERE member_id = ${member.id}`, data => {
      if (!data) return msg.inlineReply(`**${member.user.username}** does not have any warnings.`)
      for (let row_one of data[0]) {
        if (Utils.advancedReplace(args[0], '<@!>', '', { charOnly: true }).length === 18) {

          let pos = 0
          JSON.parse(row_one.warns).length === 0
            ? embed.setDescription('This member has no warnings.')
            : JSON.parse(row_one.warns).forEach(warning => {
              pos++
              embed.addField(`#${pos}`, `${warning}`, true)
            })

          row_one.kicked == 0
            ? embed.addField(`Kicked?`, 'No')
            : embed.addField(`Kicked?`, 'Yes')

          return msg.channel.send(embed)
        }

        // if (args[0] == 'clear') {
        //   if (!msg.member.permissions.has("MANAGE_MESSAGES")) return msg.inlineReply(`You do not have enough permissions!`)
        //   let warn1 = msg.guild.roles.cache.find(role => role.name === 'Warning 1')
        //   let warn2 = msg.guild.roles.cache.find(role => role.name === 'Warning 2')

        //   let warnsAmount = args[1]
        //   let warnsAmountText = args[1]
        //   if (warnsAmount == 'all') {
        //     warnsAmountText = 'all'
        //     if (row_one.warns == 2) { warnsAmount = 0; try { member.roles.remove(warn1) } catch (err) { err }; try { member.roles.remove(warn2) } catch (err) { err } }
        //     else if (row_one.warns == 1) { warnsAmount = 0; try { member.roles.remove(warn1) } catch (err) { err } }
        //     else if (row_one.warns == 0) {
        //       return msg.inlineReply(`Clear unsuccessfull! You tried to clear ${warnsAmountText} warns from a member with 0 warns.`)
        //     }

        //     DB.query(`UPDATE members SET warns = ${warnsAmount} WHERE member_id = ${member.id}`)
        //     msg.channel.send(`Succesfully removed **${row_one.warns}** warn(s) from **${member.displayName}**`)
        //     return
        //   }
        //   if (isNaN(warnsAmount)) return msg.inlineReply(`\`${warnsAmount}\` is not a number!`)
        //   if (warnsAmount > 2) return msg.inlineReply(`You can only clear up to 2 warns!`)
        //   if (warnsAmount < 1) return msg.inlineReply(`What are you trying to do? You can only clear 1 - 2 warns!`)

        //   if (row_one.warns == 0) {
        //     return msg.inlineReply(`Clear unsuccessfull! You tried to clear ${warnsAmount} warns from a member with 0 warns.`)
        //   }

        //   if (warnsAmount == 2) {
        //     if (row_one.warns == 2) {
        //       warnsAmount = 0
        //       warnsAmountText = 2

        //       member.roles.remove(warn1)
        //       member.roles.remove(warn2)
        //     } else if (row_one.warns == 1) {
        //       warnsAmount = 0
        //       warnsAmountText = 1
        //       msg.inlineReply(`You tried to clear 2 warns from a member with 1 warn. 1 warn was removed instead.`)
        //       member.roles.remove(warn1)
        //     }
        //   }
        //   else if (warnsAmount == 1) {
        //     if (row_one.warns == 1) {
        //       warnsAmount = 0
        //       warnsAmountText = 1
        //       member.roles.remove(warn1)
        //     }
        //   }

        //   msg.channel.send(`Succesfully removed **${warnsAmountText}** warn(s) from **${member.displayName}**`)
        //   DB.query(`UPDATE members SET warns = ${warnsAmount} WHERE member_id = ${member.id}`)
        // }
      }
    })
  },

  help: {
    enabled: false,
    title: '',
    description: ``,
  }
}