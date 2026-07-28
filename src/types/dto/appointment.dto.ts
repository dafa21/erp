export interface AppointmentDto {
  id: number | string;
  patient_id?: number | string;
  patient_name?: string;
  clinic_id?: number | string;
  doctor_id?: number | string;
  appointment_date?: string;
  status?: string;
  notes?: string;
  [key: string]: any;
}
