// @ts-nocheck
import Database from 'better-sqlite3';
const db = new Database('database.sqlite');

const existingClinics = db.prepare('SELECT id FROM clinics').all();
for (const c of existingClinics) {
  const hasCoa = db.prepare('SELECT id FROM chart_of_accounts WHERE clinic_id = ?').get(c.id);
  if (!hasCoa) {
    db.prepare("INSERT INTO chart_of_accounts (clinic_id, account_code, account_name, account_type) VALUES (?, '1-1000', 'Kas / Bank', 'Asset')").run(c.id);
    db.prepare("INSERT INTO chart_of_accounts (clinic_id, account_code, account_name, account_type) VALUES (?, '1-1100', 'Piutang Pasien', 'Asset')").run(c.id);
    db.prepare("INSERT INTO chart_of_accounts (clinic_id, account_code, account_name, account_type) VALUES (?, '1-1200', 'Persediaan Obat', 'Asset')").run(c.id);
    db.prepare("INSERT INTO chart_of_accounts (clinic_id, account_code, account_name, account_type) VALUES (?, '2-1000', 'Hutang Usaha', 'Liability')").run(c.id);
    db.prepare("INSERT INTO chart_of_accounts (clinic_id, account_code, account_name, account_type) VALUES (?, '3-1000', 'Modal Laba Ditahan', 'Equity')").run(c.id);
    db.prepare("INSERT INTO chart_of_accounts (clinic_id, account_code, account_name, account_type) VALUES (?, '4-1000', 'Pendapatan Medis', 'Revenue')").run(c.id);
    db.prepare("INSERT INTO chart_of_accounts (clinic_id, account_code, account_name, account_type) VALUES (?, '4-1100', 'Pendapatan Farmasi', 'Revenue')").run(c.id);
    db.prepare("INSERT INTO chart_of_accounts (clinic_id, account_code, account_name, account_type) VALUES (?, '5-1000', 'HPP Obat', 'Expense')").run(c.id);
    db.prepare("INSERT INTO chart_of_accounts (clinic_id, account_code, account_name, account_type) VALUES (?, '6-1000', 'Biaya Operasional', 'Expense')").run(c.id);
  }
}
console.log("Migration done");
