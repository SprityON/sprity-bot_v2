const DB = require('../database/DB');

module.exports = class Utils {
  static load() {
    this.refresh()

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
              if (args[0].author.bot && args[0].author.bot === true) return
              require(`../../events/${e}`).execute(...args);
            })
      })
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

    me.guild.members.cache.forEach(async member => {
      const result = await DB.query(`SELECT * FROM timer_dates WHERE member_id = ${member.id}`)

      if (result[0][0]) {
        const [arr, ongoing] = this.dateDifference(result[0][0].enddate)

        if (!ongoing) {
          console.log(`${member.user.username} was unmuted.`)
          member.roles.remove(member.guild.roles.cache.find(role => role.name === "Muted"))

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

    let hours = endtimes[0]
    let minutes = endtimes[1]
    let seconds = endtimes[2]
    let milliseconds = endtimes[3]

    let currentDate = new Date()

    let currentDateMoment = moment([currentDate.getFullYear(), currentDate.getMonth() + 1, currentDate.getDate(), ' ', currentDate.getHours(), currentDate.getMinutes(), currentDate.getSeconds(), currentDate.getMilliseconds()], 'YYYYMD H:mm:ss:SSS')
    let endDateMoment = moment([year, month, day, hours, minutes, seconds, milliseconds], 'YYYYMD H:mm:ss:SSS')

    const muteDurationYears = endDateMoment.diff(currentDateMoment, 'years')
    const muteDurationMonths = endDateMoment.diff(currentDateMoment, 'months')
    const muteDurationDays = endDateMoment.diff(currentDateMoment, 'days')

    const muteDurationHours = endDateMoment.diff(currentDateMoment, 'hours')
    const muteDurationMinutes = endDateMoment.diff(currentDateMoment, 'minutes')
    const muteDurationSeconds = endDateMoment.diff(currentDateMoment, 'seconds')
    const muteDurationMilliseconds = endDateMoment.diff(currentDateMoment)

    const options = [
      { 'y': muteDurationYears },
      { 'mm': muteDurationMonths },
      { 'd': muteDurationDays },
      { 'h': muteDurationHours },
      { 'm': muteDurationMinutes },
      { 's': muteDurationSeconds },
      { 'ms': muteDurationMilliseconds }
    ]

    let arr = []
    let ongoing = false

    for (const o of options) {
      if (typeof option == 'string' && o === option) {
        if (o > 0) ongoing = true
        return [o, ongoing]
      } else if (!option) {
        if (Object.values(o)[0] > 0) ongoing = true
        arr.push(o)
      }
    }

    return [arr, ongoing]
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

  /**
   * Create a custom embed with specified fields and options
   * 
   * @param {Array} fields 
   * @param {Object} settings
   * @returns
   */

  static createEmbed(fields, settings = {
    title: '',
    description: '',
    color: '',
    status: '',
    thumbnail: '',
    footer: false,
    setFooter: ''
  }) {
    const Bot = require('../../Bot');

    let embed = new require('../../Bot').Discord.MessageEmbed()
      .setColor(process.env.EMBEDCOLOR);

    const colors = [
      { 'error': 'ff0000' },
      { 'success': '00ff00' }
    ];

    if (settings) {
      if (settings.setFooter) embed.setFooter(settings.setFooter)
      if (settings.title) embed.setTitle(settings.title)
      if (settings.description) embed.setDescription(settings.description)
      if (settings.color) embed.setColor(settings.color)
      if (settings.status) {
        for (const color of colors)
          if (settings.status.includes(Object.keys(color)))
            embed.setColor(Object.values(color).toString());
      }
      if (settings.thumbnail) {
        embed.setThumbnail()
      }
      if (settings.footer == true) embed.setFooter('For more information, please use the help command');
      if (!fields[0] || fields[0].length == 0) {
        if (settings.title || settings.description)
          return embed
        throw new Error("Embed needs to have at least a title, description or two fields.")
      }
    }

    for (let i = 0; i < fields.length; i++) {
      const field = fields[i]

      if (field[2]) throw new Error("Cannot add more then two fields")

      if (i === 0 && settings.status) {
        embed.addField('STATUS: ' + field[0], field[1]);
        continue;
      }

      embed.addField(field[0], field[1]);
    }

    return embed;
  }
}