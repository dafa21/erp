import Database from "better-sqlite3";
const db = new Database('database.sqlite');
const user = db.prepare('SELECT id, role, status FROM users LIMIT 1').get();
console.log(user);
