import React, { useState, useMemo } from 'react';
import { X, Building2, Shield, Upload, Users, BedDouble, Clock, Wallet, Percent, MessageSquare, Camera, Image as ImageIcon, Trash2, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';

export function ClinicSettingsModals({
  modalType, setModalType,
  editingItem,
  clinicForm, setClinicForm, saveClinic, handleClinicLogoUpload,
  userForm, setUserForm, saveUser, clinicsInfo, usersInfo,
  bedForm, setBedForm, saveBed,
  shiftForm, setShiftForm, saveShift,
  tariffForm, setTariffForm, saveTariff,
  marginForm, setMarginForm, saveMargin,
  whatsappPrompt, setWhatsappPrompt, patientWaPrompt, setPatientWaPrompt, displayedClinicName, currentUser, coa
}: any) {
  const [clinicModalTab, setClinicModalTab] = useState<'info' | 'sponsor' | 'photos' | 'all'>('info');

  const parsedClinicPhotos = useMemo(() => {
    try {
      if (clinicForm.photos) {
        return clinicForm.photos.startsWith('[') ? JSON.parse(clinicForm.photos) : [clinicForm.photos];
      }
    } catch(e) {}
    return [];
  }, [clinicForm.photos]);

  const handlePhotosUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const compressPhoto = (file: File): Promise<string> => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;
            const maxDim = 1280;

            if (width > maxDim || height > maxDim) {
              if (width > height) {
                height = Math.round((height * maxDim) / width);
                width = maxDim;
              } else {
                width = Math.round((width * maxDim) / height);
                height = maxDim;
              }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0, width, height);
              resolve(canvas.toDataURL('image/jpeg', 0.82));
            } else {
              resolve((event.target?.result as string) || '');
            }
          };
          img.onerror = () => resolve((event.target?.result as string) || '');
          img.src = (event.target?.result as string) || '';
        };
        reader.onerror = () => resolve('');
        reader.readAsDataURL(file);
      });
    };

    try {
      const promises: Promise<string>[] = [];
      for (let i = 0; i < files.length; i++) {
        if (files[i].type.startsWith('image/')) {
          promises.push(compressPhoto(files[i]));
        }
      }
      const results = await Promise.all(promises);
      const validPhotos = results.filter((p) => Boolean(p) && p.length > 0);

      let existingPhotos: string[] = [];
      try {
        if (clinicForm.photos) {
          existingPhotos = clinicForm.photos.startsWith('[') ? JSON.parse(clinicForm.photos) : [clinicForm.photos];
        }
      } catch (err) {}

      const combined = [...existingPhotos, ...validPhotos];
      setClinicForm({ ...clinicForm, photos: JSON.stringify(combined) });
    } catch (err) {
      console.error('Error processing clinic photos:', err);
      alert('Gagal memproses beberapa foto.');
    }
    e.target.value = '';
  };

  return (
    <>
      {modalType === 'clinic' as any && (
          <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-3 sm:p-4 z-50 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 transition-all flex flex-col max-h-[92vh]">
              {/* Header */}
              <div className="flex justify-between items-center p-5 sm:p-6 border-b border-indigo-100 dark:border-indigo-900/30 bg-gradient-to-r from-indigo-600 to-indigo-700 dark:from-indigo-900 dark:to-indigo-950 text-white shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
                    <Building2 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-black uppercase tracking-wider text-sm sm:text-base">
                      {editingItem ? 'Edit Infrastructure Protocol' : 'Initialize New Clinic Network'}
                    </h3>
                    <p className="text-[11px] text-indigo-100/80 font-medium">
                      {editingItem ? `Pengaturan & Fasilitas Klinik #${editingItem.id} — ${editingItem.name}` : 'Pendaftaran Unit Klinik Baru ke Jaringan SIMBA'}
                    </p>
                  </div>
                </div>
                <button 
                  type="button" 
                  onClick={() => setModalType('none')} 
                  className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors focus:outline-none"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Tabs Bar */}
              <div className="flex items-center gap-1.5 px-4 sm:px-6 pt-3 pb-2 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/70 shrink-0 overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setClinicModalTab('info')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
                    clinicModalTab === 'info'
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200 dark:shadow-none'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>1. Info & Lokasi</span>
                </button>

                <button
                  type="button"
                  onClick={() => setClinicModalTab('sponsor')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
                    clinicModalTab === 'sponsor'
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200 dark:shadow-none'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>2. Sponsor & Media</span>
                </button>

                <button
                  type="button"
                  onClick={() => setClinicModalTab('photos')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
                    clinicModalTab === 'photos'
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200 dark:shadow-none'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                  }`}
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>3. Foto Fasilitas</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                    clinicModalTab === 'photos' 
                      ? 'bg-white text-indigo-700' 
                      : parsedClinicPhotos.length > 0
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                  }`}>
                    {parsedClinicPhotos.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setClinicModalTab('all')}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ml-auto ${
                    clinicModalTab === 'all'
                      ? 'bg-slate-800 text-white dark:bg-slate-700'
                      : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                  }`}
                >
                  📋 Lihat Semua
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={saveClinic} className="flex flex-col overflow-hidden flex-grow">
                <div className="p-5 sm:p-7 space-y-6 overflow-y-auto custom-scrollbar flex-grow">
                  
                  {/* TAB 1: INFO & LOKASI */}
                  {(clinicModalTab === 'info' || clinicModalTab === 'all') && (
                    <div className="space-y-4">
                      {clinicModalTab === 'all' && (
                        <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800 text-indigo-600 dark:text-indigo-400">
                          <Building2 className="w-4 h-4" />
                          <h4 className="text-xs font-black uppercase tracking-wider">Bagian 1: Identitas & Lokasi Klinik</h4>
                        </div>
                      )}

                      <div>
                        <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-1.5 font-mono">Clinic Designation</label>
                        <input required value={clinicForm.name} onChange={e => setClinicForm({...clinicForm, name: e.target.value})} type="text" className="w-full px-4 py-2.5 border-2 border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-bold bg-slate-50 dark:bg-slate-800 dark:text-white focus:bg-white dark:focus:bg-slate-750 focus:border-indigo-500 focus:outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600" placeholder="Enter clinical label..." />
                      </div>

                      <div>
                        <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-1.5 font-mono">Physical Address Entry</label>
                        <textarea value={clinicForm.address} onChange={e => setClinicForm({...clinicForm, address: e.target.value})} rows={2} className="w-full px-4 py-2.5 border-2 border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-bold bg-slate-50 dark:bg-slate-800 dark:text-white focus:bg-white dark:focus:bg-slate-750 focus:border-indigo-500 focus:outline-none transition-all resize-none placeholder:text-slate-400 dark:placeholder:text-slate-600" placeholder="Clinical physical address..." />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-1.5 font-mono">Latitude Entry</label>
                          <input required value={clinicForm.latitude} onChange={e => setClinicForm({...clinicForm, latitude: e.target.value})} type="number" step="any" className="w-full px-4 py-2.5 border-2 border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-bold bg-slate-50 dark:bg-slate-800 dark:text-white focus:bg-white dark:focus:bg-slate-750 focus:border-indigo-500 focus:outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600" placeholder="e.g. -8.5710031" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-1.5 font-mono">Longitude Entry</label>
                          <input required value={clinicForm.longitude} onChange={e => setClinicForm({...clinicForm, longitude: e.target.value})} type="number" step="any" className="w-full px-4 py-2.5 border-2 border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-bold bg-slate-50 dark:bg-slate-800 dark:text-white focus:bg-white dark:focus:bg-slate-750 focus:border-indigo-500 focus:outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600" placeholder="e.g. 118.6882646" />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-1.5 font-mono">Communication Port (No. Telp)</label>
                          <input value={clinicForm.phone} onChange={e => setClinicForm({...clinicForm, phone: e.target.value})} type="text" className="w-full px-4 py-2.5 border-2 border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-bold bg-slate-50 dark:bg-slate-800 dark:text-white focus:bg-white dark:focus:bg-slate-750 focus:border-indigo-500 focus:outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600" placeholder="e.g. 08123456789" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-1.5 font-mono">Operational Mode</label>
                          <select value={clinicForm.status} onChange={e => setClinicForm({...clinicForm, status: (e.target.value as any)})} className="w-full px-4 py-2.5 border-2 border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-bold bg-slate-50 dark:bg-slate-800 dark:text-white focus:bg-white dark:focus:bg-slate-750 focus:border-indigo-500 focus:outline-none transition-all">
                            <option value="Active">Operational (Aktif)</option>
                            <option value="Inactive">Terminated (Non-aktif)</option>
                          </select>
                        </div>
                      </div>

                      {/* Prominent Quick-Switch Card to Photos */}
                      {clinicModalTab === 'info' && (
                        <div className="pt-2">
                          <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950/40 dark:to-blue-950/40 border border-indigo-100 dark:border-indigo-900/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md">
                                <Camera className="w-5 h-5" />
                              </div>
                              <div>
                                <h4 className="text-xs font-bold text-slate-800 dark:text-white">Foto & Dokumentasi Fasilitas Klinik</h4>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                  {parsedClinicPhotos.length > 0 
                                    ? `Sudah ada ${parsedClinicPhotos.length} foto tersimpan untuk website nurhealthconnection.com`
                                    : 'Belum ada foto yang diunggah. Klik untuk upload beberapa foto sekaligus.'}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 self-end sm:self-center">
                              <button
                                type="button"
                                onClick={() => setClinicModalTab('photos')}
                                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow shrink-0 flex items-center gap-1.5"
                              >
                                <span>Kelola Foto ({parsedClinicPhotos.length})</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setClinicModalTab('sponsor')}
                                className="px-3 py-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold transition-all shrink-0"
                              >
                                Ke Sponsor →
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 2: SPONSOR & MEDIA */}
                  {(clinicModalTab === 'sponsor' || clinicModalTab === 'all') && (
                    <div className="space-y-4">
                      {clinicModalTab === 'all' && (
                        <div className="flex items-center gap-2 pb-2 pt-2 border-b border-slate-200 dark:border-slate-800 text-indigo-600 dark:text-indigo-400">
                          <Shield className="w-4 h-4" />
                          <h4 className="text-xs font-black uppercase tracking-wider">Bagian 2: Sponsor & Media Integrasi</h4>
                        </div>
                      )}

                      <div>
                        <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-2 font-mono">Company / Sponsor Logo</label>
                        <div className="flex flex-wrap items-center gap-3">
                          {(() => {
                              let parsed = [];
                              try {
                                if (clinicForm.sponsor_logo) {
                                    parsed = clinicForm.sponsor_logo.startsWith('[') ? JSON.parse(clinicForm.sponsor_logo) : [clinicForm.sponsor_logo];
                                }
                              } catch(e) {}
                              return parsed.map((lg, idx) => (
                                  <div key={idx} className="relative w-16 h-16 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 overflow-hidden shrink-0 bg-transparent">
                                    <img src={lg} alt="Sponsor Logo" className="w-full h-full object-contain p-1 mix-blend-multiply dark:mix-blend-normal" />
                                    <button type="button" onClick={() => {
                                        const next = [...parsed];
                                        next.splice(idx, 1);
                                        setClinicForm({...clinicForm, sponsor_logo: next.length ? JSON.stringify(next) : ''});
                                    }} className="absolute top-0 right-0 bg-rose-500 text-white rounded-bl-lg p-0.5"><X className="w-3 h-3"/></button>
                                  </div>
                              ));
                          })()}

                          <label className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-white rounded-xl text-xs font-bold cursor-pointer transition-colors border border-slate-200 dark:border-slate-700">
                             <Upload className="w-3.5 h-3.5" /> Upload Sponsor Logo
                             <input type="file" accept="image/*" className="hidden" onChange={handleClinicLogoUpload} />
                          </label>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-1.5 font-mono">Sponsor Name / Company Name</label>
                          <input value={clinicForm.sponsor_name} onChange={e => setClinicForm({...clinicForm, sponsor_name: e.target.value})} type="text" className="w-full px-4 py-2.5 border-2 border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-bold bg-slate-50 dark:bg-slate-800 dark:text-white focus:bg-white dark:focus:bg-slate-750 focus:border-indigo-500 focus:outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600" placeholder="e.g. CIMB Niaga Syariah" />
                        </div>

                        <div>
                          <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-1.5 font-mono">YouTube TV Link / Livestream Link</label>
                          <input value={clinicForm.youtube_link} onChange={e => setClinicForm({...clinicForm, youtube_link: e.target.value})} type="text" className="w-full px-4 py-2.5 border-2 border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-bold bg-slate-50 dark:bg-slate-800 dark:text-white focus:bg-white dark:focus:bg-slate-750 focus:border-indigo-500 focus:outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600" placeholder="https://www.youtube.com/watch?v=..." />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-2 font-mono">Support & Kerjasama Logo</label>
                        <div className="flex flex-wrap items-center gap-3">
                          {(() => {
                              let parsedSupport = [];
                              try {
                                if (clinicForm.support_logo) {
                                    parsedSupport = clinicForm.support_logo.startsWith('[') ? JSON.parse(clinicForm.support_logo) : [clinicForm.support_logo];
                                }
                              } catch(e) {}
                              return parsedSupport.map((lg: string, idx: number) => (
                                  <div key={idx} className="relative w-16 h-16 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 overflow-hidden shrink-0 bg-transparent">
                                    <img src={lg} alt="Support Logo" className="w-full h-full object-contain p-1 mix-blend-multiply dark:mix-blend-normal" />
                                    <button type="button" onClick={() => {
                                        const next = [...parsedSupport];
                                        next.splice(idx, 1);
                                        setClinicForm({...clinicForm, support_logo: next.length ? JSON.stringify(next) : ''});
                                    }} className="absolute top-0 right-0 bg-rose-500 text-white rounded-bl-lg p-0.5"><X className="w-3 h-3"/></button>
                                  </div>
                              ));
                          })()}
                          <label className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-white rounded-xl text-xs font-bold cursor-pointer transition-colors border border-slate-200 dark:border-slate-700">
                             <Upload className="w-3.5 h-3.5" /> Upload Mitra Logo
                             <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  if (file.size > 2 * 1024 * 1024) { 
                                    alert('Ukuran file maksimal 2MB.');
                                    return;
                                  }
                                  const reader = new FileReader();
                                  reader.onloadend = () => {
                                     let existing: any[] = [];
                                     try {
                                         if (clinicForm.support_logo) {
                                             if (clinicForm.support_logo.startsWith('[')) existing = JSON.parse(clinicForm.support_logo);
                                             else existing = [clinicForm.support_logo];
                                         }
                                     } catch(e) {}
                                     existing.push(reader.result);
                                     setClinicForm({ ...clinicForm, support_logo: JSON.stringify(existing) });
                                  };
                                  reader.readAsDataURL(file);
                                }
                             }} />
                          </label>
                        </div>
                      </div>

                      {clinicModalTab === 'sponsor' && (
                        <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-slate-800">
                          <button
                            type="button"
                            onClick={() => setClinicModalTab('info')}
                            className="px-3.5 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center gap-1.5 transition-colors"
                          >
                            <ArrowLeft className="w-3.5 h-3.5" />
                            <span>Kembali ke Info</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setClinicModalTab('photos')}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow flex items-center gap-1.5"
                          >
                            <span>Lanjut ke Foto Fasilitas 📸</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 3: FOTO FASILITAS & DOKUMENTASI KLINIK */}
                  {(clinicModalTab === 'photos' || clinicModalTab === 'all') && (
                    <div className="space-y-4">
                      {clinicModalTab === 'all' && (
                        <div className="flex items-center gap-2 pb-2 pt-2 border-b border-slate-200 dark:border-slate-800 text-indigo-600 dark:text-indigo-400">
                          <Camera className="w-4 h-4" />
                          <h4 className="text-xs font-black uppercase tracking-wider">Bagian 3: Foto Fasilitas & Dokumentasi Klinik</h4>
                        </div>
                      )}

                      {/* Photo Section Banner & Info */}
                      <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                            <Camera className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">
                              Galeri Dokumentasi Fasilitas Klinik
                            </h4>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                              Foto-foto ini otomatis tampil di peta sebaran & kartu detail website <strong className="text-indigo-600 dark:text-indigo-400">nurhealthconnection.com</strong>.
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-indigo-700 dark:text-indigo-300 bg-white dark:bg-slate-800 px-3 py-1 rounded-xl border border-indigo-200 dark:border-indigo-800 shadow-xs">
                            {parsedClinicPhotos.length} Foto Tersimpan
                          </span>
                          {parsedClinicPhotos.length > 0 && (
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm('Apakah Anda yakin ingin menghapus semua foto klinik ini?')) {
                                  setClinicForm({ ...clinicForm, photos: '' });
                                }
                              }}
                              className="px-2.5 py-1 text-[11px] font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors flex items-center gap-1"
                              title="Hapus Semua Foto"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Hapus Semua</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Dropzone / Upload Box */}
                      <div>
                        <label className="flex flex-col items-center justify-center p-6 sm:p-8 border-2 border-dashed border-indigo-300 dark:border-indigo-700 hover:border-indigo-500 dark:hover:border-indigo-500 rounded-3xl bg-indigo-50/30 hover:bg-indigo-50/70 dark:bg-indigo-950/10 dark:hover:bg-indigo-950/30 cursor-pointer transition-all group text-center">
                          <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform shadow-xs">
                            <Camera className="w-6 h-6" />
                          </div>
                          <span className="text-xs sm:text-sm font-black text-indigo-700 dark:text-indigo-300 tracking-wide mb-1">
                            + Klik di Sini untuk Memilih & Upload Foto Klinik
                          </span>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 max-w-md">
                            Dapat memilih beberapa foto sekaligus dari galeri atau kamera (JPG, PNG, WEBP). Foto otomatis dikompresi kualitas tinggi agar loading website cepat.
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={handlePhotosUpload}
                          />
                        </label>
                      </div>

                      {/* Photo Gallery Grid */}
                      {parsedClinicPhotos.length === 0 ? (
                        <div className="p-6 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-center bg-slate-50/50 dark:bg-slate-800/20">
                          <ImageIcon className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                          <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Belum ada foto fasilitas klinik yang diunggah</p>
                          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Klik tombol upload di atas untuk menambahkan dokumentasi gedung, ruang periksa, atau fasilitas.</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between px-1">
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                              Preview Galeri Foto ({parsedClinicPhotos.length})
                            </span>
                            <span className="text-[10px] text-slate-400">
                              Klik tombol × merah untuk menghapus foto tertentu
                            </span>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 p-3 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 max-h-72 overflow-y-auto custom-scrollbar">
                            {parsedClinicPhotos.map((photo: string, idx: number) => (
                              <div 
                                key={idx} 
                                className="group relative aspect-video rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 shadow-sm"
                              >
                                <img 
                                  src={photo} 
                                  alt={`Foto Klinik ${idx + 1}`} 
                                  className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105" 
                                />
                                <div className="absolute top-1.5 left-1.5 bg-black/70 backdrop-blur-sm text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
                                  #{idx + 1}
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const next = [...parsedClinicPhotos];
                                    next.splice(idx, 1);
                                    setClinicForm({ ...clinicForm, photos: next.length > 0 ? JSON.stringify(next) : '' });
                                  }}
                                  className="absolute top-1.5 right-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg p-1.5 shadow transition-all opacity-90 hover:opacity-100"
                                  title="Hapus Foto Ini"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {clinicModalTab === 'photos' && (
                        <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-slate-800">
                          <button
                            type="button"
                            onClick={() => setClinicModalTab('info')}
                            className="px-3.5 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center gap-1.5 transition-colors"
                          >
                            <ArrowLeft className="w-3.5 h-3.5" />
                            <span>Kembali ke Info Klinik</span>
                          </button>
                          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Siap Disimpan via Synchronize Entry</span>
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                </div>

                {/* Footer Actions */}
                <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      {clinicForm.name || 'Klinik Baru'}
                    </span>
                    <span>•</span>
                    <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                      {parsedClinicPhotos.length} Foto
                    </span>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                    <button 
                      type="button" 
                      onClick={() => setModalType('none')} 
                      className="px-5 py-2.5 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-xs font-black text-slate-500 hover:bg-white dark:hover:bg-slate-800 dark:text-slate-400 uppercase tracking-widest transition-all shadow-sm bg-white dark:bg-slate-800"
                    >
                      Abort
                    </button>
                    <button 
                      type="submit" 
                      className="px-7 py-2.5 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 rounded-xl text-xs font-black text-white uppercase tracking-widest shadow-lg shadow-indigo-200 dark:shadow-none transition-all flex items-center gap-2"
                    >
                      <span>Synchronize Entry</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {whatsappPrompt && whatsappPrompt.show && (
          <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 transition-all p-6 space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <MessageSquare className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Notifikasi WhatsApp Dokter</h3>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Status Pasien: Menunggu Cek Dokter</p>
                  </div>
                </div>
                <button onClick={() => setWhatsappPrompt(null)} className="text-slate-400 dark:text-slate-500 hover:text-slate-600 transition-colors p-1 rounded-lg"><X className="w-4 h-4" /></button>
              </div>

              <div className="bg-slate-50 dark:bg-slate-850/30 p-4 rounded-xl border border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400 dark:text-slate-500 font-medium">Pasien:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{whatsappPrompt.patientName}</span>
                </div>
                {whatsappPrompt.rmNumber && whatsappPrompt.rmNumber !== '-' && (
                  <div className="flex justify-between">
                    <span className="text-slate-400 dark:text-slate-500 font-medium">No. RM:</span>
                    <span className="font-mono text-slate-800 dark:text-slate-200">{whatsappPrompt.rmNumber}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-400 dark:text-slate-500 font-medium">Keluhan:</span>
                  <span className="font-medium text-slate-600 dark:text-slate-400 text-right truncate max-w-[240px]" title={whatsappPrompt.complaint}>{whatsappPrompt.complaint}</span>
                </div>

                {whatsappPrompt.vitals && (
                  <div className="border-t border-slate-200/50 dark:border-slate-800/50 my-2 pt-2 space-y-1">
                    <span className="font-semibold text-slate-400 dark:text-slate-500 block uppercase tracking-wider text-[9px]">Tanda-Tanda Vital:</span>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] text-slate-600 dark:text-slate-400">
                      {whatsappPrompt.vitals.blood_pressure && (
                        <div>TD: <span className="font-mono font-bold text-slate-700 dark:text-slate-350">{whatsappPrompt.vitals.blood_pressure} mmHg</span></div>
                      )}
                      {whatsappPrompt.vitals.temperature && (
                        <div>Suhu: <span className="font-mono font-bold text-slate-700 dark:text-slate-350">{whatsappPrompt.vitals.temperature} °C</span></div>
                      )}
                      {whatsappPrompt.vitals.heart_rate && (
                        <div>Nadi: <span className="font-mono font-bold text-slate-700 dark:text-slate-350">{whatsappPrompt.vitals.heart_rate} bpm</span></div>
                      )}
                      {whatsappPrompt.vitals.respiratory_rate && (
                        <div>Nafas: <span className="font-mono font-bold text-slate-700 dark:text-slate-350">{whatsappPrompt.vitals.respiratory_rate} x/m</span></div>
                      )}
                      {whatsappPrompt.vitals.oxygen_saturation && (
                        <div>SpO2: <span className="font-mono font-bold text-slate-700 dark:text-slate-350">{whatsappPrompt.vitals.oxygen_saturation} %</span></div>
                      )}
                      {(whatsappPrompt.vitals.weight || whatsappPrompt.vitals.height) && (
                        <div>BB/TB: <span className="font-mono font-bold text-slate-700 dark:text-slate-350">{whatsappPrompt.vitals.weight || '-'} kg / {whatsappPrompt.vitals.height || '-'} cm</span></div>
                      )}
                    </div>
                  </div>
                )}

                <div className="border-t border-slate-200/50 dark:border-slate-800/50 my-2 pt-2 space-y-2">
                  <span className="font-semibold text-slate-400 dark:text-slate-500 block uppercase tracking-wider text-[9px]">Pihak Dituju (Penerima):</span>
                  
                  {(() => {
                    const docList = usersInfo.filter((u: any) => u.role === 'Dokter' || u.role === 'Admin');
                    return (
                      <>
                        {!whatsappPrompt.doctorPhone && (
                          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 p-3 rounded-xl text-[10px] leading-relaxed flex items-start gap-2 mb-2">
                            <span className="text-sm">⚠️</span>
                            <div>
                              <span className="font-bold">Belum ada No. WhatsApp terdaftar!</span> Silakan pilih dokter di bawah atau masukkan Nama dan No. WhatsApp secara manual. Anda juga dapat mendaftarkan nomor HP di menu Kelola Pengguna.
                            </div>
                          </div>
                        )}

                        {docList.length > 0 && (
                          <div className="space-y-1">
                            <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">Pilih dari Dokter Terdaftar:</label>
                            <select 
                              className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg text-[11px] bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                              onChange={(e) => {
                                const val = e.target.value;
                                if (val) {
                                  const parsed = JSON.parse(val);
                                  setWhatsappPrompt({
                                    ...whatsappPrompt,
                                    doctorName: parsed.name,
                                    doctorPhone: parsed.phone,
                                    doctorUsername: parsed.username,
                                  });
                                }
                              }}
                              value=""
                            >
                              <option value="">-- Hubungkan dengan Dokter Terdaftar --</option>
                              {docList.map((u: any) => (
                                <option key={u.id} value={JSON.stringify({ name: u.name, phone: u.phone || '', username: u.username || '' })}>
                                  {u.name} {u.phone ? `(${u.phone})` : '(No HP Kosong)'}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <div className="space-y-1">
                            <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">Nama Dokter:</label>
                            <input 
                              required
                              type="text" 
                              value={whatsappPrompt.doctorName}
                              onChange={e => setWhatsappPrompt({ ...whatsappPrompt, doctorName: e.target.value })}
                              className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg text-[11px] bg-white dark:bg-slate-950 text-slate-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                              placeholder="Contoh: dr. Adit"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">No. WhatsApp:</label>
                            <input 
                              required
                              type="text" 
                              value={whatsappPrompt.doctorPhone}
                              onChange={e => setWhatsappPrompt({ ...whatsappPrompt, doctorPhone: e.target.value })}
                              className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg text-[11px] bg-white dark:bg-slate-950 text-slate-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                              placeholder="Contoh: 08123456789"
                            />
                          </div>
                        </div>
                                              </>
                    );
                  })()}
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[9px] text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider">Preview Draft Pesan WA (Sopan & Detil):</span>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-850/50 italic max-h-48 overflow-y-auto whitespace-pre-wrap text-left custom-scrollbar">
                  {(() => {
                    const drName = whatsappPrompt.doctorName || 'Dokter';
                    const patName = whatsappPrompt.patientName;
                    const rmNum = whatsappPrompt.rmNumber && whatsappPrompt.rmNumber !== '-' ? whatsappPrompt.rmNumber : '-';
                    const comp = whatsappPrompt.complaint && whatsappPrompt.complaint !== '-' ? whatsappPrompt.complaint : 'Keluhan umum';
                    
                    const v = whatsappPrompt.vitals;
                    const bp = v?.blood_pressure ? `${v.blood_pressure} mmHg` : '-';
                    const temp = v?.temperature ? `${v.temperature} °C` : '-';
                    const hr = v?.heart_rate ? `${v.heart_rate} x/menit` : '-';
                    const rr = v?.respiratory_rate ? `${v.respiratory_rate} x/menit` : '-';
                    const spo2 = v?.oxygen_saturation ? `${v.oxygen_saturation}%` : '-';
                    const wt = v?.weight ? `${v.weight} kg` : '-';
                    const ht = v?.height ? `${v.height} cm` : '-';
                    
                    const risk = whatsappPrompt.fallRisk || '-';
                    const alg = whatsappPrompt.allergies || '-';

                    const actionLink = whatsappPrompt.doctorUsername 
                      ? `${window.location.origin}/?magic_login=${encodeURIComponent(whatsappPrompt.doctorUsername)}&handle_patient=${whatsappPrompt.patientId}`
                      : '';
                    const linkSection = actionLink 
                      ? `\n\n📌 *Link Penanganan Pasien Langsung:*\n${actionLink}`
                      : '';

                    return `Yth. dr. ${drName},

Mohon izin melaporkan, terdapat pasien baru yang telah terdaftar dengan status *Menunggu Cek Dokter*.

Berikut adalah data screening detail & laporan klinis sementara untuk pemeriksaan:

🏥 *Data Pasien:*
• Nama Pasien: ${patName}
• No. Rekam Medis: ${rmNum}
• Keluhan Utama: ${comp}

📊 *Hasil Skrining Tanda Vital:*
• Tekanan Darah: ${bp}
• Suhu Tubuh: ${temp}
• Denyut Nadi (HR): ${hr}
• Laju Pernapasan (RR): ${rr}
• Saturasi Oksigen (SpO2): ${spo2}
• Berat / Tinggi Badan: ${wt} / ${ht}
• Risiko Jatuh: ${risk}
• Alergi: ${alg}${linkSection}

Mohon perkenan Dokter untuk dapat melakukan pemeriksaan lanjutan terhadap pasien tersebut saat Dokter luang.

Terima kasih banyak atas perhatian, bimbingan, dan kerja sama Dokter. 🙏✨`;
                  })()}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setWhatsappPrompt(null)} 
                  className="w-1/3 py-2.5 border border-slate-100 dark:border-slate-800 rounded-xl font-bold text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 uppercase tracking-widest text-[9px] transition-all"
                >
                  Lewati
                </button>
                <button 
                  type="button" 
                  onClick={() => {
                    const cleanedPhone = whatsappPrompt.doctorPhone.replace(/\D/g, '').replace(/^0/, '62');
                    
                    const drName = whatsappPrompt.doctorName || 'Dokter';
                    const patName = whatsappPrompt.patientName;
                    const rmNum = whatsappPrompt.rmNumber && whatsappPrompt.rmNumber !== '-' ? whatsappPrompt.rmNumber : '-';
                    const comp = whatsappPrompt.complaint && whatsappPrompt.complaint !== '-' ? whatsappPrompt.complaint : 'Keluhan umum';
                    
                    const v = whatsappPrompt.vitals;
                    const bp = v?.blood_pressure ? `${v.blood_pressure} mmHg` : '-';
                    const temp = v?.temperature ? `${v.temperature} °C` : '-';
                    const hr = v?.heart_rate ? `${v.heart_rate} x/menit` : '-';
                    const rr = v?.respiratory_rate ? `${v.respiratory_rate} x/menit` : '-';
                    const spo2 = v?.oxygen_saturation ? `${v.oxygen_saturation}%` : '-';
                    const wt = v?.weight ? `${v.weight} kg` : '-';
                    const ht = v?.height ? `${v.height} cm` : '-';
                    
                    const risk = whatsappPrompt.fallRisk || '-';
                    const alg = whatsappPrompt.allergies || '-';

                    const actionLink = whatsappPrompt.doctorUsername 
                      ? `${window.location.origin}/?magic_login=${encodeURIComponent(whatsappPrompt.doctorUsername)}&handle_patient=${whatsappPrompt.patientId}`
                      : '';
                    const linkSection = actionLink 
                      ? `\n\n📌 *Link Penanganan Pasien Langsung:*\n${actionLink}`
                      : '';

                    const text = `Yth. dr. ${drName},\n\n` +
                      `Mohon izin melaporkan, terdapat pasien baru yang telah terdaftar dengan status *Menunggu Cek Dokter*.\n\n` +
                      `Berikut adalah data screening detail & laporan klinis sementara untuk pemeriksaan:\n\n` +
                      `🏥 *Data Pasien:*\n` +
                      `• Nama Pasien: ${patName}\n` +
                      `• No. Rekam Medis: ${rmNum}\n` +
                      `• Keluhan Utama: ${comp}\n\n` +
                      `📊 *Hasil Skrining Tanda Vital:*\n` +
                      `• Tekanan Darah: ${bp}\n` +
                      `• Suhu Tubuh: ${temp}\n` +
                      `• Denyut Nadi (HR): ${hr}\n` +
                      `• Laju Pernapasan (RR): ${rr}\n` +
                      `• Saturasi Oksigen (SpO2): ${spo2}\n` +
                      `• Berat / Tinggi Badan: ${wt} / ${ht}\n` +
                      `• Risiko Jatuh: ${risk}\n` +
                      `• Alergi: ${alg}${linkSection}\n\n` +
                      `Mohon perkenan Dokter untuk dapat melakukan pemeriksaan lanjutan terhadap pasien tersebut saat Dokter luang.\n\n` +
                      `Terima kasih banyak atas perhatian, bimbingan, dan kerja sama Dokter. 🙏✨`;
                    
                    const url = `https://api.whatsapp.com/send?phone=${cleanedPhone}&text=${encodeURIComponent(text)}`;
                    window.open(url, '_blank');
                    setWhatsappPrompt(null);
                  }} 
                  className="w-2/3 py-2.5 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 rounded-xl font-bold text-white uppercase tracking-widest text-[9px] shadow-lg shadow-emerald-100 dark:shadow-none transition-all flex items-center justify-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5" /> Kirim WhatsApp
                </button>
              </div>
            </div>
          </div>
        )}

        {patientWaPrompt && patientWaPrompt.show && (
          <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 transition-all p-6 space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <MessageSquare className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Notifikasi WhatsApp Pasien</h3>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Pengingat Jadwal Kontrol / Janji Temu</p>
                  </div>
                </div>
                <button onClick={() => setPatientWaPrompt(null)} className="text-slate-400 dark:text-slate-500 hover:text-slate-600 transition-colors p-1 rounded-lg"><X className="w-4 h-4" /></button>
              </div>

              <div className="bg-slate-50 dark:bg-slate-850/30 p-4 rounded-xl border border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400 dark:text-slate-500 font-medium">Nama Pasien:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{patientWaPrompt.patientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 dark:text-slate-500 font-medium">Tanggal Kontrol:</span>
                  <span className="font-medium text-slate-600 dark:text-slate-400">{patientWaPrompt.appointmentDateText}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 dark:text-slate-500 font-medium">Tujuan/Klinik:</span>
                  <span className="font-medium text-slate-600 dark:text-slate-400">{patientWaPrompt.appointmentTitle}</span>
                </div>

                <div className="border-t border-slate-200/50 dark:border-slate-800/50 my-2 pt-2 space-y-2">
                  <span className="font-semibold text-slate-400 dark:text-slate-500 block uppercase tracking-wider text-[9px]">Nomor WhatsApp Pasien:</span>
                  
                  <div className="space-y-1">
                    <input 
                      required
                      type="text" 
                      value={patientWaPrompt.patientPhone}
                      onChange={e => setPatientWaPrompt({ ...patientWaPrompt, patientPhone: e.target.value })}
                      className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg text-[11px] bg-white dark:bg-slate-950 text-slate-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      placeholder="Contoh: 08123456789"
                    />
                    {!patientWaPrompt.patientPhone && (
                       <p className="text-[10px] text-amber-600 dark:text-amber-400">Silakan masukkan nomor WA pasien untuk melanjutkan.</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[9px] text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider">Preview Draft Pesan WA:</span>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-850/50 italic max-h-48 overflow-y-auto whitespace-pre-wrap text-left custom-scrollbar">
                  {(() => {
                    return `Halo kak ${patientWaPrompt.patientName},\n\n` +
                      `Salam sehat dari Klinik ${displayedClinicName}! 👋\n\n` +
                      `Kami ingin mengingatkan bahwa Anda memiliki jadwal kunjungan pada:\n` +
                      `📅 Tanggal: *${patientWaPrompt.appointmentDateText}*\n` +
                      `🩺 Keperluan: *${patientWaPrompt.appointmentTitle}*\n\n` +
                      `Mohon kesediaannya untuk hadir sesuai jadwal agar pemeriksaan berjalan lancar. Jika ada perubahan jadwal atau pertanyaan, silakan hubungi kami kembali di nomor ini.\n\n` +
                      `Terima kasih dan semoga sehat selalu! 🙏✨`;
                  })()}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setPatientWaPrompt(null)} 
                  className="w-1/3 py-2.5 border border-slate-100 dark:border-slate-800 rounded-xl font-bold text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 uppercase tracking-widest text-[9px] transition-all"
                >
                  Batal
                </button>
                <button 
                  type="button" 
                  disabled={!patientWaPrompt.patientPhone}
                  onClick={() => {
                    const cleanedPhone = patientWaPrompt.patientPhone.replace(/\D/g, '').replace(/^0/, '62');
                    
                    const text = `Halo kak ${patientWaPrompt.patientName},\n\n` +
                      `Salam sehat dari Klinik ${displayedClinicName}! 👋\n\n` +
                      `Kami ingin mengingatkan bahwa Anda memiliki jadwal kunjungan pada:\n` +
                      `📅 Tanggal: *${patientWaPrompt.appointmentDateText}*\n` +
                      `🩺 Keperluan: *${patientWaPrompt.appointmentTitle}*\n\n` +
                      `Mohon kesediaannya untuk hadir sesuai jadwal agar pemeriksaan berjalan lancar. Jika ada perubahan jadwal atau pertanyaan, silakan hubungi kami kembali di nomor ini.\n\n` +
                      `Terima kasih dan semoga sehat selalu! 🙏✨`;
                    
                    const url = `https://api.whatsapp.com/send?phone=${cleanedPhone}&text=${encodeURIComponent(text)}`;
                    window.open(url, '_blank');
                    setPatientWaPrompt(null);
                  }} 
                  className={`w-2/3 py-2.5 rounded-xl font-bold uppercase tracking-widest text-[9px] shadow-lg transition-all flex items-center justify-center gap-1.5 ${patientWaPrompt.patientPhone ? 'bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white shadow-emerald-100 dark:shadow-none' : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'}`}
                >
                  <MessageSquare className="w-3.5 h-3.5" /> Kirim WhatsApp
                </button>
              </div>
            </div>
          </div>
        )}

        {modalType === 'user' && (
          <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800 transition-all">
              <div className="flex justify-between items-center p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
                <h3 className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-tight text-sm">{editingItem ? 'Modification Protocol: User' : 'Initialize New Staff Entry'}</h3>
                <button onClick={() => setModalType('none')} className="text-slate-400 dark:text-slate-500 hover:text-slate-600"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={saveUser} className="p-5 space-y-4">
                {currentUser?.role === 'Superadmin' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Assign ke Klinik</label>
                    <select required value={userForm.clinic_id} onChange={e => setUserForm({...userForm, clinic_id: e.target.value})} className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-slate-50 dark:bg-slate-800 dark:text-white focus:bg-white dark:focus:bg-slate-750 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all">
                      <option value="">-- Pilih Klinik --</option>
                      {clinicsInfo.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                )}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 pointer-events-none">Username</label>
                  <input required value={userForm.username} onChange={e => setUserForm({...userForm, username: e.target.value})} type="text" className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-slate-50 dark:bg-slate-800 dark:text-white focus:bg-white dark:focus:bg-slate-750 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600" placeholder="Username login" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 pointer-events-none">Password {editingItem && '(Kosongkan jika tidak merubah)'}</label>
                  <input required={!editingItem} value={userForm.password} onChange={e => setUserForm({...userForm, password: e.target.value})} type="password" className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-slate-50 dark:bg-slate-800 dark:text-white focus:bg-white dark:focus:bg-slate-750 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600" placeholder="••••••••" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 pointer-events-none">Nama Lengkap</label>
                  <input required value={userForm.name} onChange={e => setUserForm({...userForm, name: e.target.value})} type="text" className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-slate-50 dark:bg-slate-800 dark:text-white focus:bg-white dark:focus:bg-slate-750 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600" placeholder="Contoh: Dr. Nama Dokter" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Nomor WhatsApp</label>
                  <input value={userForm.phone} onChange={e => setUserForm({...userForm, phone: e.target.value})} type="text" className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-slate-50 dark:bg-slate-800 dark:text-white focus:bg-white dark:focus:bg-slate-750 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600" placeholder="Contoh: 628123456789 atau 081234..." />
                  <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-1">Digunakan untuk kirim status pasien menunggu secara otomatis.</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 pointer-events-none">Role / Peran</label>
                  <select value={userForm.role} onChange={e => setUserForm({...userForm, role: e.target.value})} className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-slate-50 dark:bg-slate-800 dark:text-white focus:bg-white dark:focus:bg-slate-750 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all">
                    <option value="Superadmin">Superadmin</option>
                    <option value="Admin">Admin</option>
                    <option value="Dokter">Dokter</option>
                    <option value="Suster">Suster</option>
                    <option value="Bidan">Bidan</option>
                    <option value="Apoteker">Apoteker</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 pointer-events-none">Status</label>
                  <select value={userForm.status} onChange={e => setUserForm({...userForm, status: e.target.value})} className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-slate-50 dark:bg-slate-800 dark:text-white focus:bg-white dark:focus:bg-slate-750 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all">
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
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
                <div className="pt-6 flex justify-end gap-3 border-t dark:border-slate-800 mt-4">
                  <button type="button" onClick={() => setModalType('none')} className="px-5 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 dark:text-slate-400 uppercase tracking-widest text-[10px] transition-all">Batal</button>
                  <button type="submit" className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-xl font-bold text-white uppercase tracking-widest text-[10px] shadow-lg shadow-blue-100 dark:shadow-none transition-all">
                    {editingItem ? 'Simpan Perubahan' : 'Register User'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {modalType === 'bed' && (
          <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800 transition-all">
              <div className="flex justify-between items-center p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
                <h3 className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-tight text-sm">{editingItem ? 'Edit Bed Facility' : 'Initialize New Bed Entry'}</h3>
                <button onClick={() => setModalType('none')} className="text-slate-400 dark:text-slate-500 hover:text-slate-600 transition-colors focus:outline-none"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={saveBed} className="p-5 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 pointer-events-none">Kode Bed (ID)</label>
                  <input required value={bedForm.id} onChange={e => setBedForm({...bedForm, id: e.target.value})} type="text" className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 dark:text-white focus:bg-white dark:focus:bg-slate-750 focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase transition-all" placeholder="Contoh: MEL-01" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 pointer-events-none">Nama Ruangan</label>
                  <input required value={bedForm.room} onChange={e => setBedForm({...bedForm, room: e.target.value})} type="text" className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 dark:text-white focus:bg-white dark:focus:bg-slate-750 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" placeholder="Contoh: Ruang Melati" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 pointer-events-none">Kelas</label>
                    <select value={bedForm.class} onChange={e => setBedForm({...bedForm, class: e.target.value})} className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 dark:text-white focus:bg-white dark:focus:bg-slate-750 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all">
                      <option value="VVIP">VVIP</option>
                      <option value="VIP">VIP</option>
                      <option value="Kelas 1">Kelas 1</option>
                      <option value="Kelas 2">Kelas 2</option>
                      <option value="Kelas 3">Kelas 3</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 pointer-events-none">Status</label>
                    <select value={bedForm.status} onChange={e => setBedForm({...bedForm, status: e.target.value})} className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 dark:text-white focus:bg-white dark:focus:bg-slate-750 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all">
                      <option value="KOSONG">KOSONG</option>
                      <option value="TERISI">TERISI</option>
                      <option value="DIBERSIHKAN">DIBERSIHKAN</option>
                      <option value="RUSAK">RUSAK</option>
                    </select>
                  </div>
                </div>
                <div className="pt-4 flex justify-end gap-2">
                  <button type="button" onClick={() => setModalType('none')} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Batal</button>
                  <button type="submit" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 rounded-lg text-sm font-semibold text-white shadow-md shadow-emerald-200 dark:shadow-none transition-all">Simpan Bed</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {modalType === 'shift' && (
          <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800">
              <div className="flex justify-between items-center p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                <h3 className="font-bold text-slate-800 dark:text-white uppercase tracking-tight text-sm">Shift Management</h3>
                <button onClick={() => setModalType('none')} className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-white transition-colors"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={saveShift} className="p-5 space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1 mb-2">Tanggal Penugasan</label>
                  <input required value={shiftForm.date} onChange={e => setShiftForm({...shiftForm, date: e.target.value})} type="text" className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-xs bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:text-white transition-all shadow-sm" placeholder="Misal: 19 Mei 2026" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1 mb-2">Staff Medis / Pegawai</label>
                  <input required value={shiftForm.user} onChange={e => setShiftForm({...shiftForm, user: e.target.value})} type="text" className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-xs bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:text-white transition-all shadow-sm" placeholder="Pilih / Cari Nakes..." />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1 mb-2">Tipe Shift</label>
                  <select value={shiftForm.shift} onChange={e => setShiftForm({...shiftForm, shift: e.target.value})} className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-xs bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:text-white transition-all shadow-sm">
                    <option value="Pagi (07:00-15:00)">Pagi (07:00-15:00)</option>
                    <option value="Siang (15:00-23:00)">Siang (15:00-23:00)</option>
                    <option value="Malam (23:00-07:00)">Malam (23:00-07:00)</option>
                    <option value="On Call (24 Jam)">On Call (24 Jam)</option>
                  </select>
                </div>
                <div className="pt-4 flex justify-end gap-3">
                  <button type="button" onClick={() => setModalType('none')} className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">Batal</button>
                  <button type="submit" className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-indigo-200 dark:shadow-none transition-all">Atur Shift</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {modalType === 'tariff' && (
          <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800">
              <div className="flex justify-between items-center p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                <h3 className="font-bold text-slate-800 dark:text-white uppercase tracking-tight text-sm">{editingItem ? 'Edit Tarif' : 'Tambah Tarif Baru'}</h3>
                <button onClick={() => setModalType('none')} className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={saveTariff} className="p-5 space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Nama Tindakan</label>
                  <input required value={tariffForm.action_name} onChange={e => setTariffForm({...tariffForm, action_name: e.target.value})} type="text" className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-xs bg-white dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none dark:text-white transition-all shadow-sm" placeholder="Misal: Konsultasi Dokter Umum" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Kelas Pasien</label>
                  <select value={tariffForm.patient_class} onChange={e => setTariffForm({...tariffForm, patient_class: e.target.value})} className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-xs bg-white dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none dark:text-white transition-all shadow-sm">
                    <option value="Reguler">Reguler</option>
                    <option value="Kelas 3">Kelas 3</option>
                    <option value="Kelas 2">Kelas 2</option>
                    <option value="Kelas 1">Kelas 1</option>
                    <option value="VIP">VIP</option>
                    <option value="VVIP">VVIP</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Tarif Dasar (Rp)</label>
                  <input required value={tariffForm.price} onChange={e => setTariffForm({...tariffForm, price: Number(e.target.value)})} type="number" min="0" step="500" className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-xs bg-white dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none dark:text-white transition-all shadow-sm" placeholder="Misal: 50000" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Akun COA Pendapatan</label>
                  <select value={tariffForm.coa_account_id} onChange={e => setTariffForm({...tariffForm, coa_account_id: e.target.value})} className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-xs bg-white dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none dark:text-white transition-all shadow-sm">
                    <option value="">-- Gunakan Default (4.1.1.01 - Pendapatan Tindakan) --</option>
                    {coa.filter(a => a.account_code.startsWith('4') || a.account_type?.toLowerCase().includes('pendapatan')).map(a => (
                      <option key={a.id} value={a.id} disabled={a.level !== 'Child'} className={a.level !== 'Child' ? 'font-bold bg-slate-100 text-slate-500' : 'pl-4 text-slate-800'}>
                        {a.account_code} - {a.account_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="pt-4 flex justify-end gap-3">
                  <button type="button" onClick={() => setModalType('none')} className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">Batal</button>
                  <button type="submit" className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 rounded-xl text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-emerald-100 dark:shadow-none transition-all">Simpan Tarif</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {modalType === 'margin' && (
          <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800">
              <div className="flex justify-between items-center p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                <h3 className="font-bold text-slate-800 dark:text-white uppercase tracking-tight text-sm">{editingItem ? 'Edit Margin' : 'Tambah Margin Kelas'}</h3>
                <button onClick={() => setModalType('none')} className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={saveMargin} className="p-5 space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Kelas Pasien</label>
                  <select required value={marginForm.patient_class} onChange={e => setMarginForm({...marginForm, patient_class: e.target.value})} className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-xs bg-white dark:bg-slate-800 focus:ring-2 focus:ring-purple-500 focus:outline-none dark:text-white transition-all shadow-sm">
                    <option value="Reguler">Reguler</option>
                    <option value="Kelas 3">Kelas 3</option>
                    <option value="Kelas 2">Kelas 2</option>
                    <option value="Kelas 1">Kelas 1</option>
                    <option value="VIP">VIP</option>
                    <option value="VVIP">VVIP</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Persentase Margin (%)</label>
                  <input required value={marginForm.margin_percentage} onChange={e => setMarginForm({...marginForm, margin_percentage: Number(e.target.value)})} type="number" min="0" max="100" className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-xs bg-white dark:bg-slate-800 focus:ring-2 focus:ring-purple-500 focus:outline-none dark:text-white transition-all shadow-sm" placeholder="Misal: 20" />
                </div>
                <div className="pt-4 flex justify-end gap-3">
                  <button type="button" onClick={() => setModalType('none')} className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">Batal</button>
                  <button type="submit" className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 rounded-xl text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-purple-100 dark:shadow-none transition-all">Simpan Margin</button>
                </div>
              </form>
            </div>
          </div>
        )}


    </>
  );
}
