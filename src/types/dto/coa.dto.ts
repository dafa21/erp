export interface CoaDto {
  id: string | number;
  clinic_id?: string | number | null;
  account_code: string;
  account_name: string;
  account_type?: string;
  is_head?: boolean | number;
  balance?: number;
  level?: string | number;
  [key: string]: any;
}
