export interface BackupLogDto {
  id: string | number;
  status?: string;
  details?: string;
  created_at?: string;
  [key: string]: any;
}
