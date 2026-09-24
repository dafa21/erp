import React, { useMemo, useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import { 
  Building2, 
  Users, 
  CreditCard, 
  Stethoscope, 
  Baby, 
  HeartPulse, 
  X, 
  ClipboardList, 
  Layers, 
  Crosshair, 
  MapPin 
} from 'lucide-react';

// Fix leaflet icon issue with Webpack/Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom Modern Pin Icon for Leaflet
const createClinicMarkerIcon = (status: string) => {
  const isActive = status === 'Active';
  const mainColor = isActive ? '#10b981' : '#f43f5e';
  const pulseColor = isActive ? 'rgba(16, 185, 129, 0.35)' : 'rgba(244, 63, 94, 0.35)';

  return L.divIcon({
    className: 'clinic-marker-pin',
    html: `
      <div style="position: relative; width: 38px; height: 38px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
        <span style="position: absolute; width: 36px; height: 36px; border-radius: 9999px; background: ${pulseColor}; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>
        <div style="position: relative; width: 32px; height: 32px; border-radius: 9999px; background: ${mainColor}; border: 2.5px solid #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 21h18"/>
            <path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16"/>
            <path d="M9 10h6"/>
            <path d="M12 7v6"/>
          </svg>
        </div>
      </div>
    `,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
    popupAnchor: [0, -22]
  });
};

export type BasemapId = 'voyager' | 'positron' | 'dark' | 'satellite';

const BASEMAP_CONFIG: Record<BasemapId, {
  name: string;
  url: string;
  attribution: string;
  subdomains: string[];
  maxZoom: number;
}> = {
  voyager: {
    name: 'Standar',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions" target="_blank" rel="noreferrer">CARTO</a>',
    subdomains: ['a', 'b', 'c', 'd'],
    maxZoom: 20
  },
  positron: {
    name: 'Terang',
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions" target="_blank" rel="noreferrer">CARTO</a>',
    subdomains: ['a', 'b', 'c', 'd'],
    maxZoom: 20
  },
  dark: {
    name: 'Gelap',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions" target="_blank" rel="noreferrer">CARTO</a>',
    subdomains: ['a', 'b', 'c', 'd'],
    maxZoom: 20
  },
  satellite: {
    name: 'Satelit',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    subdomains: ['a', 'b', 'c', 'd'],
    maxZoom: 19
  }
};

function MapAutoFitter({ 
  clinics, 
  fitTrigger 
}: { 
  clinics: any[]; 
  fitTrigger: number;
}) {
  const map = useMap();

  useEffect(() => {
    const valid = clinics.filter(c => c.latitude && c.longitude);
    if (valid.length === 1) {
      map.setView([valid[0].latitude, valid[0].longitude], 13);
    } else if (valid.length > 1) {
      const bounds = L.latLngBounds(valid.map(c => [c.latitude, c.longitude]));
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 14 });
    }
  }, [clinics, fitTrigger, map]);

  return null;
}

interface MapClinicsProps {
  clinicsInfo: any[];
  patientsInfo: any[];
  billingsData: any[];
  darkMode?: boolean;
}

export default function MapClinics({ clinicsInfo, patientsInfo, billingsData, darkMode = false }: MapClinicsProps) {
  const [selectedClinic, setSelectedClinic] = useState<any>(null);
  const [activeBasemapId, setActiveBasemapId] = useState<BasemapId>(() => (darkMode ? 'dark' : 'voyager'));
  const [fitTrigger, setFitTrigger] = useState<number>(0);

  // Sync basemap with theme if user is using default theme
  useEffect(() => {
    setActiveBasemapId(prev => {
      if (darkMode && (prev === 'voyager' || prev === 'positron')) return 'dark';
      if (!darkMode && prev === 'dark') return 'voyager';
      return prev;
    });
  }, [darkMode]);

  // Center to Indonesia if no clinics or use first clinic
  const center: [number, number] = clinicsInfo.length > 0 && clinicsInfo[0].latitude 
    ? [clinicsInfo[0].latitude, clinicsInfo[0].longitude]
    : [-6.200000, 106.816666]; // Default to Jakarta

  const clinicsData = useMemo(() => {
    return clinicsInfo.map(clinic => {
      // Find patients actually tied to this clinic
      const clinicPatients = patientsInfo.filter(p => p.clinic_id === clinic.id);
      
      // Calculate revenue from billing mapped to these patients, or by clinic if available
      const revenue = billingsData
         .filter(b => b.clinic_id === clinic.id || clinicPatients.some(p => p.id === b.patient_id))
         .reduce((sum: number, b: any) => sum + (b.total_amount || 0), 0);

      const patientCount = clinicPatients.length;

      return {
        ...clinic,
        patientCount,
        revenue,
        patients: clinicPatients
      };
    });
  }, [clinicsInfo, patientsInfo, billingsData]);

  const activeBasemap = BASEMAP_CONFIG[activeBasemapId] || BASEMAP_CONFIG.voyager;

  return (
    <div className="animate-in fade-in h-full flex flex-col pt-2 w-full relative">
      <header className="flex flex-col md:flex-row md:items-center justify-between mb-4 shrink-0 px-2 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Peta Sebaran Klinik</h1>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                  {clinicsData.length} Cabang Terdata
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Distribusi cabang jaringan klinik dan ringkasan operasional masing-masing cabang.</p>
            </div>
          </div>
        </div>

        {/* Map Toolbar Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Basemap Switcher */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800/90 p-1 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
            <div className="flex items-center gap-1.5 px-2 text-slate-400 dark:text-slate-500 font-bold text-[11px] uppercase tracking-wider">
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Peta:</span>
            </div>
            {(Object.keys(BASEMAP_CONFIG) as BasemapId[]).map((key) => {
              const isActive = activeBasemapId === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActiveBasemapId(key)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {BASEMAP_CONFIG[key].name}
                </button>
              );
            })}
          </div>

          {/* Reset / Fokus Bounds Button */}
          <button
            type="button"
            onClick={() => setFitTrigger(c => c + 1)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all shadow-xs"
            title="Pusatkan dan zoom ke semua lokasi cabang"
          >
            <Crosshair className="w-3.5 h-3.5 text-indigo-500" />
            <span>Fokus Cabang</span>
          </button>
        </div>
      </header>

      <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden relative">
        <MapContainer center={center} zoom={6} className="w-full h-full min-h-[500px]" style={{ zIndex: 0 }}>
          <MapAutoFitter clinics={clinicsData} fitTrigger={fitTrigger} />
          <TileLayer
            key={activeBasemapId}
            url={activeBasemap.url}
            attribution={activeBasemap.attribution}
            subdomains={activeBasemap.subdomains}
            maxZoom={activeBasemap.maxZoom}
          />
          {clinicsData.map(clinic => {
            if (clinic.latitude && clinic.longitude) {
              return (
                <Marker 
                  key={clinic.id} 
                  position={[clinic.latitude, clinic.longitude]}
                  icon={createClinicMarkerIcon(clinic.status)}
                >
                  <Tooltip direction="top" offset={[0, -22]} opacity={0.95}>
                    <div className="font-bold text-xs text-slate-800 py-0.5">
                      {clinic.name}
                    </div>
                  </Tooltip>
                  <Popup className="custom-popup">
                    <div className="p-1 min-w-[220px]">
                      <h3 className="font-bold text-slate-800 text-sm mb-1">{clinic.name}</h3>
                      <p className="text-xs text-slate-500 mb-3 leading-tight">{clinic.address}</p>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between bg-slate-50 p-2 rounded-lg">
                          <div className="flex items-center gap-2 text-indigo-600">
                            <Users className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-bold uppercase">Pasien</span>
                          </div>
                          <span className="font-mono text-xs font-bold text-slate-700">{clinic.patientCount}</span>
                        </div>
                        <div className="flex items-center justify-between bg-slate-50 p-2 rounded-lg">
                          <div className="flex items-center gap-2 text-emerald-600">
                            <CreditCard className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-bold uppercase">Revenue</span>
                          </div>
                          <span className="font-mono text-[10px] font-bold text-slate-700">Rp {clinic.revenue.toLocaleString()}</span>
                        </div>
                      </div>
                      
                      <div className="mt-3 flex items-center justify-between">
                        <span className={`text-[9px] font-bold uppercase px-2 py-1 rounded-full ${clinic.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                          {clinic.status}
                        </span>
                        
                        <button 
                          onClick={() => setSelectedClinic(clinic)}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors font-bold uppercase tracking-wider"
                        >
                          <ClipboardList className="w-3 h-3" /> Database
                        </button>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            }
            return null;
          })}
        </MapContainer>
        
        {/* Detail Overlay */}
        {selectedClinic && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm z-[1000] flex animate-in fade-in duration-200">
             <div className="w-full md:w-3/4 lg:w-2/3 bg-white dark:bg-slate-900 h-full ml-auto shadow-2xl flex flex-col transform transition-transform animate-in slide-in-from-right-8 duration-300">
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950 shrink-0">
                   <div>
                      <h2 className="text-lg font-black text-slate-800 dark:text-white mb-1 flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-indigo-500" />
                        {selectedClinic.name}
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Database Pasien & Detail Medis - {selectedClinic.patients?.length || 0} Pasien</p>
                   </div>
                   <button 
                     onClick={() => setSelectedClinic(null)}
                     className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                   >
                     <X className="w-4 h-4" />
                   </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {(!selectedClinic.patients || selectedClinic.patients.length === 0) ? (
                    <div className="h-40 flex items-center justify-center text-slate-500 text-sm flex-col gap-2">
                       <Users className="w-8 h-8 opacity-20" />
                       <p>Belum ada data pasien di klinik ini.</p>
                    </div>
                  ) : (
                    selectedClinic.patients.map((patient: any) => (
                      <div key={patient.id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-sm hover:shadow transition-shadow">
                         <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 pb-3 border-b border-slate-100 dark:border-slate-700">
                            <div>
                               <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                                  {patient.name}
                                  {patient.is_pregnant === 1 && <span className="bg-pink-100 text-pink-700 text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">Hamil (ANC)</span>}
                               </h3>
                               <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                 RM: {patient.rm_number || patient.id.toString().padStart(6, '0')} • {patient.age} Tahun • {patient.gender === 'P' ? 'Perempuan' : 'Laki-laki'}
                               </p>
                            </div>
                            <div className="text-right">
                               <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${patient.status === 'Selesai' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                 {patient.status}
                               </span>
                            </div>
                         </div>
                         
                         <div className="space-y-4">
                            {/* General Complaint */}
                            <div>
                               <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 text-xs font-bold mb-1 uppercase tracking-wider">
                                  <Stethoscope className="w-3.5 h-3.5 text-indigo-500" />
                                  Keluhan
                               </div>
                               <p className="text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-lg border border-slate-100 dark:border-slate-700">
                                 {patient.complaint || '-'}
                               </p>
                            </div>
                            
                            {/* SOAP Latest */}
                            {patient.soaps && patient.soaps.length > 0 && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                 <div className="bg-indigo-50/50 dark:bg-indigo-900/10 p-3 rounded-xl border border-indigo-100 dark:border-indigo-800/30">
                                    <div className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-1.5">Diagnosis (A)</div>
                                    <p className="text-sm text-slate-800 dark:text-slate-200">{patient.soaps[0].assessment || '-'}</p>
                                 </div>
                                 <div className="bg-emerald-50/50 dark:bg-emerald-900/10 p-3 rounded-xl border border-emerald-100 dark:border-emerald-800/30">
                                    <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-1.5">Tindakan (P)</div>
                                    <p className="text-sm text-slate-800 dark:text-slate-200">{patient.soaps[0].plan || '-'}</p>
                                 </div>
                              </div>
                            )}

                             {/* ANC Details if Pregnant */}
                             {patient.is_pregnant === 1 && (() => {
                               const activeAnc = patient.anc || (patient.anc_records && patient.anc_records.length > 0 ? patient.anc_records[0] : null);
                               if (!activeAnc) return null;
                               return (
                                 <div className="mt-4 bg-pink-50/50 dark:bg-pink-900/10 border border-pink-100 dark:border-pink-800/30 rounded-xl p-3">
                                    <div className="flex items-center gap-1.5 text-pink-600 dark:text-pink-400 text-xs font-bold mb-2 uppercase tracking-wider">
                                       <Baby className="w-3.5 h-3.5" />
                                       Riwayat ANC Terakhir
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                       <div>
                                          <div className="text-[9px] uppercase tracking-widest text-slate-500 mb-0.5">Usia Kehamilan</div>
                                          <div className="text-sm font-bold text-slate-800 dark:text-slate-200">{activeAnc.gestational_age || '-'} Mg</div>
                                       </div>
                                       <div>
                                          <div className="text-[9px] uppercase tracking-widest text-slate-500 mb-0.5">HPHT</div>
                                          <div className="text-sm font-bold text-slate-800 dark:text-slate-200">{activeAnc.hpht || '-'}</div>
                                       </div>
                                       <div>
                                          <div className="text-[9px] uppercase tracking-widest text-slate-500 mb-0.5">HPL</div>
                                          <div className="text-sm font-bold text-slate-800 dark:text-slate-200">{activeAnc.estimated_delivery_date || activeAnc.htp || '-'}</div>
                                       </div>
                                       <div>
                                          <div className="text-[9px] uppercase tracking-widest text-slate-500 mb-0.5">TFU</div>
                                          <div className="text-sm font-bold text-slate-800 dark:text-slate-200">{activeAnc.tfu ? `${activeAnc.tfu} cm` : '-'}</div>
                                       </div>
                                    </div>
                                    {(activeAnc.dj_janin_1 || activeAnc.diagnosis || activeAnc.djj || activeAnc.poedji_rochjati_score) && (
                                       <div className="mt-2 pt-2 border-t border-pink-200/50 dark:border-pink-800/30 text-xs text-slate-700 dark:text-slate-300">
                                          {(activeAnc.dj_janin_1 || activeAnc.djj) && <span className="mr-3"><strong>DJJ:</strong> {activeAnc.dj_janin_1 || activeAnc.djj} bpm</span>}
                                          {activeAnc.poedji_rochjati_score && <span className="mr-3"><strong>Skor Poedji R:</strong> {activeAnc.poedji_rochjati_score}</span>}
                                          {activeAnc.diagnosis && <span><strong>Diag:</strong> {activeAnc.diagnosis}</span>}
                                       </div>
                                    )}
                                    
                                    {/* USG Details (Biometry & Imaging) */}
                                    {(activeAnc.usg_bpd || activeAnc.usg_hc || activeAnc.usg_ac || activeAnc.usg_fl || activeAnc.usg_tbj || activeAnc.usg_afi || activeAnc.usg_placenta || activeAnc.usg_presentation) && (
                                       <div className="mt-3 bg-white/60 dark:bg-slate-900/40 p-2.5 rounded-lg border border-pink-100 dark:border-pink-800/20">
                                          <div className="text-[10px] font-bold text-pink-600 dark:text-pink-400 uppercase tracking-widest mb-1.5 border-b border-pink-100 dark:border-pink-900/30 pb-1 flex items-center gap-1.5">
                                             Hasil USG Ultrasonografi (Biometri)
                                          </div>
                                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                                             <div><span className="text-slate-500">BPD:</span> <span className="font-semibold text-slate-800 dark:text-slate-200">{activeAnc.usg_bpd || '-'} mm</span></div>
                                             <div><span className="text-slate-500">HC:</span> <span className="font-semibold text-slate-800 dark:text-slate-200">{activeAnc.usg_hc || '-'} mm</span></div>
                                             <div><span className="text-slate-500">AC:</span> <span className="font-semibold text-slate-800 dark:text-slate-200">{activeAnc.usg_ac || '-'} mm</span></div>
                                             <div><span className="text-slate-500">FL:</span> <span className="font-semibold text-slate-800 dark:text-slate-200">{activeAnc.usg_fl || '-'} mm</span></div>
                                             <div><span className="text-slate-500">TBJ/EFW:</span> <span className="font-semibold text-slate-800 dark:text-slate-200">{activeAnc.usg_tbj || '-'} g</span></div>
                                             <div><span className="text-slate-500">AFI:</span> <span className="font-semibold text-slate-800 dark:text-slate-200">{activeAnc.usg_afi || '-'}</span></div>
                                             <div className="col-span-2"><span className="text-slate-500">Posisi:</span> <span className="font-semibold text-slate-800 dark:text-slate-200">{activeAnc.usg_presentation || '-'} / Plasenta: {activeAnc.usg_placenta || '-'}</span></div>
                                          </div>
                                          
                                          {/* USG Notes */}
                                          {activeAnc.usg_image_notes && (
                                             <div className="mt-2 text-[11px] text-slate-600 dark:text-slate-450 italic bg-amber-50/40 dark:bg-slate-800/30 p-2 rounded border border-amber-100/30">
                                                <strong>Catatan USG:</strong> {activeAnc.usg_image_notes}
                                             </div>
                                          )}

                                          {/* USG Images */}
                                          {activeAnc.usg_image && (() => {
                                             let images: string[] = [];
                                             try { 
                                               if (activeAnc.usg_image.startsWith('[')) {
                                                 images = JSON.parse(activeAnc.usg_image);
                                               } else {
                                                 images = [activeAnc.usg_image];
                                               }
                                             } catch(e) { 
                                               images = [activeAnc.usg_image]; 
                                             }
                                             
                                             return (
                                                <div className="mt-2.5">
                                                   <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1">Lampiran Foto USG</span>
                                                   <div className="flex flex-wrap gap-2">
                                                      {images.map((imgSrc, idx) => (
                                                         <img key={idx} src={imgSrc} alt="USG Scan" className="h-20 w-auto rounded-lg border border-slate-200 dark:border-slate-700 object-cover shadow-sm transition-all hover:scale-105" />
                                                      ))}
                                                   </div>
                                                </div>
                                             );
                                          })()}
                                       </div>
                                    )}
                                 </div>
                               );
                             })()}
                            
                            {/* Vitals summary if exists */}
                            {patient.vitals && patient.vitals.length > 0 && (
                               <div className="flex items-center gap-4 text-[11px] font-medium text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-700">
                                  <div className="flex items-center gap-1" title="Tekanan Darah">
                                     <HeartPulse className="w-3.5 h-3.5 text-rose-500" />
                                     {patient.vitals[0].blood_pressure || '-'} mmHg
                                  </div>
                                  <div>
                                     Suhu: {patient.vitals[0].temperature || '-'} °C
                                  </div>
                                  <div>
                                     Nadi: {patient.vitals[0].heart_rate || '-'} bpm
                                  </div>
                               </div>
                            )}
                         </div>
                      </div>
                    ))
                  )}
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
