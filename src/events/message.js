const Bot = require('../Bot');
const DB = require('../classes/database/DB');
const RPG = require('../classes/utilities/RPG');
const Utils = require('../classes/utilities/Utils');

module.exports.execute = async (msg) => {
  const command = msg.content.trim().split(/ +/)[0].toLowerCase();
  const args = msg.content.trim().split(/ +/).slice(1, msg.content.length);

  try {
    for (let cmd of Bot.Commands) {
      cmd = cmd[1]

      let alias

      if (cmd.aliases)
        cmd.aliases.forEach(a => {
          if (command.includes(a)) {
            const startNumber = command[command.indexOf(a)]

            const assumedPrefix = () => {
              let temp = ''
              for (i = 0; i < startNumber.length; i++) {
                temp += command.charAt(i)
              }
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
          return msg.replyEmbed([
            [`ERROR`, `That command does not exist!`]
          ], { footer: '$help for more info', color: 'ff0000' }
          )
        }

        let files = readdirSync(`./commands/${cmd.category}`)

        if (files.find(file => !file.endsWith('.js')) && cmdFile.handler) return cmdFile.execute(msg, args)

        Utils.commandCooldown.execute(msg.member, cmdFile).then(([onCooldown, seconds]) => {
          if (onCooldown)
            return msg.replyEmbed(`You have to wait ${seconds} seconds before using this command again!`);

          let enoughPermissions = true;
          cmdFile.permissions.forEach(perm => {
            if (!msg.member.permissions.has(perm)) enoughPermissions = false;
          })

          enoughPermissions
            ? (async () => {
              if (cmdFile.points) {
                const player = new RPG(msg.member)

                await player.hasAccount()
                  ? cmdFile.execute(msg, args)
                  : player.create(msg)
              } else cmdFile.execute(msg, args)
            })()
            : msg.inlineReply(`**${msg.author.username}**, you do not have enough permissions to use this command!`)
        })
        return
      }
    }
  } catch (err) {
    if (err) console.log(err)

    msg.replyEmbed(`Command \`${command}\` does not exist!`, { 
      title: 'ERROR', 
      color: 'ff0000' 
    })
  }
}