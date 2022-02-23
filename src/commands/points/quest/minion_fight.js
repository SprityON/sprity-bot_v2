const Bot = require('../../../Bot')
const { Discord } = require('../../../Bot')
const { sendEmbed } = require('../../../classes/utilities/AdvancedEmbed')
const Battle = require('../../../classes/utilities/Battle')
const Enemy = require('../../../classes/utilities/Enemy')
const Player = require('../../../classes/utilities/Player')
const Utils = require('../../../classes/utilities/Utils')

module.exports.execute = async (msg, args, quest) => {
  const player = new Player(msg.member, msg)
  const inventory = await player.inventory
  const stats = await player.stats
  player.setHP = { current: stats.health, max: stats.health }

  const throwable = await player.throwable

  const enemy = new Enemy(player)
  enemy.setName = `🤖 Minion #${Math.floor(Math.random() * 998) + 1}`
  enemy.setHP = ((stats.health / stats.attack) * stats.attack) * await player.difficulty

  const battle = new Battle(player, enemy)

  const heart = Bot.client.emojis.cache.find(e => e.name === 'heart_rpg')
  const attack = Bot.client.emojis.cache.find(e => e.name == 'attack_rpg')
  const defense = Bot.client.emojis.cache.find(e => e.name == 'defense_rpg')

  const buttons = new Discord.MessageActionRow().addComponents(

    new Discord.MessageButton()
      .setCustomId('battle_attack')
      .setLabel('Attack')
      .setStyle('SECONDARY'),

    new Discord.MessageButton()
      .setCustomId('battle_throw')
      .setLabel('Throw')
      .setStyle('SECONDARY'),

    new Discord.MessageButton()
      .setCustomId('battle_potion')
      .setLabel('Potion')
      .setStyle('SECONDARY'),

    new Discord.MessageButton()
      .setCustomId('battle_run')
      .setLabel('Run')
      .setStyle('DANGER'),

    new Discord.MessageButton()
      .setCustomId('battle_history')
      .setLabel('History')
      .setStyle('PRIMARY')
  )

  function disableComponents() {
    buttons.components.forEach(button => {
      button.disabled = true
      button.style = 'SECONDARY'
    })
  }

  const embed = sendEmbed(`Kill **${enemy.name}** (**${enemy.hp.current}/${enemy.hp.max}**) to steal its loot!`,
    {
      title: `You encountered ${enemy.name}!`,
      color: Utils.colors.red
    })
    embed
    .setTitle(`You encountered ${enemy.name}!`)
    .addField(`${msg.member.displayName}`, `${player.hp.current}/${player.hp.max} ${heart}`, true)
    .addField(`${enemy.name}`, `${enemy.hp.current}/${enemy.hp.max} ${heart}`, true)
    .addField(`\u200b`, `*Status: No Interaction*`)
  
  const message = msg.reply({
    embeds: [embed], components: [buttons] } )

  let filter = interaction => interaction.customId.startsWith('battle') && interaction.user.id === msg.member.id

  let cancelled = false
  if (cancelled === true) return

  const history = []

  while (true) {
    const interaction = await msg.channel.awaitMessageComponent({filter, timeout: 60000, max: 1 }).catch(err => {
      disableComponents()
      cancelled = true
      message.edit({ embeds: [embed], components: [buttons] })
    })

    if (!interaction) break

    if (interaction.member.id !== msg.member.id) {
      interaction.reply({ embeds: [sendEmbed(Utils.messages.unusable_interaction)], ephemeral: true })
      continue;
    }

    const selected = interaction.customId

    let hasWon, string, damage, throwable, potion = '';

    function updateEmbed(num) {
      embed.setDescription(`Kill **${enemy.name}** (**${enemy.hp.current}/${enemy.hp.max}**) to steal its loot!`)
      embed.spliceFields(0, 999)
        .setTitle(`You encountered ${enemy.name}!`)
        .addField(`${msg.member.displayName}`, `${player.hp.current}/${player.hp.max} ${heart} ${
          num === 1
          ? `(-${damage})` 
          : num === 2 
            ? `(+${Math.floor(player.hp.max / 100 * potion.heal_percentage)})` 
            : ''
        }`, true)
        .addField(`${enemy.name}`, `${enemy.hp.current}/${enemy.hp.max} ${heart} ${
          num === 0
          ? `(-${damage})` 
          : num === 3
            ? `(+${Math.floor(player.hp.max / 100 * potion.heal_percentage)})` 
            : ''
        }`, true)
        .addField(`\u200b`, `*Status: ${string}*`)

        history.push(string)

      return embed
    }

    if (selected === 'battle_history') {
      embed.spliceFields(0, 999)
      embed.setDescription(history.join("\n\n"))
      embed.setColor(Utils.colors.grey)
      const newButtons = new Discord.MessageActionRow().addComponents(
        new Discord.MessageButton()
          .setCustomId('battle_present')
          .setLabel('< Back')
          .setStyle('SECONDARY'))
      interaction.update({ embeds: [embed], components: [newButtons] });
    }

    if (selected === 'battle_present') {
      string = history[history.length - 1]
      history.splice(history.length - 1, 1)
      interaction.update({ embeds: [updateEmbed(99).setColor(Utils.colors.red)], components: [buttons] });
    }

    if (selected === 'battle_throw') {
      throwable = await player.throwable

      if (throwable) {
        [hasWon, string, shopThrowable] = await battle.useThrowable({ returnString: true })
        damage = shopThrowable.damage

        if (hasWon === true) {
          disableComponents()
          interaction.update({ embeds: [updateEmbed(0).setColor(Utils.colors.green)], components: [buttons] });
          return [true, inventory]
        } else {
          interaction.message.edit({ embeds: [updateEmbed(0)], components: [buttons] });

          await Utils.wait(1000);

          [hasWon, string] = await enemy.attack({ returnString: true })

          if (hasWon === true) {
            disableComponents()
            interaction.update({ embeds: [updateEmbed(1).setColor(Utils.colors.red)], components: [buttons] });
            return [false, inventory]
          }

          interaction.update({ embeds: [updateEmbed(1)], components: [buttons] });
        }
      } else {
        string = `You are not using a throwable!`
        interaction.update({ embeds: [updateEmbed(99).setColor(Utils.colors.yellow)], components: [buttons] });
      }
    }

    if (selected === 'battle_potion') {
      if (player.potion) {
        [hasWon, string, potion] = await battle.usePotion({returnString: true})

        if (hasWon === true) {
          disableComponents()
          interaction.update({ embeds: [updateEmbed(99).setColor(Utils.colors.green)], components: [buttons] }); 
          return [true, inventory]
        } else {
          interaction.message.edit({ embeds: [updateEmbed(2)], components: [buttons]})

          await Utils.wait(1000);

          [hasWon, string, damage] = await enemy.attack({returnString: true})

          if (hasWon) {
            disableComponents()
            interaction.update({ embeds: [updateEmbed(2)], components: [buttons] }); 
            return [false, inventory]
          }

          interaction.update({ embeds: [updateEmbed(1)], components: [buttons] }); 
        }
      } else msg.reply({ embeds: [sendEmbed(`You are not using a potion!\n\nType \`attack\`, \`throw\`, \`potion\` or \`run\``, { color: Utils.colors.yellow })] })
    }

    if (selected === 'battle_run') {
      [bool, string] = battle.run({returnString: true})

      if (bool === true) {
        disableComponents()
        interaction.update({ embeds: [updateEmbed(99).setColor(Utils.colors.green)], components: [buttons]}); 
        return ['skip']
      } else {
        disableComponents()
        interaction.update({ embeds: [updateEmbed(99).setColor(Utils.colors.red)], components: [buttons] }); 
        return [false]
      }
    }

    if (selected === 'battle_attack') {
      [hasWon, string, damage] = await battle.attack({returnString: true})
      
      if (hasWon === true) {
        disableComponents()
        interaction.update({ embeds: [updateEmbed(0).setColor(Utils.colors.green)], components: [buttons] }); 
        return [true, inventory] 
      } 
      else if (hasWon === false) {
        disableComponents()
        interaction.update({ embeds: [updateEmbed(0).setColor(Utils.colors.red)], components: [buttons] });
        return [false] 
      } 
      else if (hasWon === 'skip') {
        interaction.message.edit({ embeds: [updateEmbed(0)], components: [buttons] })

        await Utils.wait(1500);

        [hasWon, string, damage] = await enemy.attack({returnString: true})

        if (hasWon === true) {
          disableComponents()
          interaction.update({ embeds: [updateEmbed(1)], components: [buttons] })
          return [false, inventory] }
        else if (hasWon === false) { interaction.update({ embeds: [updateEmbed(1)], components: [buttons] }) }
      }
    }
  }
}