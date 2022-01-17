const Bot = require('../../../Bot')
const DB = require('../../../classes/database/DB')
const Player = require('../../../classes/utilities/Player')
const { concatArrays } = require('../../../classes/utilities/Utils')
const Utils = require('../../../classes/utilities/Utils')

module.exports.execute = async(msg) => {
  const point = Bot.client.emojis.cache.find(e => e.name === 'pointdiscord')
  const player = new Player(msg.member)
  const difficulty = await player.difficulty
  const embed = new Bot.Discord.MessageEmbed()
    .setTitle(`${msg.member.user.username}'s available quests`)
    .setFooter({ text: `Complete all quests to refresh or ${await DB.guild.getPrefix()}quest refresh (1000 points)` })
    .setDescription(`Use \`${await DB.guild.getPrefix()}quest <number> to play\``)
    .setColor('#3E4BDD')
  const quests = require('./quests.json')

  let jsonQuests = (await DB.query(`select quests from members where member_id = ${msg.member.id}`))[0][0].quests

  if (jsonQuests) {
    jsonQuests = JSON.parse(jsonQuests)

    let playerQuests = []
    jsonQuests.forEach(quest => {
      if (quest.active === false) quests[quest.id].active = false
      if (quest.active === true) quests[quest.id].active = true
      if (quest.completed === true) quests[quest.id].completed = true
      if (quest.completed === false) quests[quest.id].completed = false
      if (quest.items.length > 0) quests[quest.id].items = quest.items
      playerQuests.push(quests[quest.id].id)
    })
    getQuests(playerQuests)
  } else getQuests()

  async function getQuests(playerQuests) {
    let newPlayerQuests = []

    for (let o = 0; o < 3; o++) {
      let quest = quests[Math.floor(Math.random() * quests.length)]
      let questXP 
      let questPoints 
      playerQuests 
        ? quest = quests[playerQuests[o]]
        : (() => {
          function newQuest() {
            quest = quests[Math.floor(Math.random() * quests.length)]
            return findQuest()
          }

          function findQuest() {
            if (newPlayerQuests.find(q => q.id === quest.id)) return newQuest()
            const obtainables = concatArrays(quests.find(q => q.name === quest.name).obtainables)
            const items = []
            obtainables.forEach(obt => {
              const chance = Math.floor(Math.random() * 10000)
              if (chance < obt.chance) {
                let amount = Math.floor((Math.random() * 10) * obt.amountMultiplier)
                if (amount < 1) amount = 1

                items.push({ id: obt.id, amount: amount, chance: obt.chance })
              }
            })

            quest.active = false
            quest.completed = false
            quest.items = items

            questXP = Math.floor((Math.floor(Math.random() * quest.exp_range[1]) + quest.exp_range[0]) * difficulty)
            questPoints = Math.floor((Math.floor(Math.random() * quest.points_range[1]) + quest.points_range[0]) * difficulty)
            newPlayerQuests.push({ id: quest.id, active: false, completed: false, xp: questXP, points: questPoints, items: items })
          }

          newQuest()
      })()

      let active = quest.active && quest.active == true ? '(active)' : ''
      let completed = quest.completed && quest.completed === true ? '~~' : ''
      let items = quest.items && quest.items ? (quest.items.length > 0 ? quest.items : null) : null

      const obtainables = () => {
        if (!items) return ''
        let str = ''
        let endOfString

        items.forEach(item => {
          if (item.chance < 100) return endOfString = '...and a hidden item!'
          const emoji = Bot.client.emojis.cache.find(e => e.name === item.id)
          str += `${emoji} `
        })

        if (endOfString) str += `\n\n${endOfString}`
        return str
      }

      if (quest.tracker) {
        const tracker = (await DB.query(`select * from trackers where member_id = ${msg.member.id} and type = '${quest.type}'`))[0][0]

        const current = tracker ? tracker.current : 0

        quest.title = `${quest.type.charAt(0).toUpperCase() + Utils.advancedReplace(quest.type, '1234567890', '', { charOnly: true }).slice(1)} ${Math.floor((tracker ? tracker.goal : quest.goal * difficulty))} times`
        quest.desc = `${quest.type.charAt(0).toUpperCase() + Utils.advancedReplace(quest.type, '1234567890', '', { charOnly: true }).slice(1)} **${Math.floor((tracker ? tracker.goal : quest.goal * difficulty) - current)}** times to complete`
      }

      jsonQuests
        ? embed.addField(`${completed}${o + 1}. ${quest.title} ${completed}${active}`, `*${quest.desc}*\n${obtainables()}\n\n**XP:** ${jsonQuests[o].xp}\n**${point}:** ${jsonQuests[o].points}`, true)
        : embed.addField(`${completed}${o + 1}. ${quest.title} ${completed}${active}`, `*${quest.desc}*\n${obtainables()}\n\n**XP:** ${questXP}\n**${point}:** ${questPoints}`, true)
    }

    if (newPlayerQuests.length > 0) DB.query(`update members set quests = '${JSON.stringify(newPlayerQuests)}' where member_id = ${msg.member.id}`)
    
    msg.reply({ embeds: [embed] })
  }
}