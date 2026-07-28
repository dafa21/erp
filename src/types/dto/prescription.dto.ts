export interface PrescriptionDto {
  id: string | number;
  patient_id?: string | number;
  drug_id?: string | number;
  dosage?: string;
  quantity?: number;
  notes?: string;
  soap_id?: string | number | null;
  created_at?: string;
  drug_name?: string;
  drug_unit?: string;
  [key: string]: any;
}
