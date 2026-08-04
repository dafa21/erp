const fs = require('fs');
const file = 'src/components/modals/ClinicSettingsModals.tsx';
let content = fs.readFileSync(file, 'utf8');

const checkboxUI = 
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">Akses Menu Khusus (Opsional)</label>
                  <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto custom-scrollbar p-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-900/50">
                    {(() => {
                      const allMenus = [
                        { id: 'dashboard', label: 'Live Dashboard' },
                        { id: 'appointments', label: 'Jadwal & Janji Temu' },
                        { id: 'patients', label: 'Pasien Masuk (Triage)' },
                        { id: 'doctorDashboard', label: 'Dashboard Medis' },
                        { id: 'doctorSOAP', label: 'Rekam Medis (SOAP)' },
                        { id: 'anc', label: 'Ibu Hamil (ANC)' },
                        { id: 'children', label: 'Bayi & Anak' },
                        { id: 'lis', label: 'Laboratorium & Rad' },
                        { id: 'billing', label: 'Kasir & Pembayaran' },
                        { id: 'inventory', label: 'Inventory & Apotek' },
                        { id: 'patientDatabase', label: 'Database Pasien' },
                        { id: 'reports', label: 'Laporan Strategis' },
                        { id: 'patientAnalytics', label: 'Analitik & Demografi' },
                        { id: 'clinics', label: 'Manajemen Klinik' },
                        { id: 'attendance', label: 'Riwayat Absensi' },
                        { id: 'map', label: 'Peta Sebaran' },
                        { id: 'queue', label: 'Antrian Layanan' },
                        { id: 'queueTV', label: 'Layar Antrean TV' },
                        { id: 'lpj', label: 'Laporan (LPJ)' },
                        { id: 'accounting', label: 'Akuntansi & Keuangan' },
                        { id: 'adminPanel', label: 'Panel Manajemen' }
                      ];
                      
                      let selected: string[] = [];
                      try {
                        selected = userForm.accessible_menus ? JSON.parse(userForm.accessible_menus) : [];
                      } catch(e) {}
                      if (!Array.isArray(selected)) selected = [];

                      return allMenus.map(m => (
                        <label key={m.id} className="flex items-center gap-2 cursor-pointer p-1.5 hover:bg-white dark:hover:bg-slate-800 rounded transition-colors">
                          <input 
                            type="checkbox" 
                            checked={selected.includes(m.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setUserForm({...userForm, accessible_menus: JSON.stringify([...selected, m.id])});
                              } else {
                                setUserForm({...userForm, accessible_menus: JSON.stringify(selected.filter((s: string) => s !== m.id))});
                              }
                            }}
                            className="w-3.5 h-3.5 text-blue-600 rounded border-slate-300 focus:ring-blue-500" 
                          />
                          <span className="text-[10px] font-medium text-slate-700 dark:text-slate-300">{m.label}</span>
                        </label>
                      ));
                    })()}
                  </div>
                  <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-1">Jika dikosongkan, akses menu akan menyesuaikan dengan Role/Peran secara default.</p>
                </div>
;

content = content.replace(
  /<select value=\{userForm\.status\} onChange=\{e => setUserForm\(\{\.\.\.userForm, status: e\.target\.value\}\)\} className="(.*?)">\s*<option value="Active">Active<\/option>\s*<option value="Inactive">Inactive<\/option>\s*<option value="Suspended">Suspended<\/option>\s*<\/select>\s*<\/div>/,
  $& + '\n' + checkboxUI
);

fs.writeFileSync(file, content, 'utf8');
