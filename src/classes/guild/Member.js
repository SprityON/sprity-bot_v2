const DB = require("../database/DB")

module.exports = class Member {
  constructor(member) {
    member
      ? this.member = member
      : (() => { throw new Error('Constructor needs member object as argument.') })

      this.id = member.id
      this.username = member.user.username
      this.avatarURL = member.user.avatarURL({ dynamic: true })
  }

  get warns() {
    return new Promise((resolve, reject) => {
      resolve(DB.member.getWarns(this.member))
    })
  }

  kick(reason) {
    this.member.kick(reason || 'No reason.')
    DB.query(`UPDATE SET kicked = 1 WHERE member_id = ${this.member.id}`)
  }

  ban(reason) {
    this.member.ban(reason || 'No reason.')
    DB.query(`UPDATE SET banned = 1 WHERE member_id = ${this.member.id}`)
  }
}