const Utils = require('./classes/utilities/Utils');
const DB = require('./classes/database/DB')

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
		require("./classes/other/ExtraStructures")
		client.login(process.env.TOKEN);
		client.once('ready', this.ready.bind(this, client))
	}

	async ready(client) {
		console.log(`Ready as ${client.user.tag}!`)

		DB.connect().then(
			resolved => console.log(resolved),
			rejected => console.log(rejected))

		const prefix = await DB.guild.getPrefix()

		client.user.setActivity(`${prefix}help`, { type: 'WATCHING' })
		Utils.load();
	}
}