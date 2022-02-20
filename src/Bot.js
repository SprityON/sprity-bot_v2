require('dotenv').config();

module.exports = new class Bot {
	constructor() 
	{
		this.Discord = require('discord.js');
		this.Commands = new this.Discord.Collection();

		const allIntents = () => 
		{
			let flags = this.Discord.Intents.FLAGS
			let arr = []
			Object.keys(flags).forEach((flag) => 
			{
				arr.push(flag)
			})
			return arr
		}
		
		this.client = new this.Discord.Client({intents: allIntents()})
	}

	/**
	 * @description
	 * Logs the bot in, meanwhile also loading every command and event.
	 */
 
	run(client) 
	{
		client.login(process.env.TOKEN);
		client.on('ready', require('./events/ready').execute.bind(this, client))
	}
}