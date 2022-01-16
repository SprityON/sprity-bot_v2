const Utils = require('../../classes/utilities/Utils')

module.exports = {
  name: Utils.getCmdName(__filename, __dirname),
  category: Utils.getCmdCategory(__filename),
  usage: 'unban <memberID>',
  aliases: [],
  permissions: ['BAN_MEMBERS'],
  timeout: 1000,

  async execute(msg, args) {
    let member = msg.mentions.members.first()
    if (member) return msg.reply('Unban Members with their Member ID.')
    
    msg.guild.fetchBans()
    .then(bannedMembers => {
      let bannedMember;
      let memberID = args[0]
      
      if (memberID) {
        const banned = bannedMembers.find(member => member.user.id === memberID)
        if (!banned) return msg.reply('This Member is not banned in this server.')

        if (isNaN(memberID)) { return msg.reply('An ID contains only of numbers.') }
        if (memberID.length < 18 || memberID.length > 18) return msg.reply(`Member with ID \`${memberID}\` was not found.`)

        bannedMember = memberID
        msg.guild.members.unban(bannedMember)
        msg.channel.send(`A Member with the id \`${memberID}\` was unbanned.'`)
      } else return msg.reply('You did not provide a valid Member ID.')
    }).catch(err => console.log(err))
  },

  help: {
    enabled: false,
    title: '',
    description: ``,
  }
}