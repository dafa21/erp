export interface LabOrderDto {
  id: string | number;
  clinic_id?: string | number;
  patient_id?: string | number;
  doctor_id?: string | number;
  order_type?: string;
  test_name?: string;
  status?: string;
  notes?: string;
  created_at?: string;
  patient_name?: string;
  rm_number?: string;
  doctor_name?: string;
  [key: string]: any;
}
