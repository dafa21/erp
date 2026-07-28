export interface TariffDto {
  id: string | number;
  clinic_id?: string | number;
  action_name: string;
  patient_class: string;
  price: number;
  coa_account_id?: string | number | null;
  [key: string]: any;
}
