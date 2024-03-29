const Bot = require('../../Bot')
const { Discord } = require('../../Bot')
const DB = require('../../classes/database/DB')
const Player = require('../../classes/utilities/Player')
const Utils = require('../../classes/utilities/Utils')
const { sendEmbed } = require('../../classes/utilities/AdvancedEmbed')

module.exports = {
  name: Utils.getCmdName(__filename, __dirname),
  category: Utils.getCmdCategory(__filename),
  usage: '',
  aliases: [],
  permissions: ['SEND_MESSAGES'],
  timeout: 1000,

  async execute(msg, args) {
    const player = new Player(msg.member)
    await player.setHP()
    await player.setPotion()

    const stat_hp = player.health
    const stat_att = await player.att
    const stat_def = await player.def

    const result = await DB.query(`select * from members where member_id = ${msg.member.id}`)
    const nextLevelExperience = ((await player.level + 1) * 125) + await player.level * 125
    let previousExperience = 0

    for (let i = 0; i <= await player.level; i++)
      previousExperience += ((i + 1) * 125) + i * 125

    previousExperience -= await player.experience
    const currExperience = nextLevelExperience - previousExperience

    const throwable = await player.throwable
    const potion = player.potion

    const shop = require('./shop.json')
    const shopThrowable = shop.find(item => item.id === throwable.id)
    const shopPotion = potion ? shop.find(item => item.id === potion.id) : null

    const attackEmoji = Bot.client.emojis.cache.find(e => e.name === 'attack_rpg')
    const defenseEmoji = Bot.client.emojis.cache.find(e => e.name === 'defense_rpg')
    const healthEmoji = Bot.client.emojis.cache.find(e => e.name === 'heart_rpg')

    if (!args[0]) {
      const embed = new Discord.MessageEmbed().setColor('#3E4BDD')
      .setTitle(`${msg.author.username}'s stats | LVL: ${await player.level} (${currExperience}/${nextLevelExperience})`)
      .setThumbnail(msg.author.avatarURL({dynamic: true}))
      .setDescription(`You have **${result[0][0].attributes}** attributes.`)
      .addField(`${healthEmoji} ${stat_hp.current}`, `*Cap: **${stat_hp.cap}***\n\u200b`, true)
      .addField(`${attackEmoji} ${stat_att.current}`, `*Cap: **${stat_att.cap}***\n\u200b`, true)
      .addField(`${defenseEmoji} ${stat_def.current}`, `*Cap: **${stat_def.cap}***\n\u200b`, true)
      .addField(`THROWABLE`, throwable ? `${shopThrowable.uploaded ? Bot.client.emojis.cache.find(e => e.name === shopThrowable.emoji) : shopThrowable.emoji} ${shopThrowable.name} (${throwable.amount})` : `:x: NONE`, true)
        .addField(`POTION`, potion ? `${shopPotion.uploaded ? Bot.client.emojis.cache.find(e => e.name === shopPotion.emoji) : shopPotion.emoji} ${shopPotion.name} (${potion.amount})` : `:x: NONE`, true)
      .setFooter({text: `to upgrade: ${await DB.guild.getPrefix()}stats upgrade <stat> <amount>` })
      
      msg.reply({ embeds: [embed] })
    } 
    
    else if (args[0].toLowerCase() === 'upgrade') {
      if (!args[1]) return msg.reply({embeds: [sendEmbed(Utils.messages.wrong_argument)]})

      let correctArguments = [
        { 'attack': 'att' },
        { 'att': 'att' },
        { 'atk': 'att' },
        { 'health': 'hp' },
        { 'hp': 'hp' },
        { 'hitpoints': 'hp' },
        { 'defense': 'def' },
        { 'def': 'def' },
        { 'defend': 'def' }
      ]

      let isCorrectArgument = false
      for (let i = 0; i < correctArguments.length; i++) {
        const arg = correctArguments[i]

        if (args[1] == Object.keys(arg)[0]) {
          args[1] = Object.values(arg)[0]
          isCorrectArgument = true

          break
        }
      }

      if (!isCorrectArgument) return msg.reply({ embeds: [sendEmbed(Utils.messages.wrong_argument)] })

      const amount = args[2] && !isNaN(args[2]) ? Number(args[2]) : 1
      const attributes = (await DB.query(`select attributes from members where member_id = ${msg.member.id}`))[0][0].attributes
      
      if (amount > attributes) return msg.reply({ embeds: [sendEmbed(`You cannot upgrade your stat **${amount}** times with only **${attributes}** attributes!`)] })
      
      const res = await DB.query(`select stats from members where member_id = ${msg.member.id}`)
      const stats = JSON.parse(res[0][0].stats)

      switch (args[1].toLowerCase()) {
        case 'hp':
          let health = stats[0];
          if (health.current === health.cap) return msg.reply({embeds: [sendEmbed(`Your health is maxed out!`)]})
          if ((health.current + 2 * amount) > health.cap) return msg.reply({ embeds: [sendEmbed(`You can not use that many attributes on health! Upgrade your cap.`)] })

          health.current += (2 * amount)
          await DB.query(`update members set stats = '${JSON.stringify(stats)}', attributes = ${attributes - amount} where member_id = ${msg.member.id}`)

          msg.reply({ embeds: [sendEmbed(`You used your **${amount}** attributes and you now have **${health.current} ${args[1].toUpperCase()}**`)] })
        break;

        case 'att':
          let attack = stats[1];
          if (attack.current === attack.cap) return msg.reply({ embeds: [sendEmbed(`Your attack is maxed out!`)] })
          if ((attack.current + 2 * amount) > attack.cap) return msg.reply({ embeds: [sendEmbed(`You can not use that many attributes on attack! Upgrade your cap.`)] })

          attack.current += (2 * amount)
          await DB.query(`update members set stats = '${JSON.stringify(stats)}', attributes = ${attributes - amount} where member_id = ${msg.member.id}`)
          
          msg.reply({ embeds: [sendEmbed(`You used your **${amount}** attributes and you now have **${attack.current} ${args[1].toUpperCase()}**`)] })
        break;

        case 'def':
          let defense = stats[2];
          if (defense.current === defense.cap) return msg.reply({ embeds: [sendEmbed(`Your defense is maxed out!`)] })
          if ((defense.current + 1 * amount) > defense.cap) return msg.reply({ embeds: [sendEmbed(`You can not use that many attributes on defense! Upgrade your cap.`)] })

          defense += (1 * amount)
          await DB.query(`update members set stats = '${JSON.stringify(stats)}', attributes = ${attributes - amount} where member_id = ${msg.member.id}`)

          msg.reply({ embeds: [sendEmbed(`You used your **${amount}** attributes and you now have **${defense.current} ${args[1].toUpperCase()}**`)] })
        break;
      }
    }
  },

  help: {
    enabled: true,
    title: 'Stats',
    description: `View your stats!`,
  }
}