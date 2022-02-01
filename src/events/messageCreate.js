const Bot = require('../Bot');
const DB = require('../classes/database/DB');
const Player = require('../classes/utilities/Player');
const Utils = require('../classes/utilities/Utils');
const { sendEmbed } = require('../classes/utilities/AdvancedEmbed');
const { readdirSync, writeFileSync } = require('fs')
const messagesJSON = require('./messages.json')

let isUsing = false
let waiting = false

module.exports.execute = async (msg) => {
  if (msg.member.user.bot) return

  const player = new Player(msg.member)

  // [begin] instead of creating a query for every single message, it will save the message count for a later db update

  let counter_member
  messagesJSON.find(m => m.id === msg.member.id)
    ? messagesJSON.find(m => m.id === msg.member.id).messages += 1
    : messagesJSON.push({ id: msg.member.id, pos: messagesJSON.length - 1, messages: 1 })
  
  counter_member = messagesJSON.find(m => m.id === msg.member.id)
  writeFileSync('events/messages.json', JSON.stringify(messagesJSON))

  if (waiting === false) {
    waiting = true
    Utils.wait(120000)
      .then(async () => {
        waiting = false
        const messages = await player.messages

        DB.query(`update members set messages = ${messages + counter_member.messages} where member_id = ${counter_member.id}`)

        messagesJSON.splice(counter_member.pos, 1)
        writeFileSync('events/messages.json', JSON.stringify(messagesJSON))
      })
  } 
    
  // [end]

  if (isUsing) return
  
  const command = msg.content.trim().split(/ +/)[0].toLowerCase();
  const args = msg.content.trim().split(/ +/).slice(1, msg.content.length);

  try {
    for (let cmd of Bot.Commands) {
      cmd = cmd[1]

      let alias

      if (cmd.aliases)
        cmd.aliases.forEach(a => {
          if (command.includes(a)) {
            const startNumber = command.indexOf(a)

            const assumedPrefix = () => {
              let temp = ''
              for (i = 0; i < startNumber; i++) 
                temp += command.charAt(i)
              return temp
            }

            if (command.replace(assumedPrefix(), '').length == a.length) {
              alias = a
            }
          }
        })

      if (command.includes(cmd.name) || alias) {
        const prefix = await DB.guild.getPrefix()

        if (!msg.content.startsWith(prefix)) return

        if (Bot.Commands.find(c => c.name === command.slice(prefix.length, command.length)))
          cmd = Bot.Commands.find(c => c.name === command.slice(prefix.length, command.length))

        let cmdFile
        try {
          cmdFile = require(`../commands/${cmd.category}/${cmd.name}`);
        } catch {}

        let files = readdirSync(`./commands/${cmd.category}`)

        if (files.find(file => !file.endsWith('.js')) && cmdFile.handler) return cmdFile.execute(msg, args)

        Utils.commandCooldown.execute(msg.member, cmdFile).then(([onCooldown, seconds]) => {
          if (onCooldown) return msg.reply({ embeds: [sendEmbed(`You have to wait ${seconds} seconds before using this command again!`)] })

          let enoughPermissions = true;
          cmdFile.permissions.forEach(perm => {
            if (!msg.member.permissions.has(perm)) enoughPermissions = false;
          })

          enoughPermissions
            ? (async () => {
              player.hasAccount()

              isUsing = true
              cmdFile.execute(msg, args).then(async () => {
                isUsing = false

                let questsDB = (await DB.query(`select quests from members where member_id = ${msg.member.id}`))[0][0].quests

                if (questsDB) {
                  questsDB = JSON.parse(questsDB)
                  if (!questsDB.find(q => q.completed === false))
                    await DB.query(`update members set quests = '' where member_id = ${msg.member.id}`)
                } else return 

                const quests = require('../commands/points/quest/quests.json')
                const trackerQuest = quests.find(q => q.command === cmdFile.name)

                if (!trackerQuest) return

                const trackers = await DB.query(`select * from trackers where member_id = ${msg.member.id} and name = '${trackerQuest.name}'`)
                if (trackers[0]) {
                  trackers[0].forEach(async tracker => {
                    const current = tracker.current + 1
 
                    if (current >= tracker.goal) {
                      if (!questsDB.find(q => q.id === trackerQuest.id).completed) {
                        DB.query(`update trackers set current = ${current} where member_id = ${msg.member.id} and name = '${tracker.name}'`)
                        return msg.reply({ embeds: [sendEmbed(`You completed quest **${trackerQuest.title.replace('$[amount]', tracker.goal)}**`)] })
                        .then(() => {
                          require(`../commands/points/quest`).execute(msg, [], tracker)
                      })
                      } else return
                    } else DB.query(`update trackers set current = ${current} where member_id = ${msg.member.id} and name = '${tracker.name}'`)
                  })
                }
              }) 
            })()
            : msg.reply(`**${msg.author.username}**, you do not have enough permissions to use this command!`)
        })
      }
    }
  } catch (err) {
    if (err) console.log(err)
    msg.reply({ embeds: [sendEmbed(`Command \`${command}\` does not exist!`, { 
      title: 'ERROR', 
      color: 'ff0000' 
    })] })
  }
}