module.exports.execute = (member) => {
  member.guild.channels.cache.get('718838641815715880')
    .send(`**${member.user.username}** has left the server.`)

  const botCount = member.guild.members.cache.filter(member => member.user.bot).size
  const memberCount = member.guild.members.cache.filter(member => !member.user.bot).size

  member.guild.channels.cache.get('723051368872673290')
    .setName('🙍🏻┃Members: ' + memberCount.toString())

  member.guild.channels.cache.get('751176168614527007')
    .setName('🤖┃Bots: ' + botCount.toString())
}