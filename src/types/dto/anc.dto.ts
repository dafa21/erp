export interface AncDto {
  id: string | number;
  patient_id: string | number;
  gestational_age?: string;
  estimated_delivery_date?: string;
  fetal_development?: string;
  next_checkup_date?: string;
  hpht?: string;
  tfu?: string;
  leopold_1?: string;
  leopold_2?: string;
  leopold_3?: string;
  leopold_4?: string;
  djj?: number;
  poedji_rochjati_score?: number;
  usg_bpd?: string;
  usg_hc?: string;
  usg_ac?: string;
  usg_fl?: string;
  usg_tbj?: string;
  usg_afi?: string;
  usg_placenta?: string;
  usg_presentation?: string;
  usg_image?: string;
  usg_image_notes?: string;
  created_at?: string;
  [key: string]: any;
}
