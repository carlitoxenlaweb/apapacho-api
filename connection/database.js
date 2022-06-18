const mysql = require("mysql2")
const path = require("path")
const fs = require("fs")

const filename = `${__dirname}${path.sep}config.json`

const defaultConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  port: process.env.DB_PORT || 3306,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
}

const connection = mysql.createConnection(fs.existsSync(filename) ? require(filename) : defaultConfig)
module.exports = connection.promise()
