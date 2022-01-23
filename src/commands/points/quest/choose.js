const DB = require('../../../classes/database/DB')
const { sendEmbed } = require('../../../classes/utilities/AdvancedEmbed')

module.exports.execute = async (msg, args, play) => {
  const choice = args.shift()
  
  if (isNaN(choice)) return msg.reply({ embeds: [sendEmbed(`That is not a valid number!`)] })
  if (choice < 1 || choice > 3) return msg.reply({ embeds: [sendEmbed(`Choose a quest from 1-3!`)] })

  let playerQuests = (await DB.query(`select quests from members where member_id = ${msg.member.id}`))[0][0].quests
  if (!playerQuests) return msg.reply({ embeds: [sendEmbed(`You have completed all quests!\nLoad new quests: \`${await DB.guild.getPrefix()}quests\``)] })

  playerQuests = JSON.parse(playerQuests)

  if (playerQuests[choice - 1].tracker) return msg.reply({ embeds: [sendEmbed(`Tracker quests are not playable.`)] })

  for (let i = 0; i < playerQuests.length; i++) 
    if (playerQuests[i].active === true && playerQuests[i].tracker === false) playerQuests[i].active = false

  playerQuests[choice - 1].active = true

  await DB.query(`update members set quests = '${JSON.stringify(playerQuests)}' where member_id = ${msg.member.id}`)
  
  if (play === true) return require(`../quest`).execute(msg, args)

  const quests = require('./quests.json')

  msg.reply({ embeds: [sendEmbed(`You have chosen the quest **${quests[playerQuests[choice - 1].id].title}**`)] })
}