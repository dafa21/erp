export const architectureData = {
  rbac: {
    title: "Matriks Otorisasi & Fitur (RBAC)",
    roles: [
      {
        name: "Suster (Keperawatan)",
        color: "bg-blue-100 text-blue-800 border-blue-200",
        icon: "Heart",
        features: [
          "Menu: Triase & TTV (EWS Otomatis)",
          "Menu: Riwayat Alergi Pasien",
          "Menu: Asesmen Jatuh & Nyeri",
          "Menu: Asuhan Keperawatan (CPPT)"
        ]
      },
      {
        name: "Bidan (Kebidanan)",
        color: "bg-pink-100 text-pink-800 border-pink-200",
        icon: "Users",
        features: [
          "Rekam Medis Khusus ANC & PNC",
          "Partograf Digital (Pantau persalinan aktif)",
          "Kartu Kendali Imunisasi Anak dan Layanan KB",
          "Manajemen Ruang Bersalin (VK) & Kamar Bayi"
        ]
      },
      {
        name: "Dokter (Medis Utama)",
        color: "bg-emerald-100 text-emerald-800 border-emerald-200",
        icon: "Stethoscope",
        features: [
          "EMR berbasis SOAP dengan Locking Mechanism 24 jam",
          "Integrasi kodifikasi ICD-10 & ICD-9-CM pintar",
          "E-Prescribing terhubung stok real-time (Anti-order kosong)",
          "CDSS: Alert otomatis alergi alergi dan kontraindikasi",
          "Manajemen Rujukan Internal & Eksternal"
        ]
      },
      {
        name: "Apoteker (Farmasi)",
        color: "bg-purple-100 text-purple-800 border-purple-200",
        icon: "Pill",
        features: [
          "Antrean Verifikasi Resep (Administratif, Farmasetik, Klinis)",
          "Manajemen Compounding & Kalkulasi Jasa Racik",
          "Inventory Multi-Gudang (FIFO/FEFO, Batch Tracking, Expired Alert)",
          "Stock Opname digital (Pembekuan stok sementara)"
        ]
      },
      {
        name: "Admin (Manajemen/Audit)",
        color: "bg-slate-100 text-slate-800 border-slate-200",
        icon: "ShieldAlert",
        features: [
          "Manajemen Hak Akses, Bed Management, & Shift",
          "Master Data Tarif & Margin Obat per Kelas pasien",
          "Billing Konsolidasi (POS Kasir 1 Invoice)",
          "Audit Trail (Log Immutable untuk compliance)"
        ]
      }
    ]
  },
  analysis: {
    title: "Analisis Struktur, Keamanan & Race Condition",
    content: `
### 1. Penanganan 'Race Condition' di Farmasi
Dalam sistem apotek skala Enterprise (terutama dengan transaksi sangat padat), fitur pengurangan stok obat (*Stock Deduction*) rentan mengalami **Race Condition** - di mana dua apoteker memproses dan mengurangi stok dari *Batch* obat yang sama secara bersamaan, menyebabkan minus stok atau inkonsistensi.

**Solusi Arsitektural:**
- **Pessimistic Locking (Row-Level Lock):** Menggunakan klausa \`SELECT ... FOR UPDATE\` di PostgreSQL saat apoteker mengonfirmasi resep. Ini mengunci baris (row) pada tabel \`trx_stok_gudang\` untuk batch tersebut hingga transaksi di-*commit*. Apoteker lain yang mencoba mengakses batch yang sama akan dalam posisi *wait* (antre sepersekian detik).
- **Pembungkusan Transaksi ACID:** Eksekusi pemotongan stok dan pencatatan riwayat kartu stok **wajib** berada di dalam blok \`BEGIN ... COMMIT\`.
- **Constraint Level Database:** Memasang constraint \`CHECK (jumlah_stok >= 0)\` di tabel database sebagai benteng terakhir.

### 2. Mekanisme Locking EMR (Rekam Medis)
Untuk menjaga integritas rekam medis (*Immutable Record*) sesuai kaidah medico-legal:
- Sistem menggunakan \`is_locked\` dan \`locked_at\` di tabel \`trx_rekam_medis\`.
- **Trigger/Job:** *Cron job* berjalan setiap jam memeriksa waktu \`created_at\` dan otomatis mengubah \`is_locked = TRUE\` jika sudah melewati batas 24 jam. Atau trigger dieksekusi langsung saat Dokter menekan "Selesai Periksa".
- **Immutable Log:** Segala modifikasi pasca-*lock* hanya bisa dengan membuat row Addendum baru, yang diaudit ketat oleh \`sys_audit_logs\`.

### 3. Keamanan Tingkat Tinggi
- Menggunakan ekstensi **pgcrypto** (jika Postgres) untuk enkripsi \`data_enkripsi_demografi BYTEA\` di level database, melindungi identitas inti pasien jika terjadi kebocoran DB.
- Seluruh Private Key/Primary Key menggunakan **UUID v4** untuk mencegah enumerasi URL (menghindari serangan Insecure Direct Object Reference / IDOR).
    `
  },
  ddl: {
    title: "Skema DDL SQL (PostgreSQL)",
    code: `-- Aktifkan ekstensi UUID (Khusus PostgreSQL)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. MASTER ROLES & USERS
CREATE TABLE mst_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE mst_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_id UUID REFERENCES mst_roles(id) ON DELETE RESTRICT,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. MASTER PASIEN
CREATE TABLE mst_pasien (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    no_rm VARCHAR(20) NOT NULL UNIQUE,
    nik VARCHAR(16) UNIQUE,
    nama_lengkap VARCHAR(150) NOT NULL,
    tanggal_lahir DATE NOT NULL,
    jenis_kelamin CHAR(1) CHECK (jenis_kelamin IN ('L', 'P')),
    alamat TEXT,
    no_bpjs VARCHAR(20),
    data_enkripsi_demografi BYTEA, -- Enkripsi kolom sensitif
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. MASTER OBAT & STOK (FARMASI)
CREATE TABLE mst_obat (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    kode_obat VARCHAR(20) NOT NULL UNIQUE,
    nama_obat VARCHAR(150) NOT NULL,
    kategori VARCHAR(50),
    harga_dasar NUMERIC(15,2) NOT NULL,
    margin_kelas_1 NUMERIC(5,2), 
    margin_kelas_2 NUMERIC(5,2),
    margin_kelas_3 NUMERIC(5,2),
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE trx_stok_gudang (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    obat_id UUID REFERENCES mst_obat(id) ON DELETE RESTRICT,
    lokasi_gudang VARCHAR(50) NOT NULL,
    no_batch VARCHAR(50) NOT NULL,
    tanggal_kedaluwarsa DATE NOT NULL,
    jumlah_stok INT NOT NULL CHECK (jumlah_stok >= 0),
    version INT DEFAULT 1, -- Untuk Optimistic Locking / Stock tracking
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_batch_lokasi UNIQUE (obat_id, lokasi_gudang, no_batch)
);

-- 4. TRANSAKSI PENDAFTARAN & KUNJUNGAN
CREATE TABLE trx_pendaftaran (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pasien_id UUID REFERENCES mst_pasien(id) ON DELETE RESTRICT,
    dokter_id UUID REFERENCES mst_users(id) ON DELETE RESTRICT,
    jenis_penjamin VARCHAR(50) CHECK (jenis_penjamin IN ('UMUM', 'BPJS', 'ASURANSI')),
    tujuan_poli VARCHAR(50) NOT NULL,
    status_kunjungan VARCHAR(20) DEFAULT 'MENUNGGU',
    waktu_daftar TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. TRIASE SUSTER & BIDAN
CREATE TABLE trx_triase (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pendaftaran_id UUID REFERENCES trx_pendaftaran(id) ON DELETE CASCADE,
    suster_id UUID REFERENCES mst_users(id),
    tensi_sistolik INT,
    tensi_diastolik INT,
    suhu NUMERIC(4,2),
    nadi INT,
    respirasi INT,
    spo2 INT,
    berat_badan NUMERIC(5,2),
    tinggi_badan NUMERIC(5,2),
    skor_nyeri INT,
    skor_jatuh INT,
    ews_score INT,
    waktu_triase TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. REKAM MEDIS ELEKTRONIK (EMR DOKTER)
CREATE TABLE trx_rekam_medis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pendaftaran_id UUID REFERENCES trx_pendaftaran(id) ON DELETE CASCADE,
    dokter_id UUID REFERENCES mst_users(id),
    soap_subjektif TEXT,
    soap_objektif TEXT,
    soap_asesmen TEXT,
    soap_plan TEXT,
    icd10_kode VARCHAR(20),
    riwayat_alergi TEXT,
    is_locked BOOLEAN DEFAULT FALSE,
    locked_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. TINDAKAN MEDIS (PROSEDUR ICD-9-CM)
CREATE TABLE trx_tindakan_medis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pendaftaran_id UUID REFERENCES trx_pendaftaran(id) ON DELETE CASCADE,
    operator_id UUID REFERENCES mst_users(id),
    icd9_kode VARCHAR(20) NOT NULL,
    nama_tindakan VARCHAR(150),
    waktu_tindakan TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. RESEP OBAT (E-PRESCRIBING)
CREATE TABLE trx_resep_obat (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pendaftaran_id UUID REFERENCES trx_pendaftaran(id) ON DELETE CASCADE,
    dokter_id UUID REFERENCES mst_users(id),
    apoteker_id UUID REFERENCES mst_users(id),
    status_resep VARCHAR(20) DEFAULT 'DRAFT' CHECK (status_resep IN ('DRAFT', 'DIPROSES', 'SELESAI', 'DIBATALKAN')),
    waktu_resep TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE trx_resep_detail (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resep_id UUID REFERENCES trx_resep_obat(id) ON DELETE CASCADE,
    obat_id UUID REFERENCES mst_obat(id) ON DELETE RESTRICT,
    batch_terpakai VARCHAR(50), 
    jumlah INT NOT NULL CHECK (jumlah > 0),
    aturan_pakai VARCHAR(100) NOT NULL,
    is_racikan BOOLEAN DEFAULT FALSE,
    jasa_racik NUMERIC(15,2) DEFAULT 0
);

-- 9. BILLING & KASIR KONSOLIDASI
CREATE TABLE trx_billing (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pendaftaran_id UUID REFERENCES trx_pendaftaran(id) ON DELETE CASCADE,
    total_tagihan NUMERIC(15,2) DEFAULT 0,
    status_bayar VARCHAR(20) DEFAULT 'BELUM_LUNAS' CHECK (status_bayar IN ('BELUM_LUNAS', 'PARSIAL', 'LUNAS')),
    waktu_terbit TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE trx_billing_detail (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    billing_id UUID REFERENCES trx_billing(id) ON DELETE CASCADE,
    komponen_biaya VARCHAR(100) NOT NULL,
    nominal NUMERIC(15,2) NOT NULL CHECK (nominal >= 0),
    metode_bayar VARCHAR(50)
);

-- 10. SYSTEM AUDIT LOG (IMMUTABLE AUDIT TRAIL)
CREATE TABLE sys_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    action VARCHAR(10) CHECK (action IN ('CREATE', 'READ', 'UPDATE', 'DELETE')),
    table_name VARCHAR(50) NOT NULL,
    record_id VARCHAR(50) NOT NULL,
    old_value JSONB,
    new_value JSONB,
    ip_address VARCHAR(45),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 11. MANAJEMEN RUANGAN & BED (RAWAT INAP)
CREATE TABLE mst_ruangan (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nama_ruangan VARCHAR(100) NOT NULL,
    kelas VARCHAR(20) CHECK (kelas IN ('VVIP', 'VIP', 'KELAS 1', 'KELAS 2', 'KELAS 3')),
    harga_per_malam NUMERIC(15,2) NOT NULL
);

CREATE TABLE mst_bed (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ruangan_id UUID REFERENCES mst_ruangan(id) ON DELETE CASCADE,
    nomor_bed VARCHAR(10) NOT NULL,
    status_bed VARCHAR(20) DEFAULT 'KOSONG' CHECK (status_bed IN ('KOSONG', 'TERISI', 'DIBERSIHKAN', 'RUSAK')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 12. MANAJEMEN SHIFT KERJA
CREATE TABLE mst_shift (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nama_shift VARCHAR(50) NOT NULL,
    jam_mulai TIME NOT NULL,
    jam_selesai TIME NOT NULL
);

CREATE TABLE trx_jadwal_shift (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES mst_users(id) ON DELETE CASCADE,
    shift_id UUID REFERENCES mst_shift(id) ON DELETE RESTRICT,
    tanggal_tugas DATE NOT NULL,
    status_kehadiran VARCHAR(20) DEFAULT 'BELUM_HADIR',
    CONSTRAINT unique_user_tanggal_shift UNIQUE (user_id, tanggal_tugas)
);`
  },
  query: {
    title: "Complex Query: Ringkasan Kunjungan Pasien (Discharge Summary)",
    desc: "Query ini menggunakan agregasi JSON (JSON_AGG) dan LEFT JOIN berganda untuk merangkum seluruh perjalanan layanan pasien (Admission -> Triage -> EMR -> Farmasi -> Billing) dalam 1 baris record output (sangat cepat untuk ditarik oleh API Backend).",
    code: `SELECT 
    p.id AS pendaftaran_id,
    pas.no_rm,
    pas.nama_lengkap,
    pas.jenis_kelamin,
    p.jenis_penjamin,
    p.waktu_daftar,
    
    -- Triase (Suster)
    t.suhu,
    t.tensi_sistolik || '/' || t.tensi_diastolik AS tensi,
    t.ews_score,
    
    -- Rekam Medis (Dokter)
    rm.soap_subjektif,
    rm.soap_objektif,
    rm.soap_asesmen,
    rm.soap_plan,
    rm.icd10_kode,
    rm.is_locked,
    
    -- Resep Obat (Apoteker) - Dijadikan JSON Array (Nested Array di dalam result SQL)
    COALESCE(
        JSON_AGG(
            JSON_BUILD_OBJECT(
                'nama_obat', o.nama_obat, 
                'jumlah', rd.jumlah, 
                'aturan_pakai', rd.aturan_pakai
            )
        ) FILTER (WHERE o.id IS NOT NULL), '[]'
    ) AS daftar_obat,
    
    -- Kasir (Billing)
    b.total_tagihan,
    b.status_bayar

FROM trx_pendaftaran p
JOIN mst_pasien pas ON p.pasien_id = pas.id
LEFT JOIN trx_triase t ON p.id = t.pendaftaran_id
LEFT JOIN trx_rekam_medis rm ON p.id = rm.pendaftaran_id
LEFT JOIN trx_resep_obat ro ON p.id = ro.pendaftaran_id
LEFT JOIN trx_resep_detail rd ON ro.id = rd.resep_id
LEFT JOIN mst_obat o ON rd.obat_id = o.id
LEFT JOIN trx_billing b ON p.id = b.pendaftaran_id

-- Filter berdasarkan satu event kunjungan
WHERE p.id = 'ae71b94e-28v1-4b1s-....' 

GROUP BY 
    p.id, pas.no_rm, pas.nama_lengkap, pas.jenis_kelamin, p.jenis_penjamin, p.waktu_daftar,
    t.suhu, t.tensi_sistolik, t.tensi_diastolik, t.ews_score,
    rm.soap_subjektif, rm.soap_objektif, rm.soap_asesmen, rm.soap_plan, rm.icd10_kode, rm.is_locked,
    b.total_tagihan, b.status_bayar;`
  }
};
