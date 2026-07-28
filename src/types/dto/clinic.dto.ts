export interface ClinicDto {
  id: number | string;
  name: string;
  address?: string;
  phone?: string;
  [key: string]: any;
}
