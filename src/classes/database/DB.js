const Bot = require('../../Bot')

module.exports = class DB {
  static connect() {
    return new Promise((resolve, reject) => {
      require('mysql').createConnection({
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
    return require('mysql').createPool({
      timeout: 10000,
      connectionLimit: 50,
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: "sprity_bot"
    })
  }
  
  static async query(sql, bindings) {
    return new Promise((resolve) => {
      this.pool.getConnection((err, conn) => {
        if (err) throw err

        switch (typeof bindings) {
          case 'function':
            conn.query(sql, [], (err, result, fields) => {
              err
                ? (() => { throw err })()
                : bindings([result, fields, err]);
            })
            break;
            
          case 'array': 
            conn.query(sql, bindings, (err, result, fields) => {
              err
                ? (() => { throw err })()
                : resolve([result, fields, err]);
            })
            break;
        
          default:
            conn.query(sql, bindings, (err, result, fields) => {
              err
                ? (() => { throw err })()
                : resolve([result, fields, err]);
            })
            break;
        }
        conn.release();
      })
    })
  }

  static member = {
    addToDB: async (member) => {
      this.query(`select member_id from members where member_id = ${member.id}`, data => {
        if (!data[0][0]) this.query(`insert into members (member_id) values (${member.id})`)
      })
    },

    getWarns: async (member) => {
      return new Promise(async (resolve, reject) => {
        const result = await this.query(`select * from members where member_id = ${member.id}`)
        if (!result[0][0]) return this.member.addToDB(member)
        resolve(result[0][0].warns)
      })
    }
  }

  static guild = {
    getPrefix: async () => {
      return require('../../config.json').defaultPrefix
    }
  }
}