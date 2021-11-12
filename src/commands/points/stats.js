const { Discord } = require('../../Bot')
const DB = require('../../classes/database/DB')
const Player = require('../../classes/utilities/Player')
const Utils = require('../../classes/utilities/Utils')

module.exports = {
  name: Utils.getCmdName(__filename, __dirname),
  category: Utils.getCmdCategory(__filename),
  usage: '',
  aliases: [],
  permissions: ['SEND_MESSAGES'],
  timeout: 1000,

  async execute(msg, args) {
    const player = new Player(msg.member)
    const result = await DB.query(`select * from members where member_id = ${msg.member.id}`)
    const nextLevelExperience = ((await player.level + 1) * 125) + await player.level * 125
    let previousExperience = 0

    for (let i = 0; i <= await player.level; i++)
      previousExperience += ((i + 1) * 125) + i * 125

    previousExperience -= await player.experience
    const currExperience = nextLevelExperience - previousExperience

    if (!args[0]) {
      const embed = new Discord.MessageEmbed().setColor('#3E4BDD')
        .setTitle(`${msg.author.username}'s stats | LVL: ${await player.level} (${currExperience}/${nextLevelExperience})`)
      .setThumbnail(msg.author.avatarURL({dynamic: true}))
      .setDescription(`You have **${result[0][0].attributes}** attributes.`)
      .addField(`HP`, await player.health, true)
      .addField(`ATT`, await player.attack, true)
      .addField(`DEF`, await player.defense, true)
      .addField(`THROWABLE`, await player.throwable ? player.throwable : `NONE`, true)
      .addField(`POTION`, await player.potion ? player.potion : `NONE`, true)
      .setFooter(`to upgrade: ${await DB.guild.getPrefix()}stats upgrade <stat> <amount>`)
      
      msg.inlineReply(embed)
    } 
    
    else if (args[0].toLowerCase() === 'upgrade') {
      const units = [
        "hp",
        "att",
        "def"
      ]

      if (!args[1] || !units.includes(args[1].toLowerCase())) return msg.replyEmbed(`Please type in a valid stat!`)

      const amount = args[2] && !isNaN(args[2]) ? Number(args[2]) : 1
      const attributes = (await DB.query(`select attributes from members where member_id = ${msg.member.id}`))[0][0].attributes

      if (amount > attributes) return msg.replyEmbed(`You cannot upgrade your stat **${amount}** times with only **${attributes}** attributes!`)
      
      const res = await DB.query(`select stats from members where member_id = ${msg.member.id}`)
      const stats = JSON.parse(res[0][0].stats)

      switch (args[1].toLowerCase()) {
        case 'hp':
          stats.health += (2 * amount)
          DB.query(`update members set stats = '${JSON.stringify(stats)}', attributes = ${attributes - amount} where member_id = ${msg.member.id}`)
          msg.replyEmbed(`You used your **${amount}** attributes and you now have **${stats.health} ${args[1].toUpperCase()}**`)
        break;

        case 'att':
          stats.attack += (2 * amount)
          DB.query(`update members set stats = '${JSON.stringify(stats)}', attributes = ${attributes - amount} where member_id = ${msg.member.id}`)
          msg.replyEmbed(`You used your **${amount}** attributes and you now have **${stats.attack} ${args[1].toUpperCase()}**`)
        break;

        case 'def':
          stats.defense += (2 * amount)
          DB.query(`update members set stats = '${JSON.stringify(stats)}', attributes = ${attributes - amount} where member_id = ${msg.member.id}`)
          msg.replyEmbed(`You used your **${amount}** attributes and you now have **${stats.defense} ${args[1].toUpperCase()}**`)
        break;
      }
    }
  },

  help: {
    enabled: false,
    title: '',
    description: ``,
  }
}