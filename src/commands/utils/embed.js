const Bot = require("../../Bot")
const { Discord, client } = require("../../Bot")
const Utils = require("../../classes/utilities/Utils")
const { sendEmbed } = require('../../classes/utilities/AdvancedEmbed')

module.exports = {
  name: Utils.getCmdName(__filename, __dirname),
  category: Utils.getCmdCategory(__filename),
  usage: 'embed <create/edit>',
  aliases: [],
  permissions: ['ADMINISTRATOR'],
  timeout: 1000,

  async execute(msg, args) {
    switch (args[0]) {
      case 'create':
        let embed = new Discord.MessageEmbed()
        msg.reply({
        embeds: [sendEmbed([],
          { title: 'Choose your embed title', description: 'Cancel this process with **cancel**.' })] })
          .then(message1 => {
          const filter = m => m.author.id === msg.author.id

          message1.channel.awaitMessages(filter, {
            time: 120000,
            max: 1
          }).then(collected0 => {
            if (collected0.first().content.toLowerCase() === 'cancel') {
              message1.reply(`Cancelled!`).then(msg => msg.delete({ timeout: 5000 }))

              return (
                msg.delete({ timeout: 1000 }),
                message1.delete({ timeout: 1000 }),
                collected0.first().delete({ timeout: 1000 })
              )
            }

            const title = collected0.first().content
            embed.setTitle(title)

            collected0.first().reply(`You have chosen the title: **${title}**`).then(msg => msg.delete({ timeout: 5000 }))

            let number = 0

            function callback(collected) {
              loop(collected)
            }

            loop(collected0)
            function loop(collected) {
              number++

              let fieldTitle
              let fieldDescription

              collected.first().reply(
                new Discord.MessageEmbed()
                  .setDescription(`What will the title of field #${number} be?`)
                  .setFooter({ text: `type 'send' to send embed` })).then(message2 => {

                    message2.channel.awaitMessages(filter, {
                      time: 120000,
                      max: 1
                    }).then(collected1 => {

                      if (collected1.first().content.toLowerCase() === 'cancel') {
                        collected1.first().reply(`Cancelled!`).then(msg => msg.delete({ timeout: 5000 }))

                        return (
                          msg.delete({ timeout: 1000 }),
                          message1.delete({ timeout: 1000 }),
                          message2.delete({ timeout: 1000 }),
                          collected0.first().delete({ timeout: 1000 }),
                          collected1.first().delete({ timeout: 1000 })
                        )
                      }
                      if (collected1.first().content.toLowerCase() === 'send') {
                        collected1.first().channel.send(embed)

                        return (
                          msg.delete({ timeout: 1000 }),
                          message1.delete({ timeout: 1000 }),
                          message2.delete({ timeout: 1000 }),
                          collected0.first().delete({ timeout: 1000 }),
                          collected1.first().delete({ timeout: 1000 })
                        )
                      }

                      fieldTitle = collected1.first().content

                      collected1.first().reply(
                        new Discord.MessageEmbed()
                          .setDescription(`What will the description of field #${number} be?`)
                          .setFooter({ text: `type 'send' to send embed` })).then(message3 => {

                            message3.channel.awaitMessages(filter, {
                              time: 120000,
                              max: 1
                            }).then(collected2 => {

                              if (collected2.first().content.toLowerCase() === 'cancel') return collected2.first().reply(`Cancelled!`).then(msg => msg.delete({ timeout: 5000 }))
                              if (collected2.first().content.toLowerCase() === 'send') {
                                collected2.first().channel.send(embed)

                                return (
                                  msg.delete({ timeout: 1000 }),
                                  message1.delete({ timeout: 1000 }),
                                  message2.delete({ timeout: 1000 }),
                                  message3.delete({ timeout: 1000 }),
                                  collected0.first().delete({ timeout: 1000 }),
                                  collected1.first().delete({ timeout: 1000 }),
                                  collected2.first().delete({ timeout: 1000 })
                                )
                              }

                              fieldDescription = collected2.first().content
                              embed.addField(fieldTitle, fieldDescription, true)

                              msg.delete({ timeout: 1000 })
                              message1.delete({ timeout: 1000 })
                              message2.delete({ timeout: 1000 })
                              message3.delete({ timeout: 1000 })
                              collected0.first().delete({ timeout: 1000 })
                              collected1.first().delete({ timeout: 1000 })
                              collected2.first().delete({ timeout: 1000 })

                              return callback(collected2)

                            }).catch(collected => {
                              msg.reply(`Cancelled! You took too long.`)
                            })
                          }).catch(collected => {
                            msg.reply(`Cancelled! You took too long.`)
                          })
                    }).catch(collected => {
                      msg.reply(`Cancelled! You took too long.`)
                    })
                  }).catch(collected => {
                    msg.reply(`Cancelled! You took too long.`)
                  })
            }
          }).catch(collected => {
            console.log(collected);
          })
        })
        break;
      case 'edit':
        if (!args[1] || isNaN(args[1]) || args[1].length !== 18)
          return msg.reply(`You have to provide a valid message id!`).then(msg1 => (msg.delete({ timeout: 5000 }), msg1.delete({ timeout: 5000 })))

        const messageID = args[1]

        let selectedMsg = await msg.channel.messages.fetch(messageID)
        const filter = m => m.author.id === msg.author.id

        msg.reply(`What would you like to edit?\nChoose from: \`title\`, \`description\`, \`footer\`, \`fields\`, \`color\` or \`cancel\``).then(message0 => {
          msg.channel.awaitMessages(filter, {
            time: 120000,
            max: 1
          }).then(collected0 => {
            message0.delete()
            let receivedMessage = collected0.first()
            switch (receivedMessage.content.toLowerCase()) {

              case 'title':
                receivedMessage.reply(`What will your new title be?`).then(message1 => {
                  receivedMessage.channel.awaitMessages(filter, {
                    time: 120000,
                    max: 1
                  }).then(collected1 => {
                    msg.delete()
                    message1.delete()
                    collected0.first().delete()
                    collected1.first().delete()

                    selectedMsg.edit(selectedMsg.embeds[0].setTitle(collected1.first().content))
                    selectedMsg.reply(`Embed title changed to \`${collected1.first().content}\``).then(msg => msg.delete({ timeout: 5000 }))
                  })
                })

                break;

              case 'description':
                receivedMessage.reply(`What will your new description be?`).then(message1 => {
                  receivedMessage.channel.awaitMessages(filter, {
                    time: 120000,
                    max: 1
                  }).then(collected1 => {
                    msg.delete()
                    message1.delete()
                    collected0.first().delete()
                    collected1.first().delete()

                    selectedMsg.edit(selectedMsg.embeds[0].setDescription(collected1.first().content))
                    selectedMsg.reply(`Embed description changed to \`${collected1.first().content}\``).then(msg => msg.delete({ timeout: 5000 }))
                  })
                })

                break;

              case 'footer':
                receivedMessage.reply(`What will your new footer be?`).then(message1 => {
                  receivedMessage.channel.awaitMessages(filter, {
                    time: 120000,
                    max: 1
                  }).then(collected1 => {
                    msg.delete()
                    message1.delete()
                    collected0.first().delete()
                    collected1.first().delete()

                    selectedMsg.edit(selectedMsg.embeds[0].setFooter({ text: collected1.first().content }))
                    selectedMsg.reply(`Embed footer changed to \`${collected1.first().content}\``).then(msg => msg.delete({ timeout: 5000 }))
                  })
                })
                break;

              case 'color':
                receivedMessage.reply(`What will your new color be?`).then(message1 => {
                  receivedMessage.channel.awaitMessages(filter, {
                    time: 120000,
                    max: 1
                  }).then(collected1 => {
                    msg.delete()
                    message1.delete()
                    collected0.first().delete()

                    if (collected1.first().content.length !== 3 && collected1.first().content.length !== 6)
                      return collected.first().reply(`That is not a valid hexcode!`)

                    let format = 'abcdef0123456789';
                    for (let i = 0; i < collected1.first().content.length; i++) {
                      const char = collected1.first().content[i];

                      if (!format.includes(char))
                        return collected.first().reply(`That is not a valid hexcode!`)
                    }

                    collected1.first().delete()
                    selectedMsg.edit(selectedMsg.embeds[0].setColor(collected1.first().content))
                    selectedMsg.reply(`Embed color changed to \`${collected1.first().content}\``).then(msg => msg.delete({ timeout: 5000 }))
                  })
                })
                break;

              case 'fields':
                receivedMessage.reply(`\`Add\` or \`edit\` a field?`).then(message1 => {
                  receivedMessage.channel.awaitMessages(filter, {
                    time: 120000,
                    max: 1
                  }).then(collected1 => {
                    message1.delete()

                    switch (collected1.first().content.toLowerCase()) {
                      case 'edit':
                        receivedMessage.reply(`Which field do you want to edit? **${selectedMsg.embeds[0].fields.length || 0}** ${selectedMsg.embeds[0].fields.length == 1 ? 'field' : 'fields'}`).then(message2 => {
                          receivedMessage.channel.awaitMessages(filter, {
                            time: 120000,
                            max: 1
                          }).then(collected2 => {
                            collected0.first().delete()

                            let fieldIndex = collected2.first().content
                            if (isNaN(fieldIndex) || fieldIndex > selectedMsg.embeds[0].fields.length)
                              return msg.channel.send(`That is not a valid number!`)

                            let title, description

                            collected2.first().reply(`Choose your field title`).then(message3 => {
                              msg.channel.awaitMessages(filter, {
                                time: 120000,
                                max: 1
                              }).then(collected3 => {
                                title = collected3.first().content

                                collected2.first().reply(`Choose your field description`).then(message4 => {
                                  msg.channel.awaitMessages(filter, {
                                    time: 120000,
                                    max: 1
                                  }).then(collected4 => {
                                    description = collected4.first().content

                                    let oldEmbed = new Discord.MessageEmbed(selectedMsg.embeds[0]).spliceFields(0, fieldIndex)
                                    selectedMsg.embeds[0].spliceFields(fieldIndex - 1, 99)
                                    selectedMsg.embeds[0].addField(title, description, true)

                                    oldEmbed.fields.forEach((field) => {
                                      selectedMsg.embeds[0].addField(field.name, field.value, true)
                                    })

                                    selectedMsg.edit(selectedMsg.embeds[0])

                                    msg.delete()
                                    message2.delete()
                                    message3.delete()
                                    message4.delete()
                                    collected1.first().delete()
                                    collected2.first().delete()
                                    collected3.first().delete()
                                    collected4.first().delete()
                                  })
                                })
                              })
                            })
                          })
                        })

                        break;

                      case 'add':
                        let title, description

                        receivedMessage.reply(`Choose your field title.`).then(message2 => {
                          message2.channel.awaitMessages(filter, {
                            time: 120000,
                            max: 1
                          }).then(collected2 => {
                            title = collected2.first().content
                            collected0.first().delete()

                            collected2.first().reply(`Choose your field description.`).then(message3 => {
                              msg.channel.awaitMessages(filter, {
                                time: 120000,
                                max: 1
                              }).then(collected3 => {
                                description = collected3.first().content

                                msg.delete()
                                message2.delete()
                                message3.delete()
                                collected2.first().delete()
                                collected3.first().delete()

                                selectedMsg.edit(selectedMsg.embeds[0].addField(title, description, true))
                                selectedMsg.reply(`Your field was updated`).then(msg => msg.delete({ timeout: 5000 }))
                              })
                            })
                          })
                        })

                        break;
                    }

                    collected1.first().delete()
                  })
                })
                break;

              default:
                collected0.first().reply(`Cancelled!`)
                break;
            }
          })
        })
        break;
    }
  },

  help: {
    enabled: true,
    title: 'Create/Edit Embed',
    description: `Create or edit a embed.`,
  }
}