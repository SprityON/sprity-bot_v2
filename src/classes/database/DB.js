const Bot = require('../../Bot')

module.exports = class DB {
  static connect() {
    return new Promise((resolve, reject) => {
      require('mysql2').createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: "sprity_bot"
      }).connect(err => 
        err
          ? reject('\n**\nDatabase error.\n' + err + '\n**')
          : resolve('Database is connected.\n')
      )
    })
  }

  static get pool() {
    return require('mysql2').createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: "sprity_bot"
    })
  }
  
  static async query(sql, bindings) {
    return new Promise((resolve) => {
      switch (typeof bindings) {
        case 'function':
          this.pool.query(sql, [], (err, result, fields) => {
            err
              ? (() => { throw err })()
              : bindings([result, fields, err]);
          })
          break;

        default:
          this.pool.query(sql, bindings, (err, result, fields) => {
            err
              ? (() => { throw err })()
              : resolve([result, fields, err]);
          })
          break;
      }
    })
  }

  static member = {
    addToDB: async (member) => {
      this.query(`select member_id from members where member_id = ${member.id}`, data => {
        if (!data[0][0]) this.query(`insert into members (member_id, warns, stats, inventory, quests) values (${member.id}, '[]', '{"health": 100, "attack": 20, "defense": 0}', '[]', '')`)
      })
    },

    getWarns: async (member) => {
      return new Promise(async (resolve, reject) => {
        const result = await this.query(`select * from members where member_id = ${member.id}`)
        resolve(result[0][0].warns)
      })
    },

    countMessage: async (member) => {
      this.query(`select messages from members where member_id = ${member.id}`)
      .then(data => {
        const messages = data[0][0].messages
        this.query(`update members set messages = ${messages + 1} where member_id = ${member.id}`)
      })
    }
  }

  static guild = {
    getPrefix: async () => {
      return require('../../config.json').defaultPrefix
    }
  }
}