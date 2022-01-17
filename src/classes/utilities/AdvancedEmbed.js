const { MessageEmbed } = require('discord.js')

module.exports = class AdvancedEmbed {
  constructor() {

  }

  static sendEmbed(content, options = {
    title: '',
    description: '',
    footer: '',
    color: '',
    inline: false,
    author: ''
  }) {
    const embed = new MessageEmbed()
      .setColor(require('../../config.json').embedColor)

    if (!content) throw new Error('Contents are required for method replyEmbed')
    if (typeof content !== 'object' && typeof content !== 'string') throw new Error(`Content must be an object`)
    if (typeof content === 'string') {
      if (options.description) throw new Error('Cannot add another description.')
      if (options.title) embed.setTitle(options.title)
      if (options.footer) embed.setFooter({ text: options.footer })
      if (options.color) embed.setColor(options.color)
      if (options.author) embed.setAuthor({ text: options.author })

      embed.setDescription(content)
    } else {
      const fields = content

      if (options.title) embed.setTitle(options.title)
      if (options.description) embed.setDescription(options.description)
      if (options.footer) embed.setFooter({text: options.footer})
      if (options.color) embed.setColor(options.color)
      if (options.author) embed.setAuthor(options.author)

      if (fields.length !== 0)
        fields.forEach(field => {
          if (field.length !== 2) throw new Error(`One or more fields do not have a name and a value`)

          const name = field[0]
          const value = field[1]

          embed.addField(name, value, options.inline)
        })
    }

    return embed
  }
}