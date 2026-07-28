export interface AttendanceDto {
  id: string | number;
  user_id: string | number;
  type: string;
  photo_url?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  distance?: number | null;
  status?: string;
  created_at?: string;
  user_name?: string;
  user_role?: string;
  clinic_name?: string;
  clinic_id?: string | number | null;
  [key: string]: any;
}
