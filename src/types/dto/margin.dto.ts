export interface MarginDto {
  id: string | number;
  clinic_id?: string | number;
  patient_class: string;
  margin_percentage: number;
  [key: string]: any;
}
