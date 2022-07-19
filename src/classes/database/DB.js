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

  static connection() {
    return new Promise((resolve, reject) => {
      resolve(require('mysql2').createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: "sprity_bot",
        multipleStatements: true,
        connectionLimit: 1
      }))
    })
  }

  static async query(sql, bindings) {
    return new Promise(async (resolve) => {
      const connection = await this.connection()

      switch (typeof bindings) {
        case 'function':
          await connection.query(sql, [], (err, result, fields) => {
            err
              ? (() => { throw err })()
              : bindings([result, fields, err]);
          })
          break;

          case 'array':
            connection.query(sql, bindings, (err, result, fields) => {
              err
                ? (() => { throw err })()
                : resolve([result, fields, err]);
            })
          break;

        default:
          connection.query(sql, [], (err, result, fields) => {
            err
              ? (() => { throw err })()
              : resolve([result, fields, err]);
          })
          break;
      }

      connection.end()
    })
  }

  static member = {
    addToDB: async (member) => {
      this.query(`select member_id from members where member_id = ${member.id}`).then(data => {
        if (!data[0][0]) this.query(`insert into members (member_id, warns, stats, inventory, quests) values (${member.id}, '[]', '[{"id": "health", "current": 50, "cap": 100},{"id": "attack", "current": 10, "cap": 100},{"id": "defense", "current": 20, "cap": 30}]', '[]', '')`)
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