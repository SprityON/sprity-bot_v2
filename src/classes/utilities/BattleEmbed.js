// const { Discord } = require("../../Bot");
// const Battle = require("./Battle");

// module.exports = class BattleEmbed extends Battle {
//   constructor(player, enemy) {
//     super(player, enemy)

//     this.status = 'No Interaction'
//     this.history = []

//     this.embed = new Discord.MessageEmbed()
//   }

//   setTitle(title) { return this.embed.setTitle(title) }
//   setDescription(description) { return this.embed.setDescription(description) }
//   setFooter(footer) { return this.embed.setFooter(footer) }
//   setStatus(status) { this.status = status  }

//   updateEmbed(options = {
//     num: 99,
//     potion: '',
//     damage: 0
//   }) {
//     this.embed.spliceFields(0, 999)
//       .addField(`${this.player.member.displayName}`, `${this.player.health.current}/${this.player.health.max} ${heart} ${
//         options.num === 1
//           ? options.damage ? `(-${options.damage})` : ''
//           : options.num === 2
//             ? `(+${Math.floor(this.player.health.max / 100 * options.potion.heal_percentage)})`
//             : ''
//         }`, true)
//       .addField(`${this.enemy.name}`, `${this.enemy.hp.current}/${this.enemy.hp.max} ${heart} ${
//         options.num === 0
//           ? options.damage ? `(-${options.damage})` : ''
//           : options.num === 3
//             ? `(+${Math.floor(this.player.health.max / 100 * options.potion.heal_percentage)})`
//             : ''
//         }`, true)
//       .addField(`\u200b`, `*Status: ${this.status}*`)

//     this.history.push(this.status)
    
//     return this.embed
//   }

//   battleEmbed() {

//   }

//   historyEmbed() {

//   }

//   getHistoryButtons() {
//     return new Discord.MessageActionRow().addComponents(
//       new Discord.MessageButton()
//         .setCustomId('battle_present')
//         .setLabel('< Back')
//         .setStyle('SECONDARY')
//     )
//   }

//   getActionButtons() {
//     return new Discord.MessageActionRow().addComponents(
//       new Discord.MessageButton()
//         .setCustomId('battle_attack')
//         .setLabel('Attack')
//         .setStyle('SECONDARY'),

//       new Discord.MessageButton()
//         .setCustomId('battle_throw')
//         .setLabel('Throw')
//         .setStyle('SECONDARY'),

//       new Discord.MessageButton()
//         .setCustomId('battle_potion')
//         .setLabel('Potion')
//         .setStyle('SECONDARY'),

//       new Discord.MessageButton()
//         .setCustomId('battle_run')
//         .setLabel('Run')
//         .setStyle('DANGER'),

//       new Discord.MessageButton()
//         .setCustomId('battle_history')
//         .setLabel('History')
//         .setStyle('PRIMARY')
//     )
//   }
// }