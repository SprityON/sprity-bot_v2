const Bot = require('../../Bot');
const DB = require('../../classes/database/DB');
const Utils = require('../../classes/utilities/Utils')
const Player = require('../../classes/utilities/Player')
const { sendEmbed } = require('../../classes/utilities/AdvancedEmbed')

module.exports = {
  name: Utils.getCmdName(__filename, __dirname),
  category: Utils.getCmdCategory(__filename),
  usage: 'quest <number>',
  aliases: ['q'],
  permissions: ['SEND_MESSAGES'],
  timeout: 1000,

  async execute(msg, args, tracker) {
    let cmd = args.shift()

    switch (cmd) {
      case 'choose': require('./quest/choose.js').execute(msg, args); break;

      default:
        if (!isNaN(cmd)) { return require('./quest/choose').execute(msg, [Number(cmd)], true) } else if (cmd) { return; }

        let quests = (await DB.query(`select quests from members where member_id = ${msg.member.id}`))[0][0].quests
        if (!quests) return msg.reply({ embeds: [sendEmbed(`You have not chosen a quest! View available quests: ${await DB.guild.getPrefix()}quest list`)] })
        quests = JSON.parse(quests)
        let questDB = quests.find(q => q.active === true && !q.tracker)
      
        let quest
        let questsJSON = require('./quest/quests.json')
        if (!questDB && !tracker) return msg.reply({ embeds: [sendEmbed(`You have not chosen a quest! (${await DB.guild.getPrefix()}quest choose <number>)`)] })
        tracker
          ? (
            quest = questsJSON.find(q => q.id === tracker.quest_id),
            quest.items = quests.find(q => q.id === tracker.quest_id).items,
            questDB = quests.find(q => q.id === quest.id))
          : (
            quest = questsJSON.find(q => q.id === questDB.id), 
            quest.items = questDB.items)

        if (questDB.completed === true && !tracker) return msg.reply({ embeds: [sendEmbed(`You already have completed your current quest!`)] })
        if (quest.tracker === true && !tracker) return msg.reply({ embeds: [sendEmbed(`Tracker quests not playable.`)] })

        require(`./quest/${quest.name}`).execute(msg, args, quest)
          .then(async ([success, inventory, tracker]) => {
            if (success === 'skip') return

            const player = new Player(msg.member, msg)
            if (!inventory) inventory = await player.inventory
            const settings = await player.settings
            const autonext = settings.find(s => s.id === 'autonext')
            const newPoints = success ? await player.points + questDB.points : await player.points - questDB.points
            const point = Bot.client.emojis.cache.find(e => e.name === "pointdiscord")

            if (success) {
              let strings = []
              quest.items.forEach(item => {
                if (!item) return
                const emoji = Bot.client.emojis.cache.find(e => e.name === item.id)
                strings.push(`${emoji} **${item.amount}**`)

                const invItem = inventory.find(i => i.id === item.id)
                invItem
                  ? inventory[invItem.pos].amount += item.amount
                  : inventory.push({ pos: inventory.length, id: item.id, amount: item.amount })
              })

              strings = strings.join(", ")

              const newXP = await player.experience + questDB.xp

              for (let i = 0; i < quests.length; i++) if ([tracker ? tracker.quest_id : questDB.id] == quests[i].id) quests[i].completed = true

              player.levelUp(questDB.xp)

              msg.reply({ embeds: [sendEmbed(`You obtained ${strings.length > 0 ? strings + ', ' : ' '}**${point} ${questDB.points}** and **${questDB.xp}** XP `)] })

              if (!quests.find(q => q.completed === false)) {
                if (quests.find(q => q.tracker === true)) 
                  DB.query(`delete from trackers where member_id = ${msg.member.id}`)

                quests = ''
              }

              quests
                ? DB.query(`update members set points = ${newPoints}, experience = ${newXP}, quests = '${JSON.stringify(quests)}', inventory = '${JSON.stringify(inventory)}' where member_id = ${msg.member.id}`)
                : DB.query(`update members set points = ${newPoints}, experience = ${newXP}, quests = '', inventory = '${JSON.stringify(inventory)}' where member_id = ${msg.member.id}`)
            } 
            
            else {
              msg.reply({ embeds: [sendEmbed(`You lost **${point} ${questDB.points}**`)] })
              questDB.completed = true

              if (!quests.find(q => q.completed === false)) {
                if (quests.find(q => q.tracker === true)) 
                  DB.query(`delete from trackers where member_id = ${msg.member.id}`)
                  
                quests = ''
              }

              DB.query(`update members set points = ${newPoints}, quests = ${quests ? `'${JSON.stringify(quests)}'` : ''} where member_id = ${msg.member.id}`)
            }

            /**
             * Auto Next
             */

            if (autonext && autonext.enabled === true) {
              let currPos = 0
              let nextPos = 0

              for (q of quests) {
                if (q.id === quest.id && !tracker) {
                  quests[currPos].active = false
                  currPos === 2 ? nextPos = 0 : nextPos++

                  while (true) {
                    if (!quests[nextPos].tracker && !quests[nextPos].completed) {
                      quests[nextPos].active = true
                      break
                    } else {
                      currPos === 2 ? nextPos = 0 : nextPos++

                      if (!quests[nextPos].active && !quests[nextPos].tracker && !quests[nextPos].completed) {
                        quests[nextPos].active = true
                        break
                      }

                      currPos === 2 ? currPos = 0 : currPos++
                    }
                  } break
                }

                currPos === 2 ? currPos = 0 : currPos++
              }
            } else return

            DB.query(`update members set quests = '${JSON.stringify(quests)}' where member_id = ${msg.member.id}`)
        }).catch(err => console.log(err))
      break;
    }
  },

  help: {
    enabled: true,
    title: 'Quest',
    description: `Fight, explore, earn XP and points!`,
  }
}