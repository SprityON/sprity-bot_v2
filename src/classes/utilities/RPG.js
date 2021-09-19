const DB = require("../database/DB")

module.exports = class RPG {
  constructor (member) {
    member
    ? this.member = member
    : (() => { throw new Error('Constructor needs member object') })
  }

  /** 
   * Creates RPG account for member
   * @param {object} member 
   */
  create(msg) {
    msg.inlineReply(`Do you want to create an account? (Y/N)`)

    const filter = m => m.author.id === msg.author.id
    msg.channel.awaitMessages(filter, { 
      max: 1, 
      time: 30000 
    }).then(collected => {
      collected.first().content.toLowerCase() === 'y'
        ? msg.inlineReply(`What will your username be?`)
          .then(async msg => {
            const collected = await msg.channel.awaitMessages(filter, { 
              max: 1, 
              timeout: 120000 
            }).catch(collected => {
              console.log(collected);

              msg.channel.send(`You were too late!`)
            })

            const username = collected.first().content

            msg.inlineReply(`Your account was created!`)
            DB.query(`insert into rpg (member_id, username, inventory) values ('${this.member.id}', '${username}', '[{"points": 0}, {}]')`)
          })
        : msg.inlineReply(`Cancelled!`)
    }).catch(collected => {
      console.log(collected);

      msg.channel.send(`You were too late!`)
    })
  }

  /**
   * Deletes RPG account for member
   * @param {object} member 
   */
  delete(msg) {
    msg.inlineReply(`Are you sure you want to delete your account? (Y/N)`)

    const filter = m => m.author.id === msg.author.id
    msg.channel.awaitMessages(filter, { 
      max: 1, 
      time: 120000 
    }).then(collected => {
      collected.first().content.toLowerCase() === 'y'
        ? DB.query(`delete from rpg where member_id = ${msg.member.id}`)
        .then(msg.inlineReply(`Your account was deleted!`))
        : msg.inlineReply(`Cancelled!`)
    })
    DB.query(`delete from rpg where member_id = ${this.member.id}`)
  }

  hasAccount(msg) {
    return new Promise(async (resolve, reject) => {
      const result = await DB.query(`SELECT * FROM rpg WHERE member_id = ${this.member.id}`)
      result[0][0]
        ? resolve(true)
        : (resolve(false), this.create(msg))
    })
  }
}