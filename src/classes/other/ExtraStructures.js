const { APIMessage, Structures, MessageEmbed } = require('discord.js');
const DB = require('../database/DB');

class ExtAPIMessage extends APIMessage {
  resolveData() {
    if (this.data) return this;
    super.resolveData();

    const allowedMentions = this.options.allowedMentions || this.target.client.options.allowedMentions || {};
    if (allowedMentions.repliedUser !== undefined) {
      if (this.data.allowed_mentions === undefined) this.data.allowed_mentions = {};
      Object.assign(this.data.allowed_mentions, { replied_user: allowedMentions.repliedUser });
    }

    if (this.options.replyTo !== undefined) {
      Object.assign(this.data, { message_reference: { message_id: this.options.replyTo.id } });
    }

    return this;
  }
}

class Message extends Structures.get("Message") {
  replyEmbed(content, options = {
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
      if (options.footer) embed.setFooter(options.footer)
      if (options.color) embed.setColor(options.color)
      if (options.author) embed.setAuthor(options.author)
      
      embed.setDescription(content)
    } else {
      const fields = content

      if (options.title) embed.setTitle(options.title)
      if (options.description) embed.setDescription(options.description)
      if (options.footer) embed.setFooter(options.footer)
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

    return this.inlineReply(embed)
  }

  sendEmbed(content, options = {
    title: '',
    description: '',
    footer: '',
    color: '',
    inline: false,
    author: ''
  }) {
    const embed = new MessageEmbed()
      .setColor(require('../../config.json').embedColor)

    if (!content) throw new Error('Fields are required for method sendEmbed')
    if (typeof content !== 'object' && typeof content !== 'string') throw new Error(`Fields must be an object`)
    if (typeof content === 'string') {
      if (options.description) throw new Error('Cannot add another description.')
      if (options.title) embed.setTitle(options.title)
      if (options.footer) embed.setFooter(options.footer)
      if (options.color) embed.setColor(options.color)
      if (options.author) embed.setAuthor(options.author)

      embed.setDescription(content)
    } else {
      const fields = content

      if (options.title) embed.setTitle(options.title)
      if (options.description) embed.setDescription(options.description)
      if (options.footer) embed.setFooter(options.footer)
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
    
    this.channel.send(embed)
  }

  inlineReply(content, options) {
    return this.channel.send(ExtAPIMessage.create(this, content, options, { replyTo: this }).resolveData());
  }

  edit(content, options) {
    return super.edit(ExtAPIMessage.create(this, content, options).resolveData());
  }
}

Structures.extend("Message", () => (Message));