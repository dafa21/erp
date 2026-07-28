import fs from 'fs';

let code = fs.readFileSync('src/App.tsx', 'utf-8');

const startIdx = code.indexOf("<AnimatePresence>\n        {modalType === 'patientProfile'");
const endStr = "        </AnimatePresence>\n        {modalType === 'attendanceCamera'";
const endIdx = code.indexOf(endStr, startIdx);

if (startIdx !== -1 && endIdx !== -1) {
  let block = code.substring(startIdx, endIdx + "        </AnimatePresence>\n".length);
  
  const componentCode = `import React from 'react';
import { X, User, CheckCircle, Clock, AlertTriangle, Calendar, Printer, History, Plus, Heart, ImageIcon, FileText, Settings, Stethoscope, ChevronRight, ClipboardList, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatIDDateTime, formatIDDate } from '../../utils/formatters';

export function PatientProfileModal({
  modalType, setModalType,
  editingItem,
  patientProfileTab, setPatientProfileTab,
  patientHistoryData,
  historySearch, setHistorySearch,
  selectedVisit, setSelectedVisit,
  patientsInfo, generatePatientPDF
}: any) {
  return (
    <>
      ${block}
    </>
  );
}
`;

  fs.writeFileSync('src/components/modals/PatientProfileModal.tsx', componentCode);

  const newAppCode = code.substring(0, startIdx) + 
`        <PatientProfileModal
          modalType={modalType}
          setModalType={setModalType}
          editingItem={editingItem}
          patientProfileTab={patientProfileTab}
          setPatientProfileTab={setPatientProfileTab}
          patientHistoryData={patientHistoryData}
          historySearch={historySearch}
          setHistorySearch={setHistorySearch}
          selectedVisit={selectedVisit}
          setSelectedVisit={setSelectedVisit}
          patientsInfo={patientsInfo}
          generatePatientPDF={generatePatientPDF}
        />\n` + code.substring(endIdx + "        </AnimatePresence>\n".length);

  fs.writeFileSync('src/App.tsx', newAppCode);
  console.log("Successfully replaced patient profile modal");
} else {
  console.log("Could not find boundaries", startIdx, endIdx);
}
