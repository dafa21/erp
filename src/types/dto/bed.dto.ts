export interface BedDto {
  id: string | number;
  clinic_id?: string | number;
  room?: string;
  class?: string;
  status?: string;
  [key: string]: any;
}
