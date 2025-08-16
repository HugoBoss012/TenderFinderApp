const Database = require('better-sqlite3');
const db = new Database('tenderfinder.db');
module.exports = db;