export interface BillingItemDto {
  id?: string | number;
  billing_id?: string | number;
  description: string;
  amount: number;
  [key: string]: any;
}

export interface BillingDto {
  id: string | number;
  clinic_id?: string | number;
  patient_id?: string | number | null;
  patient_name: string;
  patient_class?: string;
  total_amount: number;
  payment_method?: string;
  payment_account_id?: string | number | null;
  is_sponsor_covered?: boolean | number;
  status?: string;
  created_at?: string;
  items?: BillingItemDto[];
  [key: string]: any;
}
