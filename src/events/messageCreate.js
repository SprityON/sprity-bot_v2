const Bot = require('../Bot');
const DB = require('../classes/database/DB');
const Player = require('../classes/utilities/Player');
const Utils = require('../classes/utilities/Utils');
const { sendEmbed } = require('../classes/utilities/AdvancedEmbed')

let isUsing = false

module.exports.execute = async (msg) => {
  if (!msg || !msg.member || !msg.member.user || msg.member.user.bot) return
  
  await DB.member.countMessage(msg.member)

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

        const { readdirSync } = require('fs')

        let cmdFile
        try {
          cmdFile = require(`../commands/${cmd.category}/${cmd.name}`);
        } catch (error) {
          return
        }

        let files = readdirSync(`./commands/${cmd.category}`)

        if (files.find(file => !file.endsWith('.js')) && cmdFile.handler) return cmdFile.execute(msg, args)

        Utils.commandCooldown.execute(msg.member, cmdFile).then(([onCooldown, seconds]) => {
          if (onCooldown)
            return msg.reply({ embeds: [sendEmbed(`You have to wait ${seconds} seconds before using this command again!`)] })

          let enoughPermissions = true;
          cmdFile.permissions.forEach(perm => {
            if (!msg.member.permissions.has(perm)) enoughPermissions = false;
          })

          enoughPermissions
            ? (async () => {
              const player = new Player(msg.member)

              await player.hasAccount()

              isUsing = true
              cmdFile.execute(msg, args).then(async() => {
                // if all quests have been completed, reset
                let questsDB = (await DB.query(`select quests from members where member_id = ${msg.member.id}`))[0][0].quests

                if (questsDB) {
                  questsDB = JSON.parse(questsDB)
                  if (!questsDB.find(q => q.completed === false))
                    await DB.query(`update members set quests = '' where member_id = ${msg.member.id}`)
                } else return isUsing = false
                
                const questDB = questsDB.find(q => q.active === true)
                if (!questDB) return isUsing = false
                const quests = require('../commands/points/quest/quests.json')
                const quest = quests.find(q => q.id === questDB.id)

                if (quest.type && !command.includes(Utils.advancedReplace(quest.type, '1234567890', '', { charOnly: true }))) { isUsing = false; return }

                const trackers = (await DB.query(`select * from trackers where member_id = ${msg.member.id} and type = '${quest.type}'`))[0]

                if (trackers) {
                  trackers.forEach(async tracker => {
                    const current = tracker.current += 1

                    if (current >= tracker.goal) {
                      msg.reply({ embeds: [sendEmbed(`You completed quest **${cmdFile.name.charAt(0).toUpperCase() + cmdFile.name.slice(1)} ${tracker.goal} times**!\n*To claim your reward, run $quest (when activated)*`)] })
                    }

                    await DB.query(`update trackers set current = ${current} where member_id = ${msg.member.id} and type = '${quest.type}'`)
                  })
                }
                isUsing = false
              })
            })()
            : msg.reply(`**${msg.author.username}**, you do not have enough permissions to use this command!`)
        })
        return 
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