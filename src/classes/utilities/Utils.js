const DB = require('../database/DB');

module.exports = class Utils {
  static load() {
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

  static advancedReplace(string, searchString, replaceString) {
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
    // check if there is a member who must be unmuted

    const me = require('../../Bot').client.guilds.cache.get(`380704827812085780`).me
    const role = member.guild.roles.cache.find(role => role.name === "Muted")

    me.guild.members.cache.forEach(async member => {
      const result = await DB.query(`SELECT * FROM timer_dates WHERE member_id = ${member.id} and type = 'mute'`)

      if (result[0][0] || member.roles.cache.find(r => r.id === role.id)) {
        const [arr, ongoing] = this.dateDifference(result[0][0].enddate)

        if (!ongoing) {
          console.log(`${member.user.username} was unmuted.`)
          member.roles.remove(role)

          DB.query(`DELETE FROM timer_dates WHERE member_id = ${member.id}`)
        }
      }
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