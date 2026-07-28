export interface ICD10Item {
  code: string;
  name: string;
  indonesian?: string;
}

export const ICD10_LIST: ICD10Item[] = [
  // Respiratory
  { code: "J06.9", name: "Acute upper respiratory infection, unspecified", indonesian: "ISPA / Infeksi Saluran Pernapasan Akut" },
  { code: "J00", name: "Acute nasopharyngitis [common cold]", indonesian: "Batuk Pilek (Common Cold)" },
  { code: "J02.9", name: "Acute pharyngitis, unspecified", indonesian: "Faringitis Akut / Radang Tenggorokan" },
  { code: "J03.9", name: "Acute tonsillitis, unspecified", indonesian: "Tonsilitis Akut / Radang Amandel" },
  { code: "J20.9", name: "Acute bronchitis, unspecified", indonesian: "Bronkhitis Akut" },
  { code: "J45.909", name: "Unspecified asthma, uncomplicated", indonesian: "Asma Bronkial" },
  { code: "J30.9", name: "Allergic rhinitis, unspecified", indonesian: "Rhinitis Alergi" },
  { code: "J18.9", name: "Pneumonia, unspecified organism", indonesian: "Pneumonia" },
  { code: "A15.0", name: "Tuberculosis of lung, confirmed by sputum microscopy", indonesian: "TBC Paru (BTA Positif)" },
  { code: "R05", name: "Cough", indonesian: "Batuk" },

  // Gastrointestinal
  { code: "K29.7", name: "Gastritis, unspecified", indonesian: "Maag / Gastritis" },
  { code: "K30", name: "Functional dyspepsia", indonesian: "Dispepsia / Nyeri Ulu Hati" },
  { code: "A09", name: "Infectious gastroenteritis and colitis, unspecified", indonesian: "Diare / Gastroentritis Akut (GEA)" },
  { code: "K52.9", name: "Noninfective gastroenteritis and colitis, unspecified", indonesian: "Diare Non-spesifik" },
  { code: "K59.00", name: "Constipation, unspecified", indonesian: "Sembelit / Konstipasi" },
  { code: "K21.9", name: "Gastro-esophageal reflux disease without esophagitis", indonesian: "GERD" },
  { code: "K02.9", name: "Dental caries, unspecified", indonesian: "Karies Gigi / Gigi Berlubang" },
  { code: "K04.01", name: "Reversible pulpitis", indonesian: "Pulpitis Reversibel / Radang Saraf Gigi" },

  // Cardiovascular & Metabolic
  { code: "I10", name: "Essential (primary) hypertension", indonesian: "Hipertensi / Tekanan Darah Tinggi" },
  { code: "E11.9", name: "Type 2 diabetes mellitus without complications", indonesian: "Diabetes Melitus Tipe 2 (Kencing Manis)" },
  { code: "E78.5", name: "Hyperlipidemia, unspecified", indonesian: "Kolesterol Tinggi / Hiperlipidemia" },
  { code: "E79.0", name: "Hyperuricemia without signs of inflammatory arthritis and tophaceous disease", indonesian: "Asam Urat Tinggi / Hiperurisemia" },
  { code: "I95.9", name: "Hypotension, unspecified", indonesian: "Hipotensi / Tekanan Darah Rendah" },

  // Musculoskeletal & Neurology
  { code: "M79.1", name: "Myalgia", indonesian: "Nyeri Otot / Pegal-pegal" },
  { code: "M54.5", name: "Low back pain", indonesian: "Nyeri Punggung Bawah (Nyeri Pinggang)" },
  { code: "R51", name: "Headache", indonesian: "Sakit Kepala / Cephalgia" },
  { code: "G43.909", name: "Migraine, unspecified, not intractable, without status migrainosus", indonesian: "Migrain" },
  { code: "G44.209", name: "Tension-type headache, unspecified", indonesian: "Sakit Kepala Tegang" },
  { code: "H81.10", name: "Benign paroxysmal positional vertigo, unspecified ear", indonesian: "Vertigo" },
  { code: "M25.50", name: "Pain in unspecified joint", indonesian: "Nyeri Sendi (Arthralgia)" },
  { code: "M10.9", name: "Gout, unspecified", indonesian: "Rematik Asam Urat / Gout Arthritis" },
  { code: "M17.9", name: "Osteoarthritis of knee, unspecified", indonesian: "Radang Sendi Lutut / Osteoartritis Spondilosis" },

  // Infectious Diseases
  { code: "A01.00", name: "Typhoid fever, unspecified", indonesian: "Demam Tifoid / Tifus" },
  { code: "A90", name: "Dengue fever [classical dengue]", indonesian: "Demam Dengue (DD)" },
  { code: "A91", name: "Dengue hemorrhagic fever", indonesian: "Demam Berdarah Dengue (DBD)" },
  { code: "B01.9", name: "Varicella without complication", indonesian: "Cacar Air (Varisela)" },
  { code: "B02.9", name: "Zoster without complication", indonesian: "Herpes Zoster / Cacar Ular" },
  { code: "B00.9", name: "Herpesviral infection, unspecified", indonesian: "Herpes Simplex / Gombangen" },
  { code: "R50.9", name: "Fever, unspecified", indonesian: "Febris / Demam" },
  { code: "A06.0", name: "Acute amebic dysentery", indonesian: "Disentri Amuba" },

  // Skin & Allergy
  { code: "L30.9", name: "Dermatitis, unspecified", indonesian: "Eksim / Dermatitis Non-spesifik" },
  { code: "L20.9", name: "Atopic dermatitis, unspecified", indonesian: "Dermatitis Atopik" },
  { code: "L23.9", name: "Allergic contact dermatitis, unspecified cause", indonesian: "Dermatitis Kontak Alergi (DKA)" },
  { code: "L24.9", name: "Irritant contact dermatitis, unspecified cause", indonesian: "Dermatitis Kontak Iritan (DKI)" },
  { code: "L50.9", name: "Urticaria, unspecified", indonesian: "Biduran / Kaligata / Urtikaria" },
  { code: "L03.90", name: "Cellulitis, unspecified", indonesian: "Selulitis / Infeksi Jaringan Kulit" },
  { code: "L02.91", name: "Cutaneous abscess of unspecified site", indonesian: "Abses Kulit / Bisul" },
  { code: "L70.9", name: "Acne, unspecified", indonesian: "Jerawat / Acne Vulgaris" },
  { code: "B35.9", name: "Dermatophytosis, unspecified", indonesian: "Infeksi Jamur Kulit / Tinea" },

  // Genitourinary
  { code: "N39.0", name: "Urinary tract infection, site not specified", indonesian: "ISK / Infeksi Saluran Kemih" },
  { code: "N20.9", name: "Urinary calculus, unspecified", indonesian: "Batu Saluran Kemih" },
  { code: "N18.9", name: "Chronic kidney disease, unspecified", indonesian: "Gagal Ginjal Kronis" },

  // Eyes & Ears
  { code: "H10.9", name: "Conjunctivitis, unspecified", indonesian: "Konjungtivitis / Sakit Mata / Belek" },
  { code: "H15.00", name: "Scleritis, unspecified", indonesian: "Skleritis" },
  { code: "H60.90", name: "Otitis externa, unspecified", indonesian: "Radang Liang Telinga Luar" },
  { code: "H66.90", name: "Otitis media, unspecified", indonesian: "Infeksi Telinga Tengah (Curek)" },

  // Injuries & Others
  { code: "T14.0", name: "Superficial injury of unspecified body region", indonesian: "Lecet / Vulnus Excoriatum" },
  { code: "T14.1", name: "Open wound of unspecified body region", indonesian: "Luka Terbuka / Vulnus Laceratum" },
  { code: "R11.10", name: "Vomiting, unspecified", indonesian: "Muntah" },
  { code: "Z00.00", name: "Encounter for general adult medical examination without abnormal findings", indonesian: "Pemeriksaan Kesehatan Umum / MCU / Surat Sehat" }
];
