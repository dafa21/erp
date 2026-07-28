import fs from 'fs';

let code = fs.readFileSync('src/App.tsx', 'utf-8');

const startIdx = code.indexOf("{modalType === 'patientHistory' && (");
const endStr = "      </main>\n      </div>";
const endIdx = code.indexOf(endStr, startIdx);

if (startIdx !== -1 && endIdx !== -1) {
  const newCode = code.substring(0, startIdx) + 
`      <PatientHistoryModal
        modalType={modalType}
        setModalType={setModalType}
        historyVisits={historyVisits}
        generatePatientPDF={generatePatientPDF}
        openChildrenModal={openChildrenModal}
        historyVisitFilter={historyVisitFilter}
        setHistoryVisitFilter={setHistoryVisitFilter}
        billingsData={billingsData}
      />\n` + code.substring(endIdx);
  fs.writeFileSync('src/App.tsx', newCode);
  console.log("Successfully replaced");
} else {
  console.log("Could not find boundaries", startIdx, endIdx);
}
