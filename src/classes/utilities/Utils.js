const DB = require('../database/DB');
const Bot = require('../../Bot')

module.exports = class Utils {
  static async load() {
    const { readdirSync, lstatSync } = require('fs');

    readdirSync(`./commands`).filter(selected => !selected.endsWith(
      selected.split(".")[1]
    )).forEach(category => {

      readdirSync(`./commands/${category}`)
        .forEach(commandFile => {
          if (lstatSync(`./commands/${category}/${commandFile}`).isDirectory()) {
            readdirSync(`./commands/${category}/${commandFile}`)
              .forEach(scndCommandFile => {
                if (scndCommandFile.endsWith('.js')) {
                  let command = require(`../../commands/${category}/${commandFile}/${scndCommandFile}`)
                  Bot.Commands.set(command.name, command);
                }
              })
          } else if (commandFile.endsWith('.js')) {
            let command = require(`../../commands/${category}/${commandFile}`);
            Bot.Commands.set(command.name, command);
          }
        })
    })

    readdirSync(`./events`)
      .filter(selected => selected.endsWith('.js'))
      .forEach(e => {
        
        Bot.client["on"]
          (Utils.getFileName(e),
            (...args) => {
              require(`../../events/${e}`).execute(...args);
            })
      })

    this.refresh()
  }

  static returnEmoji(item) {
    const emoji = item.uploaded 
      ? Bot.client.emojis.cache.find(e => e.name === item.emoji) 
      : item.emoji

    return emoji
  }

  /**
   * Counts how many of a certain type of character is in a certain string
   * @param {String} str 
   */
  static countChar(str, char) {
    let counter = 0
    for (let i = 0; i < str.length; i++) {
      const c = str.charAt(i)
      c === char ? counter++ : null
    }
    return counter + 1
  }

  static colors = {
    default: '#424FD9',
    grey: 'c1c1c1',
    green: '4aff61',
    yellow_green: 'bbf525',
    yellow: 'fff647',
    orange: 'ff9543',
    red: 'ec3232'
  }

  static messages = {
    wrong_argument: "The provided arguments were incorrect.",
    unusable_interaction: "You may not use this interaction.",
    not_enough_item: "You do not have enough of that item."
  }

  static wait(time) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve()
      }, time);
    })
  }

  static normalizePrice(n) {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD', 
      minimumSignificantDigits: 1 
    }).format(n).replace('$', ' ')
  }

  /**
   * Concats every given array and returns it.
   * @param {Object} options 
   * @param  {Array} args 
   * @returns 
   */
  static concatArrays(options = {
    keysOnly: false,
    valuesOnly: false
  }, ...args) {
    options.keysOnly === true || options.valuesOnly === true ? options : arguments[0] = args.push(options)

    let arr = []
    args.forEach(items => {
      items.forEach(item => {
        item = options.keysOnly === true
        ? Object.keys(item)[0] 
        : options.valuesOnly === true
          ? Object.values(item)[0] 
          : item
        arr.push(item);
      })
    })

    let newArr = []
    const arrLength = arr.length
    for (let o = 0; o < arrLength; o++) 
      newArr = newArr.concat(arr.splice(0, 1)[0])

    return newArr
  }

  /**
   *
   * Set charOnly to true if you want the searchString to search EVERY char in the string and replace it with the replaceString
   * @param {*} string 
   * @param {*} searchString
   * @param {*} replaceString 
   * @param {*} options 
   * @returns
   */
  static advancedReplace(string, searchString, replaceString, options = {
    charOnly: false
  }) {
    if (options.charOnly === true) {
      const replaceChars = Array.from(searchString)

      let newString = ''

      for (let i = 0; i < string.length; i++) 
        if (!replaceChars.includes(string[i])) newString += string[i]

      return newString
    } else {
      let newString = ''

      for (let i = 0; i < string.length; i++) {
        const char = string[i];

        if (char === searchString) {
          newString += replaceString
          continue
        }

        newString += char
      }

      return newString
    }
  }

  static getFileName(path) {
    let fileName;
    path.endsWith('.js')
      ? fileName = path.split(require('../../config.json').splitter)[path.split(require('../../config.json').splitter).length - 1].split(".")[0]
      : fileName = path.split(require('../../config.json').splitter)[path.split(require('../../config.json').splitter).length]

    return fileName;
  }

  static firstMemberRoleColor(member) {
    return member.roles.cache.first().color
  }

  static botRoleColor() {
    const me = Bot.client.guilds.cache.first().me
    return me.roles.cache.first() ? me.roles.cache.first().color : process.env.EMBEDCOLOR
  }

  static randomColor() {
    let format = 'abcdef0123456789';
    let color = '#';

    for (let i = 0; i < 6; i++)
      color += format[Math.floor(Math.random() * format.length) + 1];

    return color;
  }

  static getCmdName(filename, dirname) {
    const cmdName = filename.replace(dirname + require('../../config.json').splitter, '').split('.')[0];

    return cmdName;
  }

  static getCmdCategory(filename) {
    const cmdCategory = filename.split(require('../../config.json').splitter)[filename.split(require('../../config.json').splitter).length - 2];

    return cmdCategory;
  }

  static async refresh() {
    const me = Bot.client.guilds.cache.get(process.env.GUILD_ID).me
    me.guild.members.cache.forEach(async member => {
      //temp
      DB.query(`insert into settings (member_id, settings) values (${member.id}, '[]')`)
      //temp
      const botRole = me.guild.roles.cache.find(role => role.name === "Bot")

      if (!member.manageable) return

      if (member.user.bot) {
        if (!member.roles.cache.find(role => role.name === "Bot")) 
          member.roles.add(botRole)
        return
      }

      await DB.query(`select member_id from members where member_id = ${member.id}`).then(async result => {
        const memberRole = me.guild.roles.cache.find(role => role.name === "Member")
        if (!member.roles.cache.find(r => r.name === "Member")) {
          member.roles.add(memberRole)
        }
        if (!result[0][0]) return await DB.member.addToDB(member)

        const role = me.guild.roles.cache.find(role => role.name === "Muted")

        await DB.query(`SELECT * FROM timer_dates WHERE member_id = ${member.id} and type = 'mute'`).then(async result2 => {
          if (result2[0][0] || member.roles.cache.find(r => r.id === role.id)) {
            if (result2[0][0]) {
              const [arr, ongoing] = this.dateDifference(result2[0][0].enddate)

              if (!ongoing) {
                console.log(`${member.user.username} was unmuted.`)
                member.roles.remove(role)

                await DB.query(`DELETE FROM timer_dates WHERE member_id = ${member.id}`)
              } else {
                const ms = this.dateDifference(result2[0][0].enddate, 'full')
                setTimeout(() => {
                  member.roles.remove(role)
                }, ms);
              }
            } else {
              console.log(`${member.user.username} was unmuted.`)
              member.roles.remove(role)

              await DB.query(`DELETE FROM timer_dates WHERE member_id = ${member.id}`)
            }
          }
        })
      })
    })
  }

  static dateDifference(endDate, option) {
    const moment = require('moment')

    endDate = endDate.split(' ')
    let enddates = endDate[0].split('/')
    let endtimes = endDate[1].split(':')

    let month = enddates[0]
    let day = enddates[1]
    let year = enddates[2]
    let hour = endtimes[0]
    let minute = endtimes[1]
    let second = endtimes[2]
    let millisecond = endtimes[3]

    let currentDate = new Date()

    let currentDateMoment = moment([currentDate.getFullYear(), currentDate.getMonth() + 1, currentDate.getDate(), ' ', currentDate.getHours(), currentDate.getMinutes(), currentDate.getSeconds(), currentDate.getMilliseconds()], 'YYYYMD H:mm:ss:SSS')
    let endDateMoment = moment([year, month, day, hour, minute, second, millisecond], 'YYYYMD H:mm:ss:SSS')

    const muteDurationYears = endDateMoment.diff(currentDateMoment, 'years')
    const muteDurationMonths = endDateMoment.diff(currentDateMoment, 'months')
    const muteDurationDays = endDateMoment.diff(currentDateMoment, 'days')
    const muteDurationHours = endDateMoment.diff(currentDateMoment, 'hours')
    const muteDurationMinutes = endDateMoment.diff(currentDateMoment, 'minutes')
    const muteDurationSeconds = endDateMoment.diff(currentDateMoment, 'seconds')
    const muteDurationMilliseconds = endDateMoment.diff(currentDateMoment)

    const years = muteDurationYears
    const months = years ? muteDurationMonths - (muteDurationYears * 12) : muteDurationMonths
    const days = months ? muteDurationDays - (muteDurationMonths * 31) : muteDurationDays
    const hours = days ? muteDurationHours - (muteDurationDays * 24) : muteDurationHours
    const minutes = hours ? muteDurationMinutes - (muteDurationHours * 60) : muteDurationMinutes
    const seconds = minutes ? muteDurationSeconds - (muteDurationMinutes * 60) : muteDurationSeconds
    const milliseconds = seconds ? muteDurationMilliseconds - (muteDurationSeconds * 1000) : muteDurationMilliseconds

    const options = [
      { 'y': years },
      { 'mm': months },
      { 'd': days },
      { 'h': hours},
      { 'm': minutes },
      { 's': seconds },
      { 'ms': milliseconds }
    ]

    if (option === 'full') return muteDurationMilliseconds

    let arr = []
    let ongoing = false

    for (const o of options) {
      if (typeof option == 'string' && o === option) {
        if (o > 0) ongoing = true
        return [o, ongoing]
      } else if (!option) {
        if (Object.values(o)[0] > 0) {
          ongoing = true
          arr.push(o)
        }
      }
    }

    let message = ''
    for (let i = 0; i < arr.length; i++) {
      const time = arr[i]

      if (i + 2 === arr.length) {
        message += `and ${Object.values(time)[0]}${Object.keys(time)[0]}`
        break
      } else {
        message += `${Object.values(time)[0]}${Object.keys(time)[0]}, `
      }
    }

    return [arr, ongoing, message]
  }

  static async embedList({
    title,
    type,
    JSONlist,
    member,
    currPage,
    showAmountOfItems,
    filter
  }, callback) {
    const Player = require('./Player');
    const Utils = this

    switch (type) {
      case 'inventory':
        const player = new Player(member)
        const inventory = await player.inventory

        let pageItemsAmount = 0;
        let totalItemsAmount = 0;

        let text = '';

        let i = 0;
        let testI = 0;

        let embed = new Bot.Discord.MessageEmbed()

        if (!currPage) currPage = 1;

        if (currPage > 1) { i = (currPage * showAmountOfItems) - showAmountOfItems }

        let Continue = true
        for (let invItem of inventory) {
          if (invItem.amount > 0) { totalItemsAmount++; } else { continue; }

          if (Continue) {
            if (testI !== i) { testI++; } else {

              pageItemsAmount++

              if (pageItemsAmount > showAmountOfItems) { Continue = false; continue; }

              const item = JSONlist.find(item => item.id === invItem.id)
              const emote = item.uploaded ? Bot.client.emojis.cache.find(e => e.name === item.emoji) : item.emoji

              text += `${emote} **${item.name} ─ ${invItem.amount}**\n*ID* \`${item.id}\`\n\n`

              i++
              testI++
            }
          }
        }

        let lastPage;
        let totalItemsAmount_temp = totalItemsAmount / showAmountOfItems;
        totalItemsAmount_temp < 1 ? lastPage = 1 : lastPage = Math.ceil(totalItemsAmount_temp);
        
        if (currPage > lastPage) {
          if (lastPage == 1) {
            return callback(`**${member.user.username}**, there is only 1 page!`);
          } else {
            return callback(`**${member.user.username}**, there are only ${lastPage} pages!`);
          }
        }

        embed.setDescription(`${title.toString()}\n\n${text}`)
          .setFooter({ text: `Page ${currPage}/${lastPage} | Use ${await DB.guild.getPrefix()}help for more info` })

        text ? callback({ embeds: [embed.setColor('#3E4BDD')]} ) : callback({ embeds: [new Bot.Discord.MessageEmbed().setColor('#3E4BDD').setDescription(`Your inventory is empty. Buy something!`)] })
        break;

      case 'shop':
        (function () {
          let pageItemsAmount = 0;
          let totalItemsAmount = 0;

          let text = '';

          let i = 0;
          let testI = 0;

          let embed = new Bot.Discord.MessageEmbed()
            .setColor('#3E4BDD')

          if (currPage === undefined) currPage = 1;

          if (currPage > 1) { i = (currPage * showAmountOfItems) - showAmountOfItems }

          if (filter && isNaN(filter)) { JSONlist = JSONlist.filter(i => i.type === filter) }

          let Continue = true

          for (let item of JSONlist) {

            totalItemsAmount++

            if (Continue == true) {
              if (testI !== i) { testI++ } else {
                pageItemsAmount++

                if (pageItemsAmount > showAmountOfItems) { Continue = false; continue; }
                
                let emote = item.uploaded ? Bot.client.emojis.cache.find(e => e.name === item.emoji) : item.emoji

                const point = Bot.client.emojis.cache.find(e => e.name === "pointdiscord")
                
                text += `${emote} **${item.name} *─ ${point} ${Utils.normalizePrice(item.price)}***\n${item.description}\n*ID* \`${item.id}\`\n\n`

                testI++
                i++

              }
            }
          }

          let lastPage;
          let totalItemsAmount_temp = totalItemsAmount / showAmountOfItems;
          totalItemsAmount_temp < 1 ? lastPage = 1 : lastPage = Math.ceil(totalItemsAmount_temp);

          if (currPage > lastPage) {
            if (lastPage == 1) {
              return callback([false, `**${member.user.username}**, there is only 1 page!`]);
            } else {
              return callback([false, `**${member.user.username}**, there are only ${lastPage} pages!`]);
            }
          } else if (currPage < 1) {
            if (lastPage == 1) {
              return callback([false, `**${member.user.username}**, there is only 1 page!`]);
            } else {
              return callback([false, `**${member.user.username}**, there are only ${lastPage} pages!`]);
            }
          }

          embed.setDescription(`${title.toString()}\n\n${text}`)
            .setFooter({ text: `Page ${currPage}/${lastPage}` })

          callback(embed)
        })()
        break;

      case 'settings':
        (async () => {
          const player = new Player(member)
          let pageItemsAmount = 0;
          let totalItemsAmount = 0;

          let text = '';

          let i = 0;
          let testI = 0;

          let embed = new Bot.Discord.MessageEmbed()

          if (!currPage) currPage = 1;

          if (currPage > 1) { i = (currPage * showAmountOfItems) - showAmountOfItems }

          for (let item of JSONlist) {
            let dbItem = await player.settings
            dbItem = dbItem.find(i => i.id === item.id)
            totalItemsAmount++

            if (testI !== i) { testI++ } else {
              pageItemsAmount++

              if (pageItemsAmount > showAmountOfItems) { break; }

              const enabled = ':white_check_mark:'
              const disabled = ':x:'

              text += `${dbItem && dbItem.enabled === true ? enabled : !dbItem && item.default === true ? enabled : disabled} **${item.id}**\n*${item.description}*\n\`Default: ${item.default ? 'ON' : 'OFF'}\`\n\n`

              testI++
              i++

            }
          }

          let lastPage;
          let totalItemsAmount_temp = totalItemsAmount / showAmountOfItems;
          totalItemsAmount_temp < 1 ? lastPage = 1 : lastPage = Math.ceil(totalItemsAmount_temp);

          if (currPage > lastPage) {
            if (lastPage == 1) {
              return callback(`**${member.user.username}**, there is only 1 page!`);
            } else {
              return callback(`**${member.user.username}**, there are only ${lastPage} pages!`);
            }
          }

          embed.setDescription(`${title.toString()} ────────────── **Page ${currPage}/${lastPage}**\n\n${text}`)
            .setFooter({ text: `$settings <setting> <enable/disable>` })

          callback(embed)
        })()

      break;

      default:
        (() => {
          let pageItemsAmount = 0;
          let totalItemsAmount = 0;

          let text = '';

          let i = 0;
          let testI = 0;

          let embed = new Bot.Discord.MessageEmbed()
            .setColor(process.env.EMBEDCOLOR)

          if (!currPage) currPage = 1;

          if (currPage > 1) { i = (currPage * showAmountOfItems) - showAmountOfItems }

          if (filter && isNaN(filter)) {
            try {
              JSONlist = Array.from(require(`./commands/game/rpg/${filter}/${filter}.json`));
            } catch (error) {
              filter = '';
            }
          }

          let Continue = true
          for (let item of JSONlist) {

            totalItemsAmount++

            if (Continue == true) {
              if (testI !== i) { testI++ } else {
                pageItemsAmount++

                if (pageItemsAmount > showAmountOfItems) { Continue = false; continue; }

                text += `**${item}**`

                testI++
                i++

              }
            }
          }

          let lastPage;
          let totalItemsAmount_temp = totalItemsAmount / showAmountOfItems;
          totalItemsAmount_temp < 1 ? lastPage = 1 : lastPage = Math.ceil(totalItemsAmount_temp);

          if (currPage > lastPage) {
            if (lastPage == 1) {
              return callback(`**${member.user.username}**, there is only 1 page!`);
            } else {
              return callback(`**${member.user.username}**, there are only ${lastPage} pages!`);
            }
          }

          embed.setDescription(`${title.toString()} ──── **Page ${currPage}/${lastPage}**\n\n${text}`)
            .setFooter({ text: `For more information, use the help command` })

          callback(embed)
        })

        break;
    }
  }

  static commandCooldown = {
    cooldownSet: new Set(),
    async execute(member, command) {
      let foundUserSet = false
      const userObj = { id: member.id, command: command, timeout: Date.now() + command.timeout }
        
      for (const user of this.cooldownSet) {

        if (user.id === member.id) {
          if (command.name === user.command.name) {
            foundUserSet = true

            if (user.timeout < Date.now()) {
              this.cooldownSet.delete(user)

              foundUserSet = false
            } else {
              let seconds = Math.floor((user.timeout - Date.now()) / 1000)
              return [true, seconds]
            }
          }
        }
      }

      if (!foundUserSet) {
        this.cooldownSet.add(userObj)
        return [false]
      }
    }
  }
}