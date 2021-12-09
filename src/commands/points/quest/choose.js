const DB = require('../../../classes/database/DB')

module.exports.execute = async (msg, args, play) => {
  const choice = args.shift()
  if (isNaN(choice)) return msg.replyEmbed(`That is not a valid number!`)
  if (choice < 1 || choice > 3) return msg.replyEmbed(`Choose a quest from 1-3!`)

  let playerQuests = (await DB.query(`select quests from members where member_id = ${msg.member.id}`))[0][0].quests
  if (!playerQuests) return msg.replyEmbed(`You have completed all quests! For new quests, use ${DB.guild.getPrefix()}quests`)
  playerQuests = JSON.parse(playerQuests)

  for (let i = 0; i < playerQuests.length; i++) 
    if (playerQuests[i].active === true) {
      playerQuests[i].active = false
    }

  playerQuests[choice - 1].active = true

  await DB.query(`update members set quests = '${JSON.stringify(playerQuests)}' where member_id = ${msg.member.id}`)

  if (play === true) return require(`../quest`).execute(msg, args)

  const quests = require('./quests.json')
  msg.replyEmbed(`You have chosen the quest **${quests[playerQuests[choice - 1].id].title}**`)
}