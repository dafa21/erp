import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import path from 'path';

// Ganti 'admin' dengan username superadmin Anda jika berbeda
const USERNAME = 'admin';
// Ganti 'admin123' dengan password baru yang Anda inginkan
const NEW_PASSWORD = 'admin'; 

const dbPath = path.resolve('database.sqlite');
const db = new Database(dbPath);

try {
  // Cek apakah user ada
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(USERNAME);
  
  if (!user) {
    console.error(`User dengan username '${USERNAME}' tidak ditemukan di database.`);
    process.exit(1);
  }

  // Hash password baru
  const hashedPassword = bcrypt.hashSync(NEW_PASSWORD, 10);

  // Update ke database
  db.prepare('UPDATE users SET password = ? WHERE username = ?').run(hashedPassword, USERNAME);
  
  console.log(`\nSukses! Password untuk user '${USERNAME}' telah di-reset menjadi: ${NEW_PASSWORD}`);
  console.log(`Silakan coba login kembali.\n`);

} catch (error) {
  console.error("Terjadi kesalahan:", error);
} finally {
  db.close();
}
