import fs from 'fs';

let code = fs.readFileSync('src/App.tsx', 'utf-8');

const startIdx = code.indexOf("{modalType === 'invoiceDetail' && selectedInvoice && (");
const endStr = "        {modalType === 'patient' && (";
const endIdx = code.indexOf(endStr, startIdx);

if (startIdx !== -1 && endIdx !== -1) {
  let block = code.substring(startIdx, endIdx);
  
  const componentCode = `import React from 'react';
import { X, Receipt, Printer, Edit2, History, AlertCircle, Plus, FileText, Download } from 'lucide-react';
import { formatIDDateTime, formatIDDate } from '../../utils/formatters';

export function BillingModals({
  modalType, setModalType,
  selectedInvoice,
  billingsData, patientsInfo, usersInfo,
  generateInvoicePDF, printInvoiceThermal,
  setEditingItem,
  billingForm, setBillingForm, saveBilling,
  drugsInfo, servicesInfo
}: any) {
  return (
    <>
      ${block}
    </>
  );
}
`;

  fs.writeFileSync('src/components/modals/BillingModals.tsx', componentCode);

  const newAppCode = code.substring(0, startIdx) + 
`        <BillingModals
          modalType={modalType}
          setModalType={setModalType}
          selectedInvoice={selectedInvoice}
          billingsData={billingsData}
          patientsInfo={patientsInfo}
          usersInfo={usersInfo}
          generateInvoicePDF={generateInvoicePDF}
          printInvoiceThermal={printInvoiceThermal}
          setEditingItem={setEditingItem}
          billingForm={billingForm}
          setBillingForm={setBillingForm}
          saveBilling={saveBilling}
          drugsInfo={drugsInfo}
          servicesInfo={servicesInfo}
        />\n` + code.substring(endIdx);

  fs.writeFileSync('src/App.tsx', newAppCode);
  console.log("Successfully replaced BillingModals");
} else {
  console.log("Could not find boundaries", startIdx, endIdx);
}
