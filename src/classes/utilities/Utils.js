const DB = require('../database/DB');
const Player = require('./Player');

module.exports = class Utils {
  static async load() {
    const { readdirSync, lstatSync } = require('fs');

    readdirSync(`./commands`).filter(selected => !selected.endsWith(
      selected.split(".")[1]
    )).forEach(category => {

      readdirSync(`./commands/${category}`)
        .forEach(commandFile => {
          let command = require(`../../commands/${category}/${commandFile}`);

          if (lstatSync(`./commands/${category}/${commandFile}`).isDirectory()) {
            readdirSync(`./commands/${category}/${commandFile}`)
              .forEach(scndCommandFile => {
                if (scndCommandFile.endsWith('.js')) {
                  command = require(`../../commands/${category}/${commandFile}/${scndCommandFile}`)
                  require('../../Bot').Commands.set(command.name, command);
                }
              })
          } else require('../../Bot').Commands.set(command.name, command);
        })
    })

    readdirSync(`./events`)
      .filter(selected => selected.endsWith('.js'))
      .forEach(e => {

        require('../../Bot').client["on"]
          (Utils.getFileName(e),
            (...args) => {
              require(`../../events/${e}`).execute(...args);
            })
      })
      
    this.refresh()
  }

  static normalizePrice(n) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumSignificantDigits: 1 }).format(n).replace('$', ' ')
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
    if (options.charOnly) {
      const replaceChars = Array.from(searchString)

      let newString = ''

      for (let i = 0; i < string.length; i++) 
        if (replaceChars.includes(string[i])) { continue } else newString += string[i]

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
    const me = require('../../Bot').client.guilds.cache.first().me
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
    const me = require('../../Bot').client.guilds.cache.get(`380704827812085780`).me
    // check if there is a member who is not in the db
    me.guild.members.cache.forEach(async member => {
      DB.query(`select member_id from members where member_id = ${member.id}`).then(async result => {
        const memberRole = me.guild.roles.cache.find(role => role.name === "Member")
        if (!member.roles.cache.find(r => r.name === "Member")) member.roles.add(memberRole)
        if (!result[0][0]) {
          return DB.query(`insert into members (member_id, warns, inventory) values (${member.id}, '[]', '[]')`)
        }

        const role = me.guild.roles.cache.find(role => role.name === "Muted")

        DB.query(`SELECT * FROM timer_dates WHERE member_id = ${member.id} and 'type' = 'mute'`).then(result2 => {
          if (result2[0][0] || member.roles.cache.find(r => r.id === role.id)) {
            if (result2[0][0]) {
              const [arr, ongoing] = this.dateDifference(result2[0][0].enddate)

              if (!ongoing) {
                console.log(`${member.user.username} was unmuted.`)
                member.roles.remove(role)

                DB.query(`DELETE FROM timer_dates WHERE member_id = ${member.id}`)
              }
            } else {
              console.log(`${member.user.username} was unmuted.`)
              member.roles.remove(role)

              DB.query(`DELETE FROM timer_dates WHERE member_id = ${member.id}`)
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
    selectQuery,
    JSONlist,
    member,
    currPage,
    showAmountOfItems,
    filter
  }, callback) {
    const Utils = this
    const Bot = require('../../Bot');

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
          .setColor(process.env.EMBEDCOLOR)

        if (!currPage) currPage = 1;

        if (currPage > 1) { i = (currPage * showAmountOfItems) - showAmountOfItems }

        let allJSON = JSONlist;

        if (filter && isNaN(filter)) {
          try {
            allJSON = Array.from(require(`./commands/game/rpg/${filter}/${filter}.json`));
          } catch (error) {
            filter = '';
          }
        }

        let Continue = true
        for (let item of allJSON) {

          totalItemsAmount++

          if (Continue == true) {
            if (testI !== i) { testI++ } else {
              pageItemsAmount++

              if (pageItemsAmount > showAmountOfItems) { Continue = false; continue; }

              let emote
              if (item.uploaded) {
                emote = item.emoji
              } else {
                emote = Bot.client.emojis.cache.find(e => e.name === item.emoji)
              }

              const invItem = inventory.find(i => i.id === item.id)
              if (invItem && invItem.amount > 0)
                text += `${emote} **${item.name} ─ ${invItem.amount}**\n*ID* \`${item.id}\`\n\n`

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

        embed.setDescription(`${title.toString()}\n\n${text}`)
          .setFooter(`Page ${currPage}/${lastPage} | Use ${await DB.guild.getPrefix()}help for more info`)

        callback(embed)
        break;

      case 'craftables':
        (function () {
          if (filter) callback(member.lastMessage.inlineReply(`There can be no filters!`))
          let pageItemsAmount = 0;
          let totalItemsAmount = 0;

          let text = '';

          let i = 0;
          let testI = 0;

          let embed = new Bot.Discord.MessageEmbed()
            .setColor(process.env.EMBEDCOLOR)

          if (!currPage) currPage = 1;

          if (currPage > 1) { i = (currPage * showAmountOfItems) - showAmountOfItems }

          let allJSON = JSONlist;

          if (filter && isNaN(filter)) {
            try {
              allJSON = Array.from(require(`./commands/game/rpg/${filter}/${filter}.json`));
            } catch (error) {
              filter = '';
            }
          }

          for (let item of allJSON) {
            const recipeText = item.recipe
              .map(item => {
                const emote = Bot.client.findEmoji(Object.keys(item)[0])
                return `${emote} ${Object.values(item)[0]}`
              })
              .join(", ")

            totalItemsAmount++

            let emote = Bot.client.Functions.findEmoji(item.id)

            if (testI !== i) { testI++ } else {
              pageItemsAmount++

              if (pageItemsAmount > showAmountOfItems) { continue }

              text += `${emote} **${item.name}**\n*You need:* **${recipeText}**\n*ID* \`${item.id}\`\n\n`

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

          embed.setDescription(`${title.toString()} ──── **Page ${currPage}/${lastPage}**\n\n${text}`)
            .setFooter(`To craft, do: rpg craft <id>`)

          callback(embed)
        })()

        break;

      case 'shop':
        (function () {
          let pageItemsAmount = 0;
          let totalItemsAmount = 0;

          let text = '';

          let i = 0;
          let testI = 0;

          let embed = new Bot.Discord.MessageEmbed()
            .setColor(process.env.EMBEDCOLOR)

          if (!currPage) currPage = 1;

          if (currPage > 1) { i = (currPage * showAmountOfItems) - showAmountOfItems }

          let allJSON = JSONlist;

          if (filter && isNaN(filter)) {
            try {
              allJSON = Array.from(require(`./commands/game/rpg/${filter}/${filter}.json`));
            } catch (error) {
              filter = '';
            }
          }

          let Continue = true

          for (let item of allJSON) {

            totalItemsAmount++

            if (Continue == true) {
              if (testI !== i) { testI++ } else {
                pageItemsAmount++

                if (pageItemsAmount > showAmountOfItems) { Continue = false; continue; }

                let emote 
                if (item.uploaded) {
                  emote = item.emoji
                } else {
                  emote = Bot.client.emojis.cache.find(e => e.name === item.emoji)
                }
                
                text += `${emote} **${item.name} *─ :yellow_circle: ${Utils.normalizePrice(item.price)}***\n${item.description}\n*ID* \`${item.id}\`\n\n`

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

          embed.setDescription(`${title.toString()}\n\n${text}`)
            .setFooter(`Page ${currPage}/${lastPage}`)

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

          let allJSON = JSONlist;

          if (filter && isNaN(filter)) {
            try {
              allJSON = Array.from(require(`./commands/game/rpg/${filter}/${filter}.json`));
            } catch (error) {
              filter = '';
            }
          }

          let Continue = true
          for (let item of allJSON) {

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
            .setFooter(`For more information, use the help command`)

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