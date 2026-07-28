export interface PatientDto {
  id: number | string;
  rm_number?: string;
  name: string;
  birth_date?: string;
  gender?: string;
  address?: string;
  phone?: string;
  status?: string;
  clinic_id?: number | string;
  [key: string]: any;
}
