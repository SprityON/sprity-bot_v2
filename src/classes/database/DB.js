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
        ? (reject('\n**\nDatabase error.\n' + err + '\n**'))
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
        err
          ? (() => { throw err })()
          : conn.query(sql, bindings, (err, result, fields) => {
            err
              ? (() => { throw err })()
              : resolve([result, fields, err]);
          })
        conn.release();
      })
    })
  }

  static guild = {
    getPrefix: async () => {
      return require('../../config.json').defaultPrefix
    }
  }
}