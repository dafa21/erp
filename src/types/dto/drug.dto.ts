export interface DrugDto {
  id: number | string;
  clinic_id?: number | string;
  name: string;
  unit?: string;
  stock?: number;
  price?: number;
  purchase_price?: number;
  revenue_coa_id?: number | string | null;
  inventory_coa_id?: number | string | null;
  mfg_date?: string | null;
  exp_date?: string | null;
  [key: string]: any;
}
