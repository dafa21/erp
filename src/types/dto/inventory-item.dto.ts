export interface InventoryItemDto {
  id: string | number;
  clinic_id?: string | number;
  item_code?: string;
  name: string;
  category?: string;
  condition?: string;
  quantity?: number;
  unit?: string;
  location?: string;
  purchase_date?: string;
  purchase_price?: number;
  notes?: string;
  asset_coa_id?: string | number | null;
  expense_coa_id?: string | number | null;
  [key: string]: any;
}
