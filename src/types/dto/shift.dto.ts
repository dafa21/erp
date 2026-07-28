export interface ShiftDto {
  id: string | number;
  clinic_id?: string | number;
  date: string;
  user: string;
  shift: string;
  [key: string]: any;
}
