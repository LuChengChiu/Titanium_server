const dotenv = require("dotenv");
const mysql = require("mysql2");
dotenv.config();

const { CGP_USER, CGP_PWD, CGP_HOST, CGP_DB } = process.env;

const pool = mysql.createPool({
  user: CGP_USER,
  password: CGP_PWD,
  database: CGP_DB,
  host: CGP_HOST,
});

module.exports = pool;
