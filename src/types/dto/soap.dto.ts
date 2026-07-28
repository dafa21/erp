export interface SoapDto {
  id: string | number;
  patient_id: string | number;
  subjective?: string;
  objective?: string;
  assessment?: string;
  plan?: string;
  diagnosis?: string;
  medication?: string;
  lab_orders?: string;
  radiology_orders?: string;
  lab_results?: string;
  radiology_results?: string;
  followup_recommendations?: string;
  usg_image?: string;
  usg_image_notes?: string;
  doctor_id?: string | number | null;
  duration_minutes?: number | null;
  created_at?: string;
  [key: string]: any;
}
