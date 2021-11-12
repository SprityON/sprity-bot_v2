const Bot = require('../Bot');
const DB = require('../classes/database/DB');
const Player = require('../classes/utilities/Player');
const Utils = require('../classes/utilities/Utils');

let isUsing = false

module.exports.execute = async (msg) => {
  if (msg.member.user.bot) return
  
  DB.member.countMessage(msg.member)

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
            return msg.replyEmbed(`You have to wait ${seconds} seconds before using this command again!`);

          let enoughPermissions = true;
          cmdFile.permissions.forEach(perm => {
            if (!msg.member.permissions.has(perm)) enoughPermissions = false;
          })

          enoughPermissions
            ? (async () => {
              const player = new Player(msg.member)

              if (!await player.hasAccount()) 
                await player.create()

              isUsing = true
              cmdFile.execute(msg, args).then(() => {
                isUsing = false
              })
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