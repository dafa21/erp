import React from 'react';
import { History, Printer, Footprints, X, Receipt, Activity, FileText, Download, TrendingUp, AlertTriangle, Search, Microscope, FlaskConical, Stethoscope, Baby, ImageIcon, Pill, ShieldAlert, AlertCircle } from 'lucide-react';
import { formatIDDateTime } from '../../utils/formatters';

interface PatientHistoryModalProps {
  modalType: string;
  setModalType: (type: string) => void;
  historyVisits: any[];
  generatePatientPDF: () => void;
  openChildrenModal: (patient: any) => void;
  historyVisitFilter: string;
  setHistoryVisitFilter: (filter: string) => void;
  billingsData: any[];
}

export function PatientHistoryModal({
  modalType,
  setModalType,
  historyVisits,
  generatePatientPDF,
  openChildrenModal,
  historyVisitFilter,
  setHistoryVisitFilter,
  billingsData
}: PatientHistoryModalProps) {
  if (modalType !== 'patientHistory') return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-4xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 shrink-0">
          <h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 uppercase tracking-tight text-sm"><History className="w-5 h-5 text-blue-600 dark:text-blue-400" /> Riwayat Kunjungan Pasien</h3>
          <button onClick={() => setModalType('none')} className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-white transition-colors outline-none"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-5 overflow-y-auto flex-grow custom-scrollbar space-y-6">
          {historyVisits.length > 0 && (
            <div className="flex flex-col md:flex-row gap-4 mb-2">
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl flex-grow border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex justify-between items-start mb-1">
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-tight">{historyVisits[0].name}</p>
                  <button onClick={() => generatePatientPDF()} className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all shadow-sm cursor-pointer border-0">
                    <Printer className="w-3.5 h-3.5" /> PDF
                  </button>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mb-2">RM: #{historyVisits[0].rm_number || historyVisits[0].id.toString().padStart(6, '0')}</p>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">{historyVisits[0].gender} • {historyVisits[0].age} Tahun</p>
              </div>
              {historyVisits[0].gender === 'Perempuan' && (
                <div className="flex shrink-0">
                  <button onClick={() => { openChildrenModal(historyVisits[0]); }} className="bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-400 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-indigo-100 dark:hover:bg-indigo-900/50 flex items-center justify-center gap-2 h-full shadow-sm transition-all">
                    <Footprints className="w-5 h-5" /> Data Anak & KMS
                  </button>
                </div>
              )}
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b dark:border-slate-800 pb-3">
            <div className="flex items-center gap-3">
              <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Kronologi Kunjungan</h4>
              {historyVisitFilter === 'all' && historyVisits.length > 1 && (
                <div className="hidden sm:flex items-center gap-1 text-[9px] text-blue-500 font-bold uppercase tracking-wider animate-pulse">
                  <span>(Geser menyamping →)</span>
                </div>
              )}
            </div>
            
            {/* Pill Filters */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 max-w-full">
              <button
                onClick={() => setHistoryVisitFilter('all')}
                className={`text-[9.5px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer whitespace-nowrap ${
                  historyVisitFilter === 'all'
                    ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                Semua ({historyVisits.length})
              </button>
              {historyVisits.map((visit: any, idx: number) => {
                const visitNumber = historyVisits.length - idx;
                const visitIdString = visit.id.toString();
                return (
                  <button
                    key={visit.id}
                    onClick={() => setHistoryVisitFilter(visitIdString)}
                    className={`text-[9.5px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-lg border transition-all shrink-0 cursor-pointer whitespace-nowrap ${
                      historyVisitFilter === visitIdString
                        ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    Visit #{visitNumber}
                  </button>
                );
              })}
            </div>
          </div>

          {historyVisitFilter === 'all' && historyVisits.length > 1 && (
            <div className="sm:hidden -mt-2 flex items-center justify-center gap-1 text-[9px] text-blue-500 font-bold uppercase tracking-wider animate-pulse select-none">
              <span>← Geser menyamping untuk melihat riwayat lainnya →</span>
            </div>
          )}

          <div className={historyVisitFilter === 'all' ? "flex gap-4 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory scroll-smooth custom-scrollbar" : "space-y-4"}>
            {historyVisits
              .filter((v: any) => historyVisitFilter === 'all' || v.id.toString() === historyVisitFilter)
              .map((visit: any, index: number) => (
                <div 
                  key={visit.id} 
                  className={`border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm hover:border-blue-300 dark:hover:border-blue-900/50 transition-all ${
                    historyVisitFilter === 'all' 
                      ? 'w-[290px] sm:w-[500px] md:w-[680px] lg:w-[785px] shrink-0 snap-start' 
                      : 'w-full'
                  }`}
                >
                  <div className="bg-slate-50 dark:bg-slate-800/80 px-4 py-3 flex justify-between items-center border-b border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-2 cursor-default">
                      <span className="bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-400 text-[10px] uppercase font-black px-2 py-0.5 rounded">Visit #{historyVisits.length - historyVisits.findIndex((v: any) => v.id === visit.id)}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">{formatIDDateTime(visit.created_at)}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-2 py-1 rounded">Reg ID: M-{visit.id.toString().padStart(4, '0')}</span>
                </div>
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6 bg-white dark:bg-slate-900">
                  <div>
                    <p className="text-[9px] text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em] font-black mb-2 flex items-center gap-1.5"><AlertCircle className="w-3 h-3" /> Anamnesis / Keluhan Utama</p>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-3 rounded-lg border border-slate-100 dark:border-slate-800/50">{visit.complaint || "Tidak ada catatan anamnesis."}</p>
                    
                    {(visit.allergies || visit.fall_risk !== 'Rendah') && (
                      <div className="mt-3 flex gap-2">
                        {visit.allergies && <span className="text-[10px] text-red-600 font-bold flex items-center gap-1 bg-red-50 px-1.5 py-0.5 rounded border border-red-200"><ShieldAlert className="w-3 h-3" /> {visit.allergies}</span>}
                        {visit.fall_risk !== 'Rendah' && <span className="text-[10px] text-orange-600 font-bold flex items-center gap-1 bg-orange-50 px-1.5 py-0.5 rounded border border-orange-200"><AlertTriangle className="w-3 h-3" /> Risiko: {visit.fall_risk}</span>}
                      </div>
                    )}
                  </div>
                  <div className="space-y-3">
                    <div className="bg-indigo-50/50 dark:bg-indigo-950/10 p-3 rounded-lg border border-indigo-100 dark:border-indigo-900/30 shadow-sm">
                      <p className="text-[9px] text-indigo-400 dark:text-indigo-500 uppercase tracking-[0.15em] font-black mb-3 flex items-center gap-1.5"><Activity className="w-3.5 h-3.5" /> Tanda-Tanda Vital</p>
                      {visit.vitals ? (
                        <div className="text-xs text-slate-700 dark:text-slate-200 space-y-1 mt-2">
                          <p><strong>Tekanan Darah:</strong> {visit.vitals.blood_pressure} mmHg</p>
                          <p><strong>Suhu:</strong> {visit.vitals.temperature} °C</p>
                          <p><strong>Nadi / Napas:</strong> {visit.vitals.heart_rate} /mnt • {visit.vitals.respiratory_rate} /mnt</p>
                          <p><strong>SpO2:</strong> {visit.vitals.oxygen_saturation}%</p>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 dark:text-slate-500 italic mt-2">Belum ada pemeriksaan vital.</p>
                      )}
                    </div>
                    
                    {visit.is_pregnant === 1 && (
                      <div className="bg-pink-50/50 dark:bg-pink-950/10 p-3 rounded-lg border border-pink-100 dark:border-pink-900/30 shadow-sm">
                        <p className="text-[9px] text-pink-500 dark:text-pink-400 uppercase tracking-[0.15em] font-black mb-3 flex items-center gap-1.5"><Baby className="w-3.5 h-3.5" /> Catatan ANC</p>
                        {visit.anc ? (
                          <div className="text-xs text-slate-700 dark:text-slate-200 space-y-1 mt-2">
                            <p><strong>HPHT:</strong> {visit.anc.hpht} | <strong>HPL:</strong> {visit.anc.estimated_delivery_date}</p>
                            <p><strong>Usia Kandungan:</strong> {visit.anc.gestational_age} Mgg</p>
                            <p><strong>TFU:</strong> {visit.anc.tfu || '-'} | <strong>DJJ:</strong> {visit.anc.djj || '-'} x/mnt</p>
                            <div className="my-1 border-y border-pink-100 py-1">
                              <p><strong>Leopold:</strong> L1: {visit.anc.leopold_1 || '-'} • L2: {visit.anc.leopold_2 || '-'} • L3: {visit.anc.leopold_3 || '-'} • L4: {visit.anc.leopold_4 || '-'}</p>
                            </div>
                            <p><strong>Skor Poedji R:</strong> {visit.anc.poedji_rochjati_score || '-'}</p>
                            <p><strong>Catatan/Perkembangan:</strong> {visit.anc.fetal_development}</p>
                            {(visit.anc.usg_bpd || visit.anc.usg_hc || visit.anc.usg_ac || visit.anc.usg_fl || visit.anc.usg_tbj || visit.anc.usg_afi || visit.anc.usg_placenta || visit.anc.usg_presentation) && (
                              <div className="my-2 mt-3 p-2 bg-indigo-50/30 dark:bg-indigo-950/20 rounded border border-indigo-50 dark:border-indigo-900/30">
                                <p className="font-semibold text-[10px] text-indigo-700 dark:text-indigo-400 mb-1">HASIL BIOMETRI USG</p>
                                <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px]">
                                  <p><strong>BPD:</strong> {visit.anc.usg_bpd || '-'} mm</p>
                                  <p><strong>HC:</strong> {visit.anc.usg_hc || '-'} mm</p>
                                  <p><strong>AC:</strong> {visit.anc.usg_ac || '-'} mm</p>
                                  <p><strong>FL:</strong> {visit.anc.usg_fl || '-'} mm</p>
                                  <p><strong>EFW/TBJ:</strong> {visit.anc.usg_tbj || '-'} g</p>
                                  <p><strong>AFI:</strong> {visit.anc.usg_afi || '-'}</p>
                                  <p className="col-span-2"><strong>Plasenta:</strong> {visit.anc.usg_placenta || '-'}</p>
                                  <p className="col-span-2"><strong>Presentasi:</strong> {visit.anc.usg_presentation || '-'}</p>
                                </div>
                              </div>
                            )}
                            {(visit.anc.usg_image || visit.anc.usg_image_notes) && (
                              <div className="mt-3 pt-2 border-t border-pink-100 dark:border-pink-900/30">
                                <strong className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold mb-1 block flex items-center gap-1"><ImageIcon className="w-3 h-3" /> Hasil Pencitraan / USG (ANC)</strong>
                                <div className="bg-indigo-50/50 dark:bg-indigo-950/20 p-2 rounded border border-indigo-100 dark:border-indigo-900/30 text-xs">
                                  {visit.anc.usg_image_notes && <p className="mb-2 italic text-slate-600 dark:text-slate-400">{visit.anc.usg_image_notes}</p>}
                                  {visit.anc.usg_image && (() => {
                                    let images: string[] = [];
                                    try { if (visit.anc.usg_image.startsWith('[')) images = JSON.parse(visit.anc.usg_image); else images = [visit.anc.usg_image]; }
                                    catch(e) { images = [visit.anc.usg_image]; }
                                    return (
                                      <div className="flex flex-wrap gap-2">
                                        {images.map((imgSrc, idx) => (
                                          <img key={idx} src={imgSrc} alt="Lampiran USG" className="h-20 w-auto object-cover rounded-md border border-indigo-200 dark:border-indigo-800 shadow-sm" />
                                        ))}
                                      </div>
                                    );
                                  })()}
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <p className="text-xs text-slate-400 dark:text-slate-500 italic mt-2">Belum ada catatan ANC di kunjungan ini.</p>
                        )}
                      </div>
                    )}

                    <div className="md:col-span-2 bg-indigo-50/30 dark:bg-indigo-950/20 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/30 shadow-sm mt-2">
                      <p className="text-[9px] text-indigo-500 dark:text-indigo-400 uppercase tracking-[0.2em] font-black mb-4 flex items-center gap-2"><Stethoscope className="w-4 h-4"/> Rekam Medis (SOAP)</p>
                      {visit.soap ? (
                         <div className="text-xs text-slate-700 dark:text-slate-200 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                              <div>
                                <strong className="text-[9px] uppercase tracking-widest text-indigo-800 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-900/40 px-2 rounded py-0.5 inline-block mb-2 font-black">Subjektif</strong>
                                <p className="text-xs text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm leading-relaxed">{visit.soap.subjective || '-'}</p>
                              </div>
                              <div>
                                <strong className="text-[9px] uppercase tracking-widest text-indigo-800 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-900/40 px-2 rounded py-0.5 inline-block mb-2 font-black">Objektif</strong>
                                <p className="text-xs text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm leading-relaxed">{visit.soap.objective || '-'}</p>
                              </div>
                            </div>
                            <div className="space-y-3">
                              <div>
                                <strong className="text-[9px] uppercase tracking-widest text-indigo-800 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-900/40 px-2 rounded py-0.5 inline-block mb-2 font-black">Assessment (ICD-10)</strong>
                                <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm mt-1">
                                  {visit.soap.icd10_code ? (
                                    <div className="flex gap-2">
                                      <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{visit.soap.icd10_code}</span>
                                      <span className="text-slate-600 dark:text-slate-400">{visit.soap.assessment}</span>
                                    </div>
                                  ) : (
                                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{visit.soap.assessment || '-'}</p>
                                  )}
                                </div>
                              </div>
                              <div>
                                <strong className="text-[9px] uppercase tracking-widest text-indigo-800 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-900/40 px-2 rounded py-0.5 inline-block mb-2 font-black">Planning (Tindakan/Resep)</strong>
                                <p className="text-xs text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm leading-relaxed">{visit.soap.plan || '-'}</p>
                              </div>
                              {visit.prescriptions && visit.prescriptions.length > 0 && (
                                <div className="mt-3">
                                  <strong className="text-[9px] uppercase tracking-widest text-indigo-800 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-900/40 px-2 rounded py-0.5 inline-block mb-2 font-black flex items-center gap-1"><Pill className="w-3 h-3" /> Resep Obat</strong>
                                  <div className="space-y-1.5">
                                    {visit.prescriptions.map((med: any, midx: number) => (
                                      <div key={midx} className="bg-white dark:bg-slate-900 px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm flex justify-between items-center text-xs">
                                        <div className="flex flex-col">
                                          <span className="font-bold text-slate-700 dark:text-slate-200">{med.drug_name}</span>
                                          <span className="text-[10px] text-slate-500 font-mono mt-0.5">{med.instructions}</span>
                                        </div>
                                        <span className="font-mono font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded">{med.quantity} {med.unit}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {visit.lab_results && visit.lab_results.length > 0 && (
                                <div className="mt-4 pt-3 border-t border-indigo-100 dark:border-indigo-800/30">
                                  <strong className="text-[9px] uppercase tracking-widest text-indigo-800 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-900/40 px-2 rounded py-0.5 inline-block mb-3 font-black flex items-center gap-1"><Microscope className="w-3 h-3" /> Hasil Laboratorium</strong>
                                  {(() => {
                                    const groupedLabs = (visit.lab_results as any[]).reduce((acc: any, lab: any) => {
                                      if (!acc[lab.category]) acc[lab.category] = [];
                                      acc[lab.category].push(lab);
                                      return acc;
                                    }, {});
                                    return Object.entries(groupedLabs).map(([category, results]: [string, any]) => {
                                      let CategoryIcon = FlaskConical;
                                      return (
                                        <div key={category} className="mb-3 last:mb-0 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                                          <div className="px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2">
                                            <CategoryIcon className="w-3.5 h-3.5 text-indigo-500" />
                                            <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest">{category}</span>
                                          </div>
                                          <table className="w-full text-xs">
                                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                              {results.map((r: any) => (
                                                <tr key={r.id} className="border-b border-purple-50 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                                  <td className="px-2 py-1.5 font-medium">{r.parameter_name}</td>
                                                  <td className={`px-2 py-1.5 font-mono font-bold ${r.is_abnormal ? 'text-red-600 dark:text-red-400' : 'text-purple-700 dark:text-purple-300'}`}>{r.result_value} <span className="opacity-70 text-[9px] font-normal">{r.unit}</span></td>
                                                  <td className="px-2 py-1.5 text-slate-500 font-mono">{r.reference_range} {r.unit}</td>
                                                </tr>
                                              ))}
                                            </tbody>
                                          </table>
                                        </div>
                                      );
                                    });
                                  })()}
                                </div>
                              )}
                              {visit.soap.followup_recommendations && (
                                <div className="bg-teal-50 dark:bg-teal-900/20 text-teal-800 dark:text-teal-300 p-2 rounded border border-teal-100 dark:border-teal-900/30 shadow-sm text-[10px]">
                                  <strong>Rekomendasi Dokter:</strong> {visit.soap.followup_recommendations}
                                </div>
                              )}
                            </div>
                         </div>
                      ) : (
                   <p className="text-xs text-slate-400 dark:text-slate-500 italic">Belum ada rekam medis dari dokter di kunjungan ini.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>

    <h4 className="font-bold text-slate-700 dark:text-slate-200 text-sm mb-4 mt-8 border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2"><Receipt className="w-4 h-4 text-emerald-600 dark:text-emerald-400"/> Riwayat Pembayaran Pasien</h4>
    <div className="space-y-4">
      {billingsData.filter((b: any) => historyVisits.length > 0 && b.patient_id === historyVisits[0].id).length > 0 ? (
        <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
          {billingsData.filter((b: any) => historyVisits.length > 0 && b.patient_id === historyVisits[0].id).map((b: any) => (
            <div key={b.id} className="p-4 border-b border-slate-100 dark:border-slate-800 last:border-b-0 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <div>
                   <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{formatIDDateTime(b.created_at)} • {b.patient_class}</p>
                   <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${b.status === 'PAID' ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400' : 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400'}`}>{b.status} • {b.payment_method}</span>
                </div>
                <span className="font-mono text-sm font-bold text-slate-700 dark:text-slate-300">Rp {b.total_amount.toLocaleString('id-ID')}</span>
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400 mt-2 space-y-1 pl-2 border-l-2 border-slate-200 dark:border-slate-800">
                 {b.items?.map((item: any) => (
                   <div key={item.id} className="flex justify-between">
                      <span>{item.description}</span>
                      <span className="font-mono opacity-80">Rp {item.amount.toLocaleString('id-ID')}</span>
                   </div>
                 ))}
              </div>
            </div>
          ))}
          <div className="bg-slate-50 dark:bg-slate-800/80 p-4 flex justify-between items-center border-t border-slate-200 dark:border-slate-800">
             <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Total Pembayaran Pasien:</span>
             <span className="text-base font-black text-emerald-700 dark:text-emerald-400 font-mono">Rp {billingsData.filter((b: any) => historyVisits.length > 0 && b.patient_id === historyVisits[0].id).reduce((sum: number, b: any) => sum + b.total_amount, 0).toLocaleString('id-ID')}</span>
          </div>
        </div>
      ) : (
        <p className="text-xs text-slate-400 dark:text-slate-500 italic bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-center uppercase tracking-widest font-bold">Belum ada riwayat pembayaran yang tercatat.</p>
      )}
    </div>
  </div>
</div>
</div>
  );
}
