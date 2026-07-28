import fs from 'fs';

let code = fs.readFileSync('src/App.tsx', 'utf-8');

const startIdx = code.indexOf("{modalType === 'clinic' as any && (");
const endStr = "        {modalType === 'invoiceDetail' && selectedInvoice && (";
const endIdx = code.indexOf(endStr, startIdx);

if (startIdx !== -1 && endIdx !== -1) {
  let block = code.substring(startIdx, endIdx);
  
  const componentCode = `import React from 'react';
import { X, Building2, Shield, Upload, Users, BedDouble, Clock, Wallet, Percentage } from 'lucide-react';

export function ClinicSettingsModals({
  modalType, setModalType,
  editingItem,
  clinicForm, setClinicForm, saveClinic, handleClinicLogoUpload,
  userForm, setUserForm, saveUser, clinicsInfo,
  bedForm, setBedForm, saveBed,
  shiftForm, setShiftForm, saveShift,
  tariffForm, setTariffForm, saveTariff,
  marginForm, setMarginForm, saveMargin
}: any) {
  return (
    <>
      ${block}
    </>
  );
}
`;

  fs.writeFileSync('src/components/modals/ClinicSettingsModals.tsx', componentCode);

  const newAppCode = code.substring(0, startIdx) + 
`        <ClinicSettingsModals
          modalType={modalType}
          setModalType={setModalType}
          editingItem={editingItem}
          clinicForm={clinicForm}
          setClinicForm={setClinicForm}
          saveClinic={saveClinic}
          handleClinicLogoUpload={handleClinicLogoUpload}
          userForm={userForm}
          setUserForm={setUserForm}
          saveUser={saveUser}
          clinicsInfo={clinicsInfo}
          bedForm={bedForm}
          setBedForm={setBedForm}
          saveBed={saveBed}
          shiftForm={shiftForm}
          setShiftForm={setShiftForm}
          saveShift={saveShift}
          tariffForm={tariffForm}
          setTariffForm={setTariffForm}
          saveTariff={saveTariff}
          marginForm={marginForm}
          setMarginForm={setMarginForm}
          saveMargin={saveMargin}
        />\n` + code.substring(endIdx);

  fs.writeFileSync('src/App.tsx', newAppCode);
  console.log("Successfully replaced ClinicSettingsModals");
} else {
  console.log("Could not find boundaries", startIdx, endIdx);
}
