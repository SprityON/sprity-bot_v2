const Utils = require('./classes/utilities/Utils');

require('dotenv').config();

module.exports = new class Bot {
	constructor() {
		this.Discord = require('discord.js');
		this.Commands = new this.Discord.Collection(); 

		this.client = new this.Discord.Client({ allowedMentions: { repliedUser: false } });
		this.run(this.client);
	}

	/**
	 * @description
	 * Logs the bot in, meanwhile also loading every command and event.
	 */

	run(client) {
		require("./classes/other/replyInline")
		client.login(process.env.TOKEN);
		client.once('ready', this.ready.bind(this, client))
			.on('guildCreate', this.guildCreate.bind(this))
	}

	ready(client) {
		console.log(`Ready as ${client.user.tag}!\n`)

		client.user.setActivity(`$help`, { type: 'WATCHING' })
		
		Utils.load();
	}

	guildCreate(guild) {
		guild.channels.cache.find(channel => channel.id === guild.channels.cache.filter(chan => chan.name.includes('welcome')).first().id).send(
			Utils.createEmbed([
				['Thanks for adding me to your server!', 
				'Need help? Use `$help`']
			]))
	}
}