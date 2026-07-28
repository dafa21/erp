import Database from "better-sqlite3";
const db = new Database('database.sqlite');
const user = db.prepare('SELECT id, role, status FROM users WHERE id = ?').get(1);
console.log("With number 1:", user);
const userStr = db.prepare('SELECT id, role, status FROM users WHERE id = ?').get('1');
console.log("With string '1':", userStr);
