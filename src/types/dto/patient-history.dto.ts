import { PrescriptionDto } from './prescription.dto';
import { BillingDto } from './billing.dto';
import { LabOrderDto } from './lab-order.dto';
import { LabResultDto } from './lab-result.dto';

export interface PatientHistoryDto {
  soap?: any[];
  vitals?: any[];
  billings?: BillingDto[];
  prescriptions?: PrescriptionDto[];
  anc?: any[];
  lab_orders?: LabOrderDto[];
  lab_results?: LabResultDto[];
  referrals?: any[];
  [key: string]: any;
}
