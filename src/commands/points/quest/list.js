const Bot = require('../../../Bot')
const DB = require('../../../classes/database/DB')
const Player = require('../../../classes/utilities/Player')
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

            const obtainables = quests.find(q => q.name === quest.name).obtainables
            const items = []

            obtainables.forEach(obt => {
              const chance = Math.floor(Math.random() * 10000)
              if (chance < obt.chance) {
                let amount = Math.floor((Math.random() * 10) * obt.amountMultiplier)
                if (amount < 1) amount = 1

                items.push({ id: obt.id, amount: amount, chance: obt.chance })
              }
            })

            quest.type === 'tracker' ? quest.active = true : quest.active = false
            quest.completed = false
            quest.items = items

            questXP = Math.floor((Math.floor(Math.random() * quest.exp_range[1]) + quest.exp_range[0]) * difficulty)
            questPoints = Math.floor((Math.floor(Math.random() * quest.points_range[1]) + quest.points_range[0]) * difficulty)

            newPlayerQuests.push({ 
              id: quest.id, 
              tracker: quest.tracker ? true : false, 
              active: quest.tracker ? true : o === 0 ? true :false, 
              completed: false, 
              xp: questXP,
              points: questPoints, 
              items: items 
            })
          }

          newQuest()
      })()
      let items = quest.items && quest.items ? (quest.items.length > 0 ? quest.items : null) : null

      const obtainables = () => {
        if (!items) return ''
        let str = []
        let endOfString

        let i = 0

        items.forEach(item => {
          if (item.chance <= 250) return endOfString = 'hidden item(s)'
          
          const findEmoji = Utils.concatArrays(require('../shop.json'),require('../items/items.json')).find(i => i.id === item.id)
          const emoji = Utils.returnEmoji(findEmoji) 
          str.push(`${i === 3 ? `\n` : ``}${emoji} **${item.amount}**`)

          i++
        })

        if (endOfString) str = `${str.join(", ")} + ${endOfString}`
        return str
      }

      if (quest.tracker) {
        const tracker = (await DB.query(`select * from trackers where member_id = ${msg.member.id} and name = '${quest.name}'`))[0][0]
        if (!tracker) DB.query(`insert into trackers (member_id, quest_id, name, current, goal) values ('${msg.member.id}', '${quest.id}', '${quest.name}', '0','${Math.floor(quest.goal * await player.difficulty)}')`)

        const current = tracker ? tracker.current : 0
        quest.title = `${quest.title.replace('$[amount]', quest.goal)}`
        quest.desc = `${quest.command.charAt(0).toUpperCase() + quest.command.slice(1)} **${Math.floor((tracker ? tracker.goal * difficulty : quest.goal * difficulty) - current)}** times to complete`
      }

      const active = quest.active && quest.active == true ? quest.tracker ? '(t)' : '(active)' : ''
      const completed = quest.completed && quest.completed === true ? '~~' : ''

      jsonQuests
        ? embed.addField(`${Utils.returnEmoji(quest)} ${completed} ${quest.title} ${completed}${active}`, `*${quest.desc}*\n\n${obtainables()}\n\n**XP:** ${jsonQuests[o].xp}\n**${point}:** ${jsonQuests[o].points}`, true)
        : embed.addField(`${Utils.returnEmoji(quest)} ${completed} ${quest.title} ${completed}${active}`, `*${quest.desc}*\n\n${obtainables()}\n\n**XP:** ${questXP}\n**${point}:** ${questPoints}`, true)
    }

    if (newPlayerQuests.length > 0 && await player.settingIsEnabled('autonext') === true) newPlayerQuests[0].active = true
    if (newPlayerQuests.length > 0) DB.query(`update members set quests = '${JSON.stringify(newPlayerQuests)}' where member_id = ${msg.member.id}`)
    
    msg.reply({ embeds: [embed] })
  }

  return
}