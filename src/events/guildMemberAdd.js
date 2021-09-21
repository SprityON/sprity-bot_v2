const DB = require("../classes/database/DB");

module.exports.execute = async (member) => {
  const memberCount = member.guild.members.cache.filter(member => !member.user.bot).size
  const botCount = member.guild.members.cache.filter(member => member.user.bot).size

  member.guild.channels.cache.get('723051368872673290')
    .setName('🙍🏻┃Members: ' + memberCount.toString())
  member.guild.channels.cache.get('751176168614527007')
    .setName('🤖┃Bots: ' + botCount.toString())
    
  if (member.user.bot === true) {
    const roleBot = member.guild.roles.cache.find(role => role.name === "Bot")
    return member.roles.add(roleBot)
  }

  const channel = member.guild.channels.cache.get('718838641815715880');
  channel.send(`Welcome to our server, ${member}! Please read the <#380724759740153866>`);

  member.roles.add(member.guild.roles.cache.find(role => role.name === "Member"))
  DB.member.addToDB(member)

  const data = await DB.query(`SELECT * FROM members WHERE member_id = ${member.id}`)
  const kicked = data[0][0].kicked
  const warns = data[0][0].warns

  const roleKicked = member.guild.roles.cache.find(role => role.name === "Kicked")
  const warning1 = member.guild.roles.cache.find(role => role.name === 'Warning 1')
  const warning2 = member.guild.roles.cache.find(role => role.name === 'Warning 2')

  if (kicked == 1) member.roles.add(roleKicked)

  switch (warns) {
    case 1:
      member.roles.add(warning1)
      break;
    case 2:
      member.roles.add(warning1)
      member.roles.add(warning2)
      break;
  }
}