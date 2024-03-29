const Bot = require('../../Bot')
const DB = require('../../classes/database/DB')
const Utils = require("../../classes/utilities/Utils")

module.exports = {
  name: Utils.getCmdName(__filename, __dirname),
  category: Utils.getCmdCategory(__filename),
  usage: 'help <command/category>',
  aliases: [],
  permissions: ['SEND_MESSAGES'],
  timeout: 1000,

  async execute(msg, args) {
    const { readdirSync, lstatSync } = require('fs')

    let categories = require(`../categories.json`)
    const commandCategoryFolders = readdirSync('commands').filter(file => !file.includes('.'))
    let embed = new Bot.Discord.MessageEmbed()
    .setColor(require('../../config.json').embedColor)
    if (!args[0]) {
        embed.setTitle(`Commands`)
        .setFooter({ text: `For more specific information: help (category/command)`})

      let num = 0
      commandCategoryFolders.forEach(f => {
        num++

        categories.forEach(c => {
          if (f == c.category) {
            const emote = c.emote.includes(':') ? c.emote : Bot.client.emojis.cache.find(e => e.name === c.emote)
            embed.addField(`${emote} ${c.title.charAt(0).toUpperCase() + c.title.slice(1)}`, `\`${c.usage}\``, true)
          }
        })
      });

      let extraFields = 0

      let alt_num = num
      for (i = 0; i < num; i++) {
        let check = alt_num / 3
        if (check.toString().startsWith(Math.floor(check) + '.')) {
          extraFields++
          alt_num++
        } else {
          for (let i = 0; i < extraFields; i++) 
            embed.addField(`\u200b`, `\u200b`, true)
          
          break
        }
      }

      return msg.channel.send({embeds: [embed]})
    } else if (args[0] && isNaN(args[0])) {
      let text = ''
      let isCategory = false
      for (const cat of categories) 
        if (cat.category == args[0]) 
          isCategory = true

      if (isCategory) {
        embed.setTitle(`${args[0].slice(0,1).toUpperCase() + args[0].slice(1,args[0].length)} Commands`)

        let i = 0
        const files = readdirSync(`commands/${args[0]}`).filter(f => f.endsWith('.js'))

        let files_length = 0
        files.forEach(file => {
          const command = require(`../${args[0]}/${file}`)
          if (!command.handler && command.help.enabled === true) files_length++
        })

        for (const file of files) {
          if (lstatSync(`commands/${args[0]}/${file}`).isDirectory()) {
            const commands = readdirSync(`commands/${args[0]}/${file}`).filter(file => file.endsWith('.js'))

            commands.forEach(cmd => {
              let command = require(`../${args[0]}/${file}/${cmd}`)

              if (!command.handler && command.help.enabled === true) {
                cmd = cmd.slice(0, -3)

                i + 1 === commands.length
                  ? text += `\`${cmd}\``
                  : text += `\`${cmd}\`, `
              }
            })
          } else {
            const command = require(`../${args[0]}/${file}`)

            if (!command.handler && command.help.enabled === true) {
              i + 1 === files_length
                ? text += `\`${file.slice(0, -3)}\``
                : text += `\`${file.slice(0, -3)}\`, `
            }
          }

          const command = require(`../${args[0]}/${file}`)
          if (!command.handler && command.help.enabled === true) i++
        }

        embed.setDescription(text)
        msg.channel.send({embeds: [embed]})
      } else {
        const command = Bot.Commands.find(cmd => cmd.name === args[0] || cmd.aliases && cmd.aliases.find(alias => alias === args[0]))

        if (!command || !command.help.enabled) return

        let aliases = ''
        let i = 0
        command.aliases.forEach(alias => {
          i++
          i === command.aliases.length
            ? aliases += `${alias}`
            : aliases += `${alias}, `
          
        })

        if (!aliases) aliases = 'no aliases'

        let permissions = ''
        i = 0
        command.permissions.forEach(perm => {
          i++
          i === command.permissions.length
            ? permissions += `${perm}`
            : permissions += `${perm}, `

        })

        const prefix = await DB.guild.getPrefix()

        embed.setDescription(`**${prefix}help ${command.name||'no title'}**`)
          .addField(`Description`, `${command.help.description||'no description'}`)
          .addField(`Usage`, `\`${prefix}${command.usage||'no usage'}\``)
          .addField(`Aliases`, `${aliases||'no alias'}`)
          .addField(`Cooldown`, `${command.timeout / 1000}s`)
          .addField(`Permissions`, `\`\`\`${permissions}\`\`\``)

        msg.channel.send({embeds: [embed]})
      }
    }
  },

  help: {
    enabled: true,
    title: 'Help',
    description: `See a list of all commands.`,
  }
}