const Bot = require('../../Bot');
const DB = require('../../classes/database/DB');
const Utils = require('../../classes/utilities/Utils')
const Player = require('../../classes/utilities/Player')

module.exports = {
  name: Utils.getCmdName(__filename, __dirname),
  category: Utils.getCmdCategory(__filename),
  usage: 'quest <choose/list/refresh>',
  aliases: ['q'],
  permissions: ['SEND_MESSAGES'],
  timeout: 1000,

  async execute(msg, args) {
    let cmd = args.shift()

    switch (cmd) {
      case 'list': require('./quest/list').execute(msg, args); break;
      case 'choose': require('./quest/choose.js').execute(msg, args); break;
      //case 'refresh': require('./quest/refresh.js').execute(msg, args); break;

      default: 
        if (!isNaN(cmd)) return require('./quest/choose').execute(msg, [Number(cmd)], true)

        let quests = (await DB.query(`select quests from members where member_id = ${msg.member.id}`))[0][0].quests
        if (!quests) return msg.replyEmbed(`You have not chosen a quest! View available quests: ${await DB.guild.getPrefix()}quest list`)
        quests = JSON.parse(quests)
        let questDB = quests.find(q => q.active === true)
      
        if (!questDB) return msg.replyEmbed(`You have not chosen a quest! (${await DB.guild.getPrefix()}quest choose <number>)`)
        if (questDB.completed === true) return msg.replyEmbed(`You already have completed your current quest!`)
        const quest = require('./quest/quests.json').find(q => q.id === questDB.id)
        quest.items = questDB.items

        require(`./quest/${quest.name}`).execute(msg, args, quest)
          .then(async ([success, inventory, tracker]) => {
            if (success === 'skip') return

            if (success) {
              const player = new Player(msg.member)
              if (!inventory) inventory = await player.inventory

              let strings = []
              quest.items.forEach(item => {
                const emoji = Bot.client.emojis.cache.find(e => e.name === item.id)
                strings.push(`${emoji} **${item.amount}**`)

                const invItem = inventory.find(i => i.id === item.id)
                invItem
                  ? inventory[invItem.pos].amount += item.amount
                  : inventory.push({ pos: inventory.length, id: item.id, amount: item.amount })
              })

              strings = strings.join(", ")

              const newPoints = success ? await player.points + questDB.points : await player.points - questDB.points
              const newXP = await player.experience + questDB.xp
              const point = Bot.client.emojis.cache.find(e => e.name === "pointdiscord")

              for (let i = 0; i < quests.length; i++) if (questDB.id == quests[i].id) quests[i].completed = true
              if (!success) return DB.query(`update members set points = ${newPoints}, quests = '${JSON.stringify(quests)}''`)
              player.levelUp(questDB.xp, msg)
              if (tracker) DB.query(`delete from trackers where member_id = ${msg.member.id} and type = '${tracker.type}'`)
              
              console.log(strings.length);
              msg.replyEmbed(`You obtained ${strings.length > 0 ? strings + ', ' : ' '}**${point} ${questDB.points}** and **${questDB.xp}** XP `)

              DB.query(`update members set points = ${newPoints}, experience = ${newXP}, quests = '${JSON.stringify(quests)}', inventory = '${JSON.stringify(inventory)}' where member_id = ${msg.member.id}`)
            }
        }).catch(err => console.log(err))
      break;
    }
    // automatic next quest when current quest completed

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