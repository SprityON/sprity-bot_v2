const Bot = require('../../Bot')
const Utils = require('../../classes/utilities/Utils')

module.exports = {
  name: Utils.getCmdName(__filename, __dirname),
  category: Utils.getCmdCategory(__filename),
  usage: 'suggestion',
  aliases: [],
  permissions: ['SEND_MESSAGES'],
  timeout: 1000,

  async execute(msg, args) {
    const suggestionChannel = msg.guild.channels.cache.find(channel => channel.id === '720739903331237949')

    const filter = m => m.author.id === msg.author.id
    msg.replyEmbed("Please type in the title of your suggestion.\n*Type 'cancel' to cancel*")
    msg.channel.awaitMessages(filter, {
      max: 1,
      time: 180000
    }).then(collected => {
        if (collected.first().content == 'cancel') 
          return collected.first().replyEmbed('Cancelled!')
        
        let suggestionTitle = collected.first().content
        msg.sendEmbed(`Suggestions's title has been set to: **${suggestionTitle}**!`)
        setTimeout(async () => {
          await msg.channel.send(`Perfect! Now, please type in the content for your suggestion.`)
        }, 1000);

        msg.channel.awaitMessages(filter, {
          max: 1,
          time: 180000
        }).then(collected => {
          let suggestionContent = collected.first().content
          if (suggestionContent == 'cancel')
            return collected.first().replyEmbed('Cancelled!')

          var embed = new Bot.Discord.MessageEmbed()
            .setColor(require('../../config.json').embedColor)
            .addField(`Issued by:`, `${msg.author}`)
            .addField(`${suggestionTitle}`, `${suggestionContent}`)
            .addField(`Status`, `Under Review`)
            .setThumbnail(msg.author.avatarURL({ dynamic: true }))
            .setFooter(`By ${msg.author.tag}`)
            .setTimestamp()

          msg.channel.send(`Sending your suggestion to ${suggestionChannel.name}`).then(msg => {
            let i = 0
            var interval = setInterval(() => {
              if (i < 3) {
                editMessage()
                async function editMessage() {
                  if (msg.content == `Sending your suggestion to ${suggestionChannel.name}`) {
                    await msg.edit(`Sending your suggestion to ${suggestionChannel.name}.`)
                  } else if (msg.content == `Sending your suggestion to ${suggestionChannel.name}.`) {
                    await msg.edit(`Sending your suggestion to ${suggestionChannel.name}..`)
                  } else if (msg.content == `Sending your suggestion to ${suggestionChannel.name}..`) {
                    await msg.edit(`Sending your suggestion to ${suggestionChannel.name}...`)
                  } else {
                    await msg.edit(`Sending your suggestion to ${suggestionChannel.name}`)
                  }
                }
              } else if (i === 3) {
                msg.edit(`Your message has succesfully been sent to ${suggestionChannel.name}!`)

                suggestionChannel.send(embed).then(async message => {
                  await message.react('✅')
                  await message.react('❌')
                  await message.react('🗑')
                })
                clearInterval(interval)
                return
              }
              i++
            }, 750)
          })
        }).catch(collected => {
          msg.channel.send(`Cancelled suggestion for ${msg.member}. You ran out of time...`)
        })
      }).catch(collected => {
        msg.channel.send(`Cancelled suggestion for ${msg.member}. You ran out of time...`)
      })
  },

  help: {
    enabled: true,
    title: 'Suggestion',
    description: `Create a suggestion in Bot Chat for the Suggestions channel`,
  }
}