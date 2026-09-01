const db = require('better-sqlite3')('database.sqlite');
const user = db.prepare('SELECT * FROM users WHERE username = ?').get('admin');
console.log(user);
