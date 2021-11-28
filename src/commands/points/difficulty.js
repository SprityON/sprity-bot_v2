const DB = require('../../classes/database/DB')
const Player = require('../../classes/utilities/Player')
const Utils = require('../../classes/utilities/Utils')

module.exports = {
  name: Utils.getCmdName(__filename, __dirname),
  category: Utils.getCmdCategory(__filename),
  usage: 'difficulty <easy/medium/hard/impossible>',
  aliases: ['diff'],
  permissions: ['SEND_MESSAGES'],
  timeout: 1000,

  async execute(msg, args) {
    const mention = msg.mentions.members.first()
    const player = mention ? new Player(mention) : new Player(msg.member)

    let difficulty = async() => {
      if (Number(await player.difficulty) === 0.75) return 'easy'
      if (Number(await player.difficulty) === 1) return 'medium'
      if (Number(await player.difficulty) === 1.25) return 'hard'
      if (Number(await player.difficulty) === 1.50) return '*insane*'
      if (Number(await player.difficulty) === 2) return '*impossible*'
    }

    if (!args[0] || mention) return msg.replyEmbed(`${mention ? mention.author.username + '\'s' : 'Your'} current difficulty is set to **${await difficulty()}**.`, { 
      footer: `to change difficulty: ${await DB.guild.getPrefix()}difficulty <easy/medium/hard/impossible>`
    })

    if (args[0].toLowerCase() === 'easy') {
      if (player.difficulty === 0.75) return msg.replyEmbed(`You already have your difficulty set to easy!`)

      console.log('test');
      DB.query(`update members set difficulty = 0.75 where member_id = ${msg.member.id}`)
      return msg.replyEmbed(`Your difficulty was set to **easy**.`)
    }

    else if (args[0].toLowerCase() === 'medium') {
      if (player.difficulty === 1) return msg.replyEmbed(`You already have your difficulty set to medium!`)

      DB.query(`update members set difficulty = 1 where member_id = ${msg.member.id}`)
      return msg.replyEmbed(`Your difficulty was set to **medium**.`)
    }

    else if (args[0].toLowerCase() === 'hard') {
      if (player.difficulty === 1.25) return msg.replyEmbed(`You already have your difficulty set to hard!`)

      DB.query(`update members set difficulty = 1.25 where member_id = ${msg.member.id}`)
      return msg.replyEmbed(`Your difficulty was set to **hard**.`)
    }

    else if (args[0].toLowerCase() === 'insane') {
      if (player.difficulty === 1.50) return msg.replyEmbed(`You already have your difficulty set to hard!`)

      DB.query(`update members set difficulty = 1.50 where member_id = ${msg.member.id}`)
      return msg.replyEmbed(`Your difficulty was set to **insane**.`)
    }

    else if (args[0].toLowerCase() === 'impossible') {
      if (player.difficulty === 2) return msg.replyEmbed(`You already have your difficulty set to impossible!`)

      DB.query(`update members set difficulty = 2 where member_id = ${msg.member.id}`)
      return msg.replyEmbed(`Your difficulty was set to **impossible**.`)
    }
  },

  help: {
    enabled: true,
    title: 'Set Difficulty',
    description: `Changes the difficulty of your battles. (gain = in points & EXP)\n\n**Easy:** -25% gain\n**Medium:** 0% gain/loss\n**Hard:** 25% gain\n**Insane:** 50% gain\n***Impossible:*** 100% gain`,
  }
}