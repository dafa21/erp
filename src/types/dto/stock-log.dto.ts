export interface StockLogDto {
  id: string | number;
  clinic_id?: string | number;
  drug_id?: string | number;
  type?: string;
  quantity?: number;
  reference?: string;
  created_at?: string;
  [key: string]: any;
}
