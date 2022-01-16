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

  async execute(msg, args) {
    let cmd = args.shift()

    switch (cmd) {
      case 'choose': require('./quest/choose.js').execute(msg, args); break;

      default: 
        if (!isNaN(cmd)) return require('./quest/choose').execute(msg, [Number(cmd)], true)

        let quests = (await DB.query(`select quests from members where member_id = ${msg.member.id}`))[0][0].quests
        if (!quests) return msg.reply({ embeds: [sendEmbed(`You have not chosen a quest! View available quests: ${await DB.guild.getPrefix()}quest list`)] })
        quests = JSON.parse(quests)
        let questDB = quests.find(q => q.active === true)
      
        if (!questDB) return msg.reply({ embeds: [sendEmbed(`You have not chosen a quest! (${await DB.guild.getPrefix()}quest choose <number>)`)] })
        if (questDB.completed === true) return msg.reply({ embeds: [sendEmbed(`You already have completed your current quest!`)] })
        const quest = require('./quest/quests.json').find(q => q.id === questDB.id)
        quest.items = questDB.items

        require(`./quest/${quest.name}`).execute(msg, args, quest)
          .then(async ([success, inventory, tracker]) => {
            if (success === 'skip') return

            const player = new Player(msg.member)
            const newPoints = success ? await player.points + questDB.points : await player.points - questDB.points
            const point = Bot.client.emojis.cache.find(e => e.name === "pointdiscord")

            if (success) {
              if (!inventory) inventory = await player.inventory

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

              for (let i = 0; i < quests.length; i++) if (questDB.id == quests[i].id) quests[i].completed = true

              player.levelUp(questDB.xp, msg)

              if (tracker) await DB.query(`delete from trackers where member_id = ${msg.member.id} and type = '${tracker.type}'`)

              msg.reply({ embeds: [sendEmbed(`You obtained ${strings.length > 0 ? strings + ', ' : ' '}**${point} ${questDB.points}** and **${questDB.xp}** XP `)] })

              await DB.query(`update members set points = ${newPoints}, experience = ${newXP}, quests = ${JSON.stringify(quests)}, inventory = '${JSON.stringify(inventory)}' where member_id = ${msg.member.id}`)
            } 
            
            else {
              msg.reply({ embeds: [sendEmbed(`You lost **${point} ${questDB.points}**`)] })
              questDB.completed = true
              return DB.query(`update members set points = ${newPoints}, quests = '${JSON.stringify(quests)}'`)
            }
        }).catch(err => console.log(err))
      break;
    }
    /** quests.json
     *   {
    "id": 3,
    "name": "sprity_bot_fight",
    "title": "Fight Sprity Bot",
    "needs": [],
    "obtainables": [
      { "common": [
          {"id": "rare_chest", "chance": 9999, "amountMultiplier": 0.25},
          {"id": "epic_chest", "chance": 7500, "amountMultiplier": 0.25},
          {"id": "legendary_chest", "chance": 2500, "amountMultiplier": 0.01}
        ]
      }
    ],
    "exp_range": [200, 500],
    "points_range": [500, 1000]
  }
     */
  },

  help: {
    enabled: true,
    title: 'Quest',
    description: `Fight, explore, earn XP and points!`,
  }
}