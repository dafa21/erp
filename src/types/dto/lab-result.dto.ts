export interface LabResultDto {
  id: string | number;
  order_id?: string | number;
  parameter_name?: string;
  result_value?: string;
  reference_range?: string;
  unit?: string;
  is_abnormal?: boolean | number;
  created_at?: string;
  [key: string]: any;
}
