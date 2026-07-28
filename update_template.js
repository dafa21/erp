const XLSX = require('xlsx');

const data = [
  { 'Kode Akun': '1-0000', 'Nama Akun': 'ASSET', 'Tipe Akun': 'Asset', 'Level': 'Head', 'Saldo': 0 },
  { 'Kode Akun': '1-1000', 'Nama Akun': 'KAS DAN BANK', 'Tipe Akun': 'Asset', 'Level': 'Head', 'Saldo': 0 },
  { 'Kode Akun': '1-1100', 'Nama Akun': 'Kas Besar', 'Tipe Akun': 'Asset', 'Level': 'Body', 'Saldo': 0 },
  { 'Kode Akun': '1-1110', 'Nama Akun': 'Kas Kecil (Petty Cash)', 'Tipe Akun': 'Asset', 'Level': 'Body', 'Saldo': 0 },
  { 'Kode Akun': '1-1200', 'Nama Akun': 'Bank BNI', 'Tipe Akun': 'Asset', 'Level': 'Body', 'Saldo': 0 },
  { 'Kode Akun': '1-2000', 'Nama Akun': 'PIUTANG', 'Tipe Akun': 'Asset', 'Level': 'Head', 'Saldo': 0 },
  { 'Kode Akun': '1-2100', 'Nama Akun': 'Piutang Pasien Umum', 'Tipe Akun': 'Asset', 'Level': 'Body', 'Saldo': 0 },
  { 'Kode Akun': '1-2200', 'Nama Akun': 'Piutang Asuransi', 'Tipe Akun': 'Asset', 'Level': 'Body', 'Saldo': 0 },
  { 'Kode Akun': '1-3000', 'Nama Akun': 'PERSEDIAAN', 'Tipe Akun': 'Asset', 'Level': 'Head', 'Saldo': 0 },
  { 'Kode Akun': '1-3100', 'Nama Akun': 'Persediaan Obat dan Farmasi', 'Tipe Akun': 'Asset', 'Level': 'Body', 'Saldo': 0 },
  { 'Kode Akun': '1-3200', 'Nama Akun': 'Persediaan Alkes', 'Tipe Akun': 'Asset', 'Level': 'Body', 'Saldo': 0 },
  { 'Kode Akun': '2-0000', 'Nama Akun': 'LIABILITY', 'Tipe Akun': 'Liability', 'Level': 'Head', 'Saldo': 0 },
  { 'Kode Akun': '2-1000', 'Nama Akun': 'HUTANG DAGANG', 'Tipe Akun': 'Liability', 'Level': 'Head', 'Saldo': 0 },
  { 'Kode Akun': '2-1100', 'Nama Akun': 'Hutang Pemasok (Supplier)', 'Tipe Akun': 'Liability', 'Level': 'Body', 'Saldo': 0 },
  { 'Kode Akun': '3-0000', 'Nama Akun': 'EQUITY', 'Tipe Akun': 'Equity', 'Level': 'Head', 'Saldo': 0 },
  { 'Kode Akun': '3-1000', 'Nama Akun': 'Modal Pemilik', 'Tipe Akun': 'Equity', 'Level': 'Body', 'Saldo': 0 },
  { 'Kode Akun': '3-2000', 'Nama Akun': 'Laba Ditahan', 'Tipe Akun': 'Equity', 'Level': 'Body', 'Saldo': 0 },
  { 'Kode Akun': '4-0000', 'Nama Akun': 'REVENUE', 'Tipe Akun': 'Revenue', 'Level': 'Head', 'Saldo': 0 },
  { 'Kode Akun': '4-1000', 'Nama Akun': 'PENDAPATAN KLINIK', 'Tipe Akun': 'Revenue', 'Level': 'Head', 'Saldo': 0 },
  { 'Kode Akun': '4-1100', 'Nama Akun': 'Pendapatan Jasa Medis / Tindakan', 'Tipe Akun': 'Revenue', 'Level': 'Body', 'Saldo': 0 },
  { 'Kode Akun': '4-1200', 'Nama Akun': 'Pendapatan Farmasi / Obat', 'Tipe Akun': 'Revenue', 'Level': 'Body', 'Saldo': 0 },
  { 'Kode Akun': '5-0000', 'Nama Akun': 'EXPENSE', 'Tipe Akun': 'Expense', 'Level': 'Head', 'Saldo': 0 },
  { 'Kode Akun': '5-1000', 'Nama Akun': 'HARGA POKOK PENJUALAN', 'Tipe Akun': 'Expense', 'Level': 'Head', 'Saldo': 0 },
  { 'Kode Akun': '5-1100', 'Nama Akun': 'HPP Obat dan Farmasi', 'Tipe Akun': 'Expense', 'Level': 'Body', 'Saldo': 0 },
  { 'Kode Akun': '5-2000', 'Nama Akun': 'BIAYA OPERASIONAL', 'Tipe Akun': 'Expense', 'Level': 'Head', 'Saldo': 0 },
  { 'Kode Akun': '5-2100', 'Nama Akun': 'Biaya Gaji Karyawan & Dokter', 'Tipe Akun': 'Expense', 'Level': 'Body', 'Saldo': 0 },
  { 'Kode Akun': '5-2200', 'Nama Akun': 'Biaya Listrik, Air, Internet', 'Tipe Akun': 'Expense', 'Level': 'Body', 'Saldo': 0 }
];

const worksheet = XLSX.utils.json_to_sheet(data);
const workbook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(workbook, worksheet, "ChartOfAccounts");
XLSX.writeFile(workbook, "public/template_coa.xlsx");
console.log("Template generated.");
