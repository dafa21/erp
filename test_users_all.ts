import Database from "better-sqlite3";
const db = new Database('database.sqlite');
const users = db.prepare('SELECT id, role, status FROM users').all();
console.log("All users:", users);
