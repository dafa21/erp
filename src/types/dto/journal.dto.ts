export interface JournalEntryDto {
  id?: string | number;
  journal_id?: string | number;
  account_id: string | number;
  debit?: number;
  credit?: number;
  account_code?: string;
  account_name?: string;
  [key: string]: any;
}

export interface JournalDto {
  id: string | number;
  clinic_id?: string | number;
  reference?: string;
  date?: string;
  description?: string;
  created_at?: string;
  entries?: JournalEntryDto[];
  [key: string]: any;
}
