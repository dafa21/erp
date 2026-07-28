import React from 'react';
import { X, Baby, Plus, Calendar, Activity, Syringe, ClipboardList, Shield, LineChart, BarChart3, Brain, AlertTriangle, CheckCircle, Scale, LayoutDashboard, Footprints, Fingerprint, Sparkles, CalendarClock, CalendarDays, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { ResponsiveContainer, LineChart as RechartsLineChart, CartesianGrid, XAxis, YAxis, Tooltip as RechartsTooltip, Line } from 'recharts';
import ChildStuntingAnalysisModal from '../ChildStuntingAnalysisModal';
import { lazy, Suspense } from 'react';
const ChildGrowthChart = lazy(() => import('../ChildGrowthChart').then(mod => ({ default: mod.ChildGrowthChart })));
import { WHO_WEIGHT_BOYS, WHO_WEIGHT_GIRLS, WHO_HEIGHT_BOYS, WHO_HEIGHT_GIRLS } from '../../data/growthReference';
import { ActionMenu } from '../ActionMenu';

function VitalInputField({ label, unit, icon: Icon, required, type, step, value, onChange }: any) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1 flex items-center gap-1">
        {Icon && <Icon className="w-3 h-3 text-slate-400" />} {label}
      </label>
      <div className="relative">
        <input 
          required={required} 
          type={type} 
          step={step} 
          value={value} 
          onChange={(e) => onChange(e.target.value)} 
          className="w-full pl-3 pr-8 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-slate-50 dark:bg-slate-800/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500" 
        />
        <span className="absolute right-3 top-2 text-xs text-slate-400 font-bold">{unit}</span>
      </div>
    </div>
  );
}

export function ChildrenModals({
  modalType, setModalType,
  editingItem,
  selectedChild, setSelectedChild,
  childForm, setChildForm, saveChild,
  immunizationForm, setImmunizationForm, saveImmunization,
  growthForm, setGrowthForm, saveGrowth,
  darkMode, currentUser, getChildImmunizationStatus, openNewChildModal
}: any) {
  return (
    <>
      {modalType === 'childrenList' && (
          <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-4xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh]">
              <div className="flex justify-between items-center p-4 border-b border-indigo-100 bg-indigo-50 shrink-0">
                <h3 className="font-bold text-indigo-900 flex items-center gap-2"><Footprints className="w-5 h-5 text-indigo-600" /> Data Anak & Bayi Lahir: {editingItem?.name}</h3>
                <button onClick={() => setModalType('none')} className="text-indigo-400 hover:text-indigo-600"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-5 overflow-y-auto flex-grow custom-scrollbar">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-bold text-slate-800 dark:text-slate-100">Daftar Anak / Bayi</h4>
                  <button onClick={openNewChildModal} className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-indigo-700 flex items-center gap-1">
                    <Plus className="w-4 h-4" /> Anak / Bayi Baru
                  </button>
                </div>
                
                {editingItem?.children && editingItem.children.length > 0 ? (
                  <div className="space-y-4">
                    {editingItem.children.map((child: any) => (
                      <div key={child.id} className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-start">
                          <div>
                            <h5 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                              {child.name} 
                              <span className="text-[10px] uppercase tracking-wider bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-2 py-0.5 rounded text-slate-500 dark:text-slate-400">{child.gender}</span>
                            </h5>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Lahir: {child.birth_date} {child.birth_time ? `Pukul ${child.birth_time}` : ''}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">BB: {child.birth_weight} kg • PB: {child.birth_height} cm</p>
                            <div className="flex gap-2 mt-2">
                              {child.apgar_1min && <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200">APGAR 1': {child.apgar_1min}</span>}
                              {child.apgar_5min && <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200">APGAR 5': {child.apgar_5min}</span>}
                            </div>
                            {child.footprint_captured === 1 && (
                              <div className="mt-2 text-[10px] bg-blue-50 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800 inline-flex items-center gap-1">
                                <Fingerprint className="w-3 h-3" /> Cap Jari Kaki Tersimpan
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col gap-2">
                            <ActionMenu 
                              actions={[
                                {
                                  label: "Analisa AI (Stunting & Tumbuh Kembang)",
                                  icon: Sparkles,
                                  onClick: () => { setSelectedChild(child); setModalType('childStuntingAnalysis'); }
                                },
                                {
                                  label: "Grafik Perkembangan",
                                  icon: LineChart,
                                  onClick: () => { setSelectedChild(child); setModalType('childGrowthChart'); }
                                },
                                {
                                  label: "Tambah Imunisasi",
                                  icon: Syringe,
                                  onClick: () => { setSelectedChild(child); setModalType('addImmunization'); }
                                },
                                {
                                  label: "Update KMS / Tumbuh",
                                  icon: Activity,
                                  onClick: () => { setSelectedChild(child); setModalType('addGrowth'); }
                                }
                              ]}
                            />
                          </div>
                        </div>

                        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                          <div>
                            <div className="mb-4">
                              <h6 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1"><CalendarClock className="w-3 h-3" /> Jadwal Imunisasi AI</h6>
                              {(() => {
                                const status = getChildImmunizationStatus(child.birth_date, child.immunizations);
                                return (
                                  <div className="space-y-2">
                                    {status.missed.length > 0 && (
                                      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-2.5">
                                        <p className="text-[10px] font-bold text-red-600 dark:text-red-400 flex items-center gap-1 mb-1.5 uppercase"><AlertTriangle className="w-3 h-3" /> Terlewat / Belum Diberikan</p>
                                        <div className="flex flex-wrap gap-1.5">
                                          {status.missed.map((m, i) => <span key={i} className="text-[9px] bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 px-1.5 py-0.5 rounded font-medium">{m.name}</span>)}
                                        </div>
                                      </div>
                                    )}
                                    {status.upcoming.length > 0 && (
                                      <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5">
                                        <p className="text-[10px] font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1 mb-1.5 uppercase"><CalendarDays className="w-3 h-3" /> Mendatang</p>
                                        <div className="flex flex-wrap gap-1.5 mt-1">
                                          {status.upcoming.slice(0, 5).map((u, i) => <span key={i} className="text-[9px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded font-medium">{u.name} ({u.label})</span>)}
                                          {status.upcoming.length > 5 && <span className="text-[9px] text-slate-400 dark:text-slate-500 font-medium self-center">+{status.upcoming.length - 5} lainnya</span>}
                                        </div>
                                      </div>
                                    )}
                                    {status.missed.length === 0 && status.upcoming.length === 0 && status.completed.length > 0 && (
                                      <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-2.5 flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                                        <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">Semua Imunisasi Terpenuhi</span>
                                      </div>
                                    )}
                                  </div>
                                );
                              })()}
                            </div>

                            <h6 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1"><Syringe className="w-3 h-3" /> Riwayat Imunisasi</h6>
                            {child.immunizations?.length > 0 ? (
                              <ul className="space-y-2">
                                {child.immunizations.map((imm: any) => (
                                  <li key={imm.id} className="text-xs p-2 rounded bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                                    <div className="font-bold text-slate-700 dark:text-slate-200">{imm.vaccine_name}</div>
                                    <div className="text-slate-500 dark:text-slate-400">{imm.date_administered}</div>
                                    {imm.notes && <div className="text-slate-400 dark:text-slate-500 mt-1 italic">{imm.notes}</div>}
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-xs text-slate-400 dark:text-slate-500 italic">Belum ada data imunisasi tersimpan.</p>
                            )}
                          </div>
                          <div>
                            <h6 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1"><LineChart className="w-3 h-3" /> Rekam Tumbuh Kembang (KMS)</h6>
                            {child.growth?.length > 0 ? (
                              <div className="space-y-4">
                                <div className="h-48 w-full bg-slate-50 dark:bg-slate-900 p-2 border border-slate-100 dark:border-slate-800 rounded-lg">
                                  <ResponsiveContainer width="100%" height="100%">
                                    <RechartsLineChart data={child.growth}>
                                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                      <XAxis dataKey="age_months" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748B' }} />
                                      <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748B' }} domain={['dataMin - 1', 'dataMax + 1']} />
                                      <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} labelStyle={{ fontWeight: 'bold', color: '#334155' }} />
                                      <Line yAxisId="left" type="monotone" dataKey="weight" name="Berat (kg)" stroke="#10B981" strokeWidth={2} dot={{ r: 3, fill: '#10B981', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 5 }} />
                                      <Line yAxisId="left" type="monotone" dataKey="height" name="Tinggi (cm)" stroke="#3B82F6" strokeWidth={2} dot={{ r: 3, fill: '#3B82F6', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 5 }} />
                                    </RechartsLineChart>
                                  </ResponsiveContainer>
                                </div>
                                <div className="space-y-2 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                                  {child.growth.map((gr: any) => (
                                    <div key={gr.id} className="text-xs p-2 rounded bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex justify-between items-center">
                                      <div>
                                        <div className="font-bold text-slate-700 dark:text-slate-200">{gr.date_measured} <span className="text-slate-400 dark:text-slate-500 font-normal">({gr.age_months} bln)</span></div>
                                        <div className="text-emerald-700 dark:text-emerald-400 font-medium">BB: {gr.weight} kg • PB: {gr.height} cm {gr.head_circumference ? `• LK: ${gr.head_circumference} cm` : ''}</div>
                                        {gr.notes && <div className="text-slate-400 dark:text-slate-500 mt-1 italic">{gr.notes}</div>}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <p className="text-xs text-slate-400 dark:text-slate-500 italic">Belum ada data tumbuh kembang.</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 border-dashed">
                    <Baby className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Belum ada data anak/bayi untuk pasien ini.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {modalType === 'newChild' && (
          <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh]">
              <div className="flex justify-between items-center p-4 border-b border-indigo-100 bg-indigo-50 shrink-0">
                <h3 className="font-bold text-indigo-900 flex items-center gap-2"><Baby className="w-5 h-5 text-indigo-600" /> Tambah Data Anak / Bayi Lahir</h3>
                <button onClick={() => setModalType('childrenList')} className="text-indigo-400 hover:text-indigo-600"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={saveChild} className="p-5 overflow-y-auto flex-grow custom-scrollbar space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Nama Pasien Anak/Bayi</label>
                  <input required value={childForm.name} onChange={e => setChildForm({...childForm, name: e.target.value})} type="text" className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-slate-50 dark:bg-slate-800/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Nama lengkap..." />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Jenis Kelamin</label>
                    <select value={childForm.gender} onChange={e => setChildForm({...childForm, gender: e.target.value})} className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-slate-50 dark:bg-slate-800/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                      <option>Laki-laki</option>
                      <option>Perempuan</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Tanggal Lahir</label>
                    <input required value={childForm.birth_date} onChange={e => setChildForm({...childForm, birth_date: e.target.value})} type="date" className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-slate-50 dark:bg-slate-800/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Waktu Kelahiran</label>
                    <input value={childForm.birth_time} onChange={e => setChildForm({...childForm, birth_time: e.target.value})} type="time" className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-slate-50 dark:bg-slate-800/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Berat Lahir (kg)</label>
                    <input required value={childForm.birth_weight} onChange={e => setChildForm({...childForm, birth_weight: e.target.value})} type="number" step="0.01" className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-slate-50 dark:bg-slate-800/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Misal: 3.2" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Panjang Lahir (cm)</label>
                    <input required value={childForm.birth_height} onChange={e => setChildForm({...childForm, birth_height: e.target.value})} type="number" step="0.1" className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-slate-50 dark:bg-slate-800/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Misal: 50" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
                  <div className="col-span-2"><p className="text-xs font-bold text-emerald-800 uppercase tracking-widest text-center">APGAR Score</p></div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Menit Ke-1 (0-10)</label>
                    <input value={childForm.apgar_1min} onChange={e => setChildForm({...childForm, apgar_1min: e.target.value})} type="number" min="0" max="10" className="w-full px-3 py-2 border border-emerald-200 rounded-lg text-sm focus:ring-emerald-500" placeholder="Nilai Apgar 1'" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Menit Ke-5 (0-10)</label>
                    <input value={childForm.apgar_5min} onChange={e => setChildForm({...childForm, apgar_5min: e.target.value})} type="number" min="0" max="10" className="w-full px-3 py-2 border border-emerald-200 rounded-lg text-sm focus:ring-emerald-500" placeholder="Nilai Apgar 5'" />
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                  <input type="checkbox" id="footprint" checked={childForm.footprint_captured} onChange={e => setChildForm({...childForm, footprint_captured: e.target.checked})} className="w-4 h-4 text-blue-600 rounded border-slate-300 dark:border-slate-700 focus:ring-blue-500" />
                  <label htmlFor="footprint" className="text-sm font-semibold text-blue-900 cursor-pointer flex items-center gap-2"><Fingerprint className="w-4 h-4" /> Cap Jari Kaki Telah Diambil Digital</label>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                  <button type="button" onClick={() => setModalType('childrenList')} className="px-4 py-2 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 rounded-lg transition-colors">Batal</button>
                  <button type="submit" className="px-4 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors">Simpan Data Anak</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {modalType === 'childStuntingAnalysis' && selectedChild && (
          <Suspense fallback={<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"><Loader2 className="w-8 h-8 animate-spin text-white" /></div>}>
            <ChildStuntingAnalysisModal 
              child={selectedChild} 
              setModalType={setModalType as any} 
              currentUser={currentUser} 
            />
          </Suspense>
        )}

        {modalType === 'addImmunization' && (
          <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-sm shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh]">
              <div className="flex justify-between items-center p-4 border-b border-blue-100 bg-blue-50 shrink-0">
                <h3 className="font-bold text-blue-900 flex items-center gap-2"><Syringe className="w-5 h-5 text-blue-600" /> Catat Imunisasi: {selectedChild?.name}</h3>
                <button onClick={() => setModalType('childrenList')} className="text-blue-400 hover:text-blue-600"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={(e) => { saveImmunization(e); setModalType('childrenList'); }} className="p-5 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Nama Vaksin (Cth: BCG, DPT 1, Polio)</label>
                  <input required value={immunizationForm.vaccine_name} onChange={e => setImmunizationForm({...immunizationForm, vaccine_name: e.target.value})} type="text" className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-slate-50 dark:bg-slate-800/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Tanggal Pemberian</label>
                  <input required value={immunizationForm.date_administered} onChange={e => setImmunizationForm({...immunizationForm, date_administered: e.target.value})} type="date" className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-slate-50 dark:bg-slate-800/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Catatan Tambahan (Opsional)</label>
                  <textarea value={immunizationForm.notes} onChange={e => setImmunizationForm({...immunizationForm, notes: e.target.value})} rows={2} className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-slate-50 dark:bg-slate-800/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                  <button type="button" onClick={() => setModalType('childrenList')} className="px-4 py-2 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 rounded-lg">Kembali</button>
                  <button type="submit" className="px-4 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg">Simpan Imunisasi</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {modalType === 'childGrowthChart' && selectedChild && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="bg-white dark:bg-slate-900 w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="bg-gradient-to-r from-indigo-600 to-blue-500 p-6 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                    <LineChart className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg">Analisa Pertumbuhan: {selectedChild.name}</h3>
                    <p className="text-white/70 text-[10px] uppercase tracking-widest font-bold">Monitor Kurva Pertumbuhan & Perkembangan</p>
                  </div>
                </div>
                <button onClick={() => setModalType('none')} className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-xl transition-all">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-grow custom-scrollbar">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                  {/* Summary Stats */}
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 block mb-1">Status Saat Ini</span>
                      <div className="text-2xl font-black text-slate-800 dark:text-slate-100">{selectedChild.growth?.[selectedChild.growth.length - 1]?.weight || '-'} <span className="text-sm font-medium text-slate-400 dark:text-slate-500">kg</span></div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter">Tinggi</span>
                        <div className="font-bold text-slate-700 dark:text-slate-200">{selectedChild.growth?.[selectedChild.growth.length - 1]?.height || '-'} cm</div>
                      </div>
                      <div>
                        <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter">Lingkar Kepala</span>
                        <div className="font-bold text-slate-700 dark:text-slate-200">{selectedChild.growth?.[selectedChild.growth.length - 1]?.head_circumference || '-'} cm</div>
                      </div>
                    </div>
                  </div>

                  {/* Growth History Table Snippet */}
                  <div className="lg:col-span-2 bg-indigo-50/50 p-5 rounded-2xl border border-indigo-100/50">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-widest">Catatan 3 Bulan Terakhir</h4>
                      <BarChart3 className="w-4 h-4 text-indigo-400" />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                       {selectedChild.growth?.slice(-3).reverse().map((g: any, i: number) => (
                         <div key={i} className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-indigo-100 shadow-sm">
                            <div className="text-[9px] font-bold text-indigo-400 mb-1">{g.age_months} Bln</div>
                            <div className="flex flex-col">
                              <span className="text-xs font-black text-slate-700 dark:text-slate-200">{g.weight} <span className="text-[8px] font-normal text-slate-400 dark:text-slate-500">kg</span></span>
                              <span className="text-[10px] text-slate-400 dark:text-slate-500">{g.height} cm</span>
                            </div>
                         </div>
                       ))}
                       {(!selectedChild.growth || selectedChild.growth.length === 0) && (
                         <div className="col-span-3 py-4 text-center text-[10px] text-slate-400 dark:text-slate-500 font-medium">Belum ada riwayat KMS</div>
                       )}
                    </div>
                  </div>
                </div>

                <Suspense fallback={<div className="p-4 text-center">Memuat Chart...</div>}>
                  <ChildGrowthChart child={selectedChild} darkMode={darkMode as boolean} />
                </Suspense>

                {/* Growth Analysis / Advice */}
                <div className="mt-8">
                  {(() => {
                    const latest = selectedChild.growth?.[selectedChild.growth.length - 1];
                    if (!latest) return null;
                    
                    const ageMonths = latest.age_months;
                    const refHeight = (selectedChild.gender === 'Laki-laki' ? WHO_HEIGHT_BOYS : WHO_HEIGHT_GIRLS).find(r => r.age_months === ageMonths) || 
                                     (selectedChild.gender === 'Laki-laki' ? WHO_HEIGHT_BOYS : WHO_HEIGHT_GIRLS)[(selectedChild.gender === 'Laki-laki' ? WHO_HEIGHT_BOYS : WHO_HEIGHT_GIRLS).length - 1];
                    const refWeight = (selectedChild.gender === 'Laki-laki' ? WHO_WEIGHT_BOYS : WHO_WEIGHT_GIRLS).find(r => r.age_months === ageMonths) || 
                                     (selectedChild.gender === 'Laki-laki' ? WHO_WEIGHT_BOYS : WHO_WEIGHT_GIRLS)[(selectedChild.gender === 'Laki-laki' ? WHO_WEIGHT_BOYS : WHO_WEIGHT_GIRLS).length - 1];

                    const heightStatus = latest.height < refHeight.p3 ? 'STUNTING_RISK' : latest.height < refHeight.p15 ? 'WARNING' : 'NORMAL';
                    const weightStatus = latest.weight < refWeight.p3 ? 'UNDERWEIGHT' : latest.weight < refWeight.p15 ? 'WARNING' : 'NORMAL';

                    const isStuntingRisk = heightStatus === 'STUNTING_RISK';

                    return (
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className={`p-6 rounded-3xl relative overflow-hidden text-white transition-all duration-300 ${isStuntingRisk ? 'bg-rose-600' : 'bg-slate-900'}`}
                      >
                         <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-24 -mt-24 blur-3xl" />
                         <h4 className={`text-xs font-black uppercase tracking-[0.2em] mb-4 flex items-center gap-2 ${isStuntingRisk ? 'text-rose-100' : 'text-indigo-400'}`}>
                           <Brain className="w-4 h-4" /> Analisa Detail & Deteksi Dini Stunting
                         </h4>
                         
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                            <div className="space-y-6">
                              <div>
                                 <h5 className="text-[10px] uppercase font-bold tracking-widest text-white/60 mb-2">Perbandingan Standar WHO (Usia {ageMonths} Bln)</h5>
                                 <div className="space-y-3">
                                   <div className="bg-white/10 p-3 rounded-2xl flex items-center justify-between border border-white/5">
                                      <div>
                                        <div className="text-[10px] font-bold text-white/70">Tinggi Badan (PB/U)</div>
                                        <div className="text-xl font-black">{latest.height} <span className="text-sm font-medium text-white/50">cm</span></div>
                                      </div>
                                      <div className="text-right">
                                        <div className="text-[10px] text-white/50">Standar Median WHO</div>
                                        <div className="text-sm font-bold text-white/80">{refHeight.p50} cm</div>
                                        <div className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full inline-block mt-1 ${
                                          heightStatus === 'STUNTING_RISK' ? 'bg-rose-500/30 text-rose-200' : 
                                          heightStatus === 'WARNING' ? 'bg-amber-500/30 text-amber-200' : 
                                          'bg-emerald-500/30 text-emerald-200'
                                        }`}>
                                          {heightStatus === 'STUNTING_RISK' ? 'Risiko Stunting' : heightStatus === 'WARNING' ? 'Perlu Perhatian' : 'Optimal'}
                                        </div>
                                      </div>
                                   </div>

                                   <div className="bg-white/10 p-3 rounded-2xl flex items-center justify-between border border-white/5">
                                      <div>
                                        <div className="text-[10px] font-bold text-white/70">Berat Badan (BB/U)</div>
                                        <div className="text-xl font-black">{latest.weight} <span className="text-sm font-medium text-white/50">kg</span></div>
                                      </div>
                                      <div className="text-right">
                                        <div className="text-[10px] text-white/50">Standar Median WHO</div>
                                        <div className="text-sm font-bold text-white/80">{refWeight.p50} kg</div>
                                        <div className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full inline-block mt-1 ${
                                          weightStatus === 'UNDERWEIGHT' ? 'bg-rose-500/30 text-rose-200' : 
                                          weightStatus === 'WARNING' ? 'bg-amber-500/30 text-amber-200' : 
                                          'bg-emerald-500/30 text-emerald-200'
                                        }`}>
                                          {weightStatus === 'UNDERWEIGHT' ? 'Berat Kurang' : weightStatus === 'WARNING' ? 'Perlu Perhatian' : 'Optimal'}
                                        </div>
                                      </div>
                                   </div>
                                 </div>
                              </div>
                            </div>
                            
                            <div className="space-y-4 flex flex-col justify-center">
                              {isStuntingRisk ? (
                                <motion.div 
                                  initial={{ opacity: 0, scale: 0.9 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  className="bg-white/10 p-5 rounded-2xl border border-white/20 backdrop-blur-md"
                                >
                                  <div className="flex items-start gap-3">
                                    <AlertTriangle className="w-6 h-6 text-rose-300 shrink-0" />
                                    <div>
                                      <h5 className="text-[12px] font-black uppercase tracking-widest text-rose-200 mb-1">Peringatan: Risiko Stunting</h5>
                                      <p className="text-[11px] text-white/90 leading-relaxed mb-3">
                                        Tinggi badan anak berada di bawah batas persentil 3 kurva WHO (-2 SD). Ini merupakan indikasi adanya potensi gangguan pertumbuhan (stunting).
                                      </p>
                                      <div className="text-[10px] space-y-2 text-white/80 list-disc pl-4 font-medium">
                                        <li>Rujuk ke dokter spesialis anak (Sp.A) untuk evaluasi klinis segera.</li>
                                        <li>Evaluasi kecukupan asupan kalori dan protein hewani (telur, ikan, daging).</li>
                                        <li>Pastikan sanitasi lingkungan dan intervensi pencegahan infeksi berulang.</li>
                                        <li>Pantau ketat kenaikan berat serta tinggi per 2 minggu di puskesmas/klinik.</li>
                                      </div>
                                    </div>
                                  </div>
                                </motion.div>
                              ) : (
                                <motion.div 
                                  initial={{ opacity: 0, scale: 0.9 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  className="bg-white/10 p-5 rounded-2xl border border-white/10 backdrop-blur-md h-full flex flex-col justify-center"
                                >
                                  <h5 className="text-[10px] font-bold uppercase tracking-widest text-indigo-300 mb-3 flex items-center gap-2">
                                     <CheckCircle className="w-4 h-4" /> Evaluasi & Tindak Lanjut
                                  </h5>
                                  {heightStatus === 'WARNING' || weightStatus === 'WARNING' ? (
                                    <ul className="text-[11px] space-y-2 text-white/90 list-disc pl-4 leading-relaxed">
                                      <li>Tren pertumbuhan mendekati garis bawah normal. Tingkatkan frekuensi dan kualitas MPASI dengan tambahan protein hewani.</li>
                                      <li>Pantau ketat di bulan berikutnya untuk mencegah weight-faltering (gagal tumbuh).</li>
                                      <li>Berikan stimulasi sesuai usia dan pastikan suplemen vitamin (contoh: Vitamin A/Zat Besi) tercukupi.</li>
                                    </ul>
                                  ) : (
                                    <ul className="text-[11px] space-y-2 text-white/90 list-disc pl-4 leading-relaxed">
                                      <li>Pertumbuhan anak **sangat optimal** dan sesuai kurva median sehat WHO. Pertahankan rutinitas 1000 HPK!</li>
                                      <li>Teruskan pemberian makan bergizi seimbang (ASI/MPASI yang variatif).</li>
                                      <li>Berikan stimulasi bermain interaktif untuk mematangkan motorik dan kognitif.</li>
                                      <li>Ingat selalu jadwal imunisasi berikutnya agar terhindar dari penyakit menular.</li>
                                    </ul>
                                  )}
                                </motion.div>
                              )}
                            </div>
                         </div>
                      </motion.div>
                    )
                  })()}
                </div>
              </div>

              <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 shrink-0">
                <button 
                  onClick={() => setModalType('none')}
                  className="px-6 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
                >
                  Tutup Analisa
                </button>
                <button 
                  onClick={() => { setModalType('addGrowth'); }}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-200 transition-all"
                >
                  Update Data KMS
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {modalType === 'addGrowth' && (
          <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh]">
              <div className="flex justify-between items-center p-4 border-b border-emerald-100 bg-emerald-50 shrink-0">
                <h3 className="font-bold text-emerald-900 flex items-center gap-2"><LineChart className="w-5 h-5 text-emerald-600" /> Catat KMS: {selectedChild?.name}</h3>
                <button onClick={() => setModalType('childrenList')} className="text-emerald-400 hover:text-emerald-600"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={(e) => { saveGrowth(e); setModalType('childrenList'); }} className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Tanggal Ukur</label>
                    <input required value={growthForm.date_measured} onChange={e => setGrowthForm({...growthForm, date_measured: e.target.value})} type="date" className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-slate-50 dark:bg-slate-800/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Usia Anak (Bulan)</label>
                    <input required value={growthForm.age_months} onChange={e => setGrowthForm({...growthForm, age_months: e.target.value})} type="number" min="0" className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-slate-50 dark:bg-slate-800/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <VitalInputField 
                    label="Berat" 
                    unit="kg" 
                    icon={Scale} 
                    required 
                    type="number" 
                    step="0.1" 
                    value={growthForm.weight} 
                    onChange={(val: any) => setGrowthForm({...growthForm, weight: val})} 
                  />
                  <VitalInputField 
                    label="Tinggi" 
                    unit="cm" 
                    icon={LayoutDashboard} 
                    required 
                    type="number" 
                    step="0.1" 
                    value={growthForm.height} 
                    onChange={(val: any) => setGrowthForm({...growthForm, height: val})} 
                  />
                  <VitalInputField 
                    label="Lk. Kepala" 
                    unit="cm" 
                    icon={Brain} 
                    type="number" 
                    step="0.1" 
                    value={growthForm.head_circumference} 
                    onChange={(val: any) => setGrowthForm({...growthForm, head_circumference: val})} 
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Kondisi / Keluhan (Opsional)</label>
                  <textarea value={growthForm.notes} onChange={e => setGrowthForm({...growthForm, notes: e.target.value})} rows={2} className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-slate-50 dark:bg-slate-800/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                  <button type="button" onClick={() => setModalType('childrenList')} className="px-4 py-2 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 rounded-lg">Batal</button>
                  <button type="submit" className="px-4 py-2 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg">Simpan Data KMS</button>
                </div>
              </form>
            </div>
          </div>
        )}


    </>
  );
}
