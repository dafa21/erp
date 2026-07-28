import React, { useState, useMemo } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FileText, Printer, CalendarDays, Search, Building2 } from 'lucide-react';
import { Pagination } from './Pagination';
import { formatIDDate, formatIDDateTime } from '../lib/dateUtils';

interface LpjReportProps {
  clinicsInfo: any[];
  patientsInfo: any[];
  billingsData: any[];
  drugsInfo: any[];
}

export default function LpjReport({ clinicsInfo, patientsInfo, billingsData, drugsInfo }: LpjReportProps) {
  const [selectedClinic, setSelectedClinic] = useState<string>('all');
  const [periodType, setPeriodType] = useState<'daily'|'weekly'|'monthly'>('monthly');
  const [reportDate, setReportDate] = useState(new Date().toISOString().slice(0, 10));
  
  const [tablePages, setTablePages] = useState<Record<string, number>>({});
  const getPage = (key: string) => tablePages[key] || 1;
  const setPage = (key: string, page: number) => setTablePages(prev => ({ ...prev, [key]: page }));

  const filteredData = useMemo(() => {
    let filteredPatients = patientsInfo;
    let filteredBillings = billingsData;

    // Filter by Clinic
    if (selectedClinic !== 'all') {
      filteredPatients = filteredPatients.filter(p => String(p.clinic_id) === String(selectedClinic));
      filteredBillings = filteredBillings.filter(b => String(b.clinic_id) === String(selectedClinic));
    }

    // Filter by Period
    const dateObj = new Date(reportDate);
    const selectedYear = dateObj.getFullYear();
    const selectedMonth = dateObj.getMonth();
    const selectedDate = dateObj.getDate();

    const inRange = (dateString: string) => {
       if (!dateString) return false;
       const d = new Date(dateString);
       if (periodType === 'daily') {
          return d.getFullYear() === selectedYear && d.getMonth() === selectedMonth && d.getDate() === selectedDate;
       } else if (periodType === 'monthly') {
          return d.getFullYear() === selectedYear && d.getMonth() === selectedMonth;
       } else if (periodType === 'weekly') {
          // simple 7 days back from selected date
          const diffTime = Math.abs(dateObj.getTime() - d.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
          return diffDays <= 7 && d <= dateObj;
       }
       return false;
    };

    const patientsInPeriod = filteredPatients.filter(p => inRange(p.created_at));
    const billingsInPeriod = filteredBillings.filter(b => inRange(b.created_at));

    // Calculate metrics
    const totalPatients = patientsInPeriod.length;
    const newPatients = patientsInPeriod.filter(p => !p.medical_record_number || p.medical_record_number.includes('-NEW')).length; // A heuristic or just assume we have logic
    // we don't have accurate 'new patient' flag in standard, so let's see if created_at == report period. Wait, patientsInPeriod are all 'new' to the period? No, patientsInPeriod are those registered in the period.
    // If we want patients visited in period, we should look at billings!
    
    const detailedVisits: any[] = [];
    const allImages: { src: string, label: string }[] = [];

    const genderCount = { L: 0, P: 0 };
    const paymentMethodCount: Record<string, number> = {};
    const serviceCount: Record<string, {name: string, qty: number, total: number}> = {};
    const drugCount: Record<string, {name: string, unit: string, qty: number, total: number}> = {};

    // Total Patients Visited
    const patientsWithVisitsId = new Set<string>();
    billingsInPeriod.forEach(b => patientsWithVisitsId.add(String(b.patient_id)));
    filteredPatients.forEach(p => {
       if (inRange(p.created_at)) patientsWithVisitsId.add(String(p.id));
       if (p.soap && inRange(p.soap.created_at)) patientsWithVisitsId.add(String(p.id));
       if (p.anc && inRange(p.anc.created_at)) patientsWithVisitsId.add(String(p.id));
    });
    
    const uniqueVisitedPatients = Array.from(patientsWithVisitsId);
    const visitedPatientsDetails = uniqueVisitedPatients.map(id => filteredPatients.find(p => String(p.id) === String(id))).filter(Boolean);

    let totalRevenue = 0;
    billingsInPeriod.forEach(b => totalRevenue += (b.total_amount || 0));

    // Diagnoses & Visit Details
    const diagnosisCount: Record<string, number> = {};
    visitedPatientsDetails.forEach((p: any) => {
       if (p.gender === 'Laki-laki' || p.gender === 'L') genderCount.L++;
       else genderCount.P++;
       
       let diag = p.diagnosis || 'Umum';
       let visitDate = inRange(p.created_at) ? formatIDDate(p.created_at) : '';
       
       let vitalsParts = [];
       if (p.vitals) {
          if (p.vitals.blood_pressure) vitalsParts.push(`TD: ${p.vitals.blood_pressure}`);
          if (p.vitals.heart_rate) vitalsParts.push(`HR: ${p.vitals.heart_rate}`);
          if (p.vitals.temperature) vitalsParts.push(`Suhu: ${p.vitals.temperature}°C`);
          if (p.vitals.respiratory_rate) vitalsParts.push(`RR: ${p.vitals.respiratory_rate}`);
          if (p.vitals.oxygen_saturation) vitalsParts.push(`SpO2: ${p.vitals.oxygen_saturation}%`);
          if (p.vitals.weight) vitalsParts.push(`BB: ${p.vitals.weight}kg`);
          if (p.vitals.height) vitalsParts.push(`TB: ${p.vitals.height}cm`);
       }

       const visitInfo: any = { 
           name: p.name, 
           rm: p.rm_number || p.id, 
           age: p.age || '-',
           gender: p.gender === 'Laki-laki' ? 'L' : p.gender === 'Perempuan' ? 'P' : '-',
           date: visitDate, 
           vitals: vitalsParts.length > 0 ? vitalsParts.join(', ') : '-',
           diag: diag, 
           total: 0,
           payment: '-',
           itemsGiven: [],
           usgMetrics: []
       };
       
       const b = billingsInPeriod.find(b => String(b.patient_id) === String(p.id));
       if (b) {
          visitInfo.total = b.total_amount || 0;
          visitInfo.payment = b.payment_method || 'Cash';
          visitInfo.date = visitInfo.date || formatIDDate(b.created_at);
          
          let items = [];
          try { items = typeof b.items === 'string' ? JSON.parse(b.items) : b.items; } catch (e) {}
          if (Array.isArray(items)) {
             items.forEach((item: any) => {
                 const itemName = item.name || item.description || 'Item';
                 const itemQty = item.quantity || 1;
                 visitInfo.itemsGiven.push(`${itemName} (${itemQty})`);
             });
          }
       }

       if (p.soap) {
          diag = p.soap.diagnosis || diag;
          visitInfo.diag = diag;
          if (inRange(p.soap.created_at)) {
             visitInfo.date = visitInfo.date || formatIDDate(p.soap.created_at);
             try {
               let images: string[] = [];
               if (p.soap.usg_image) {
                 if (p.soap.usg_image.startsWith('[')) images = JSON.parse(p.soap.usg_image);
                 else images = [p.soap.usg_image];
                 images.forEach((img: string) => allImages.push({ src: img, label: `${p.name} (SOAP - ${formatIDDate(p.soap.created_at)})` }));
               }
             } catch(e) {}
          }
       }
       if (p.anc) {
          visitInfo.diag = 'Pemeriksaan ANC (Kehamilan)';
          
          if (p.anc.usg_bpd) visitInfo.usgMetrics.push(`BPD: ${p.anc.usg_bpd}`);
          if (p.anc.usg_hc) visitInfo.usgMetrics.push(`HC: ${p.anc.usg_hc}`);
          if (p.anc.usg_ac) visitInfo.usgMetrics.push(`AC: ${p.anc.usg_ac}`);
          if (p.anc.usg_fl) visitInfo.usgMetrics.push(`FL: ${p.anc.usg_fl}`);
          if (p.anc.usg_tbj) visitInfo.usgMetrics.push(`EFW/TBJ: ${p.anc.usg_tbj}`);
          if (p.anc.usg_afi) visitInfo.usgMetrics.push(`AFI: ${p.anc.usg_afi}`);
          if (p.anc.usg_placenta) visitInfo.usgMetrics.push(`Placenta: ${p.anc.usg_placenta}`);
          if (p.anc.usg_presentation) visitInfo.usgMetrics.push(`Posisi: ${p.anc.usg_presentation}`);
          
          if (inRange(p.anc.created_at)) {
             visitInfo.date = visitInfo.date || formatIDDate(p.anc.created_at);
             try {
               let images: string[] = [];
               if (p.anc.usg_image) {
                 if (p.anc.usg_image.startsWith('[')) images = JSON.parse(p.anc.usg_image);
                 else images = [p.anc.usg_image];
                 images.forEach((img: string) => allImages.push({ src: img, label: `${p.name} (ANC - ${formatIDDate(p.anc.created_at)})` }));
               }
             } catch(e) {}
          }
       }

       if (!visitInfo.date) visitInfo.date = formatIDDate(reportDate);
       
       detailedVisits.push(visitInfo);
       diagnosisCount[visitInfo.diag] = (diagnosisCount[visitInfo.diag] || 0) + 1;
    });

    // Drugs & Services Given
    billingsInPeriod.forEach((b: any) => {
      const pm = b.payment_method || 'Cash';
      paymentMethodCount[pm] = (paymentMethodCount[pm] || 0) + 1;

      let items = [];
      try { items = typeof b.items === 'string' ? JSON.parse(b.items) : b.items; } catch (e) {}
      if (Array.isArray(items)) {
         items.forEach((item: any) => {
            const isDrug = item.type === 'drug' || drugsInfo.some(d => String(d.id) === String(item.item_id));
            if (isDrug) {
               const drug = drugsInfo.find(d => String(d.id) === String(item.item_id));
               const name = drug ? drug.name : item.name || item.description;
               const unit = drug ? drug.unit : '';
               if (!drugCount[name]) drugCount[name] = { name, unit, qty: 0, total: 0 };
               drugCount[name].qty += item.quantity || 1;
               drugCount[name].total += (item.amount || 0) * (item.quantity || 1);
            } else {
               const name = item.name || item.description || 'Layanan Umum';
               if (!serviceCount[name]) serviceCount[name] = { name, qty: 0, total: 0 };
               serviceCount[name].qty += item.quantity || 1;
               serviceCount[name].total += (item.amount || 0) * (item.quantity || 1);
            }
         });
      }
    });

    return {
       totalVisited: uniqueVisitedPatients.length,
       totalRevenue,
       patientsRegistered: totalPatients,
       genderCount,
       paymentMethodCount,
       diagnosisCount,
       drugCount,
       serviceCount,
       billingsInPeriod,
       detailedVisits,
       allImages
    };
  }, [selectedClinic, periodType, reportDate, patientsInfo, billingsData, drugsInfo]);

  const generatePDF = () => {
    const doc = new jsPDF('portrait');
    const clinicName = selectedClinic === 'all' ? 'Semua Klinik' : clinicsInfo.find(c => String(c.id) === String(selectedClinic))?.name || '-';
    
    // Header
    doc.setFontSize(16);
    doc.text('Laporan Pertanggungjawaban (LPJ)', 14, 20);
    doc.setFontSize(11);
    doc.text(`Klinik: ${clinicName}`, 14, 28);
    let periodText = '';
    if (periodType === 'daily') periodText = `Harian (${reportDate})`;
    if (periodType === 'weekly') periodText = `Mingguan (Berakhir ${reportDate})`;
    if (periodType === 'monthly') periodText = `Bulanan (${reportDate.slice(0,7)})`;
    doc.text(`Periode: ${periodText}`, 14, 34);

    let currentY = 44;

    // 1. Ringkasan Demografi & Pembayaran
    doc.setFontSize(12);
    doc.text('1. Ringkasan Pelayanan & Demografi', 14, currentY);
    currentY += 8;
    
    const summaryBody = [
        ['Total Pasien Dilayani', String(filteredData.totalVisited) + ' Pasien'],
        ['Total Pasien Baru', String(filteredData.patientsRegistered) + ' Pasien'],
        ['Pasien Laki-laki', String(filteredData.genderCount.L) + ' Pasien'],
        ['Pasien Perempuan', String(filteredData.genderCount.P) + ' Pasien'],
        ['Total Pendapatan', 'Rp ' + filteredData.totalRevenue.toLocaleString('id-ID')]
    ];
    
    Object.entries(filteredData.paymentMethodCount).forEach(([method, count]) => {
         summaryBody.push([`Pembayaran via ${method}`, String(count) + ' Transaksi']);
    });

    autoTable(doc, {
        startY: currentY,
        head: [['Metrik', 'Nilai / Jumlah']],
        body: summaryBody,
        theme: 'grid',
        headStyles: { fillColor: [51, 65, 85] }
    });
    
    currentY = (doc as any).lastAutoTable.finalY + 15;

    // 2. Rekapitulasi Diagnosa
    if (currentY > 250) { doc.addPage(); currentY = 20; }
    doc.text('2. Rekapitulasi Diagnosa Terbanyak', 14, currentY);
    currentY += 8;
    const diagArray = Object.entries(filteredData.diagnosisCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 15)
        .map(([diag, count]) => [diag, String(count)]);
        
    autoTable(doc, {
        startY: currentY,
        head: [['Diagnosa / Kondisi', 'Jumlah Kasus']],
        body: diagArray.length > 0 ? diagArray : [['Tidak ada data', '-']],
        theme: 'grid',
        headStyles: { fillColor: [51, 65, 85] }
    });

    currentY = (doc as any).lastAutoTable.finalY + 15;

    // 3. Rekap Tindakan & Pelayanan Dasar
    if (currentY > 250) { doc.addPage(); currentY = 20; }
    doc.text('3. Rekapitulasi Layanan & Tindakan', 14, currentY);
    currentY += 8;
    const serviceArray = Object.values(filteredData.serviceCount)
        .sort((a, b) => b.qty - a.qty)
        .map(s => [s.name, String(s.qty), 'Rp ' + s.total.toLocaleString('id-ID')]);
        
    autoTable(doc, {
        startY: currentY,
        head: [['Tindakan / Layanan', 'Jumlah', 'Total Nilai']],
        body: serviceArray.length > 0 ? serviceArray : [['Tidak ada data', '-', '-']],
        theme: 'grid',
        headStyles: { fillColor: [51, 65, 85] }
    });

    currentY = (doc as any).lastAutoTable.finalY + 15;

    // 4. Rekap Obat Keluar
    if (currentY > 250) { doc.addPage(); currentY = 20; }
    doc.text('4. Rekapitulasi Obat Keluar', 14, currentY);
    currentY += 8;
    const drugArray = Object.values(filteredData.drugCount)
        .sort((a, b) => b.qty - a.qty)
        .map(d => [d.name, `${d.qty} ${d.unit}`, 'Rp ' + d.total.toLocaleString('id-ID')]);
        
    autoTable(doc, {
        startY: currentY,
        head: [['Nama Obat', 'Jumlah Keluar', 'Total Nilai']],
        body: drugArray.length > 0 ? drugArray : [['Tidak ada data', '-', '-']],
        theme: 'grid',
        headStyles: { fillColor: [51, 65, 85] }
    });

    currentY = (doc as any).lastAutoTable.finalY + 15;

    // 5. Rincian Kunjungan Pasien
    if (currentY > 240) { doc.addPage(); currentY = 20; }
    doc.text('5. Rincian Kunjungan Pasien (Buku Register LPJ)', 14, currentY);
    currentY += 8;
    const visitsArray = filteredData.detailedVisits.map(v => [
        v.date, 
        `${v.name}\nRM: ${v.rm}\nUSIA: ${v.age} | ${v.gender}`, 
        v.vitals,
        v.diag, 
        v.itemsGiven.length > 0 ? v.itemsGiven.join(', ') : '-',
        v.payment,
        'Rp ' + v.total.toLocaleString('id-ID')
    ]);
    
    autoTable(doc, {
        startY: currentY,
        head: [['Tgl', 'Identitas Pasien', 'Tanda Vital', 'Diagnosa', 'Layanan & Obat Diberikan', 'Cara Bayar', 'Total Biaya']],
        body: visitsArray.length > 0 ? visitsArray : [['Tidak ada data', '-', '-', '-', '-', '-', '-']],
        theme: 'grid',
        headStyles: { fillColor: [51, 65, 85] },
        styles: { fontSize: 7, cellPadding: 2 }
    });

    currentY = (doc as any).lastAutoTable.finalY + 25;

    // Tanda Tangan
    if (currentY > 250) { doc.addPage(); currentY = 20; }
    doc.setFontSize(10);
    const dateNowStr = formatIDDate(new Date());
    doc.text(`Dicetak pada tanggal: ${dateNowStr}`, 140, currentY);
    doc.text(`Mengetahui,`, 140, currentY + 6);
    doc.text(`Pimpinan Klinik`, 140, currentY + 30);

    // 6. Rekapitulasi Hasil Ukur USG
    const usgDataArray = filteredData.detailedVisits
        .filter(v => v.usgMetrics && v.usgMetrics.length > 0)
        .map(v => [
            v.date,
            `${v.name} (${v.rm})`,
            v.usgMetrics.join('\n')
        ]);
        
    if (usgDataArray.length > 0) {
        if (currentY > 240) { doc.addPage(); currentY = 20; }
        doc.text('6. Rekapitulasi Hasil Pengukuran USG & Biometri Kehamilan', 14, currentY);
        currentY += 8;
        
        autoTable(doc, {
            startY: currentY,
            head: [['Tanggal', 'Identitas Pasien', 'Hasil Pengukuran (Biometri)']],
            body: usgDataArray,
            theme: 'grid',
            headStyles: { fillColor: [51, 65, 85] },
            styles: { fontSize: 8, cellPadding: 2 }
        });
        currentY = (doc as any).lastAutoTable.finalY + 15;
    }

    // 7. Lampiran USG
    if (filteredData.allImages.length > 0) {
        doc.addPage();
        currentY = 20;
        doc.setFontSize(14);
        doc.text('7. Lampiran Hasil Pencitraan Medis & USG', 14, currentY);
        currentY += 10;
        
        const imageTableBody = filteredData.allImages.map((imgObj, idx) => {
            return [String(idx + 1), imgObj.label, '']; // Empty string for image cell
        });

        autoTable(doc, {
            startY: currentY,
            head: [['No', 'Keterangan', 'Lampiran Fotografi']],
            body: imageTableBody,
            theme: 'grid',
            headStyles: { fillColor: [51, 65, 85] },
            columnStyles: { 
                0: { cellWidth: 10, halign: 'center' },
                1: { cellWidth: 80 },
                2: { cellWidth: 90, minCellHeight: 60 } // Make room for image height
            },
            didDrawCell: function(data: any) {
                if (data.column.index === 2 && data.cell.section === 'body') {
                    const imgObj = filteredData.allImages[data.row.index];
                    try {
                        const imgProps = doc.getImageProperties(imgObj.src);
                        const dim = data.cell;
                        const padding = 2;
                        const maxW = dim.width - (padding * 2);
                        const maxH = dim.height - (padding * 2);

                        let pdfWidth = imgProps.width;
                        let pdfHeight = imgProps.height;
                        const ratio = pdfWidth / pdfHeight;

                        if (pdfWidth > maxW) {
                            pdfWidth = maxW;
                            pdfHeight = maxW / ratio;
                        }
                        if (pdfHeight > maxH) {
                            pdfHeight = maxH;
                            pdfWidth = maxH * ratio; // wait, let me be careful. "maxH"
                        }
                        
                        // Recalculate to fit well
                        pdfWidth = maxW;
                        pdfHeight = maxW / ratio;
                        if (pdfHeight > maxH) {
                           pdfHeight = maxH;
                           pdfWidth = maxH * ratio;
                        }
                        
                        // Center image in cell
                        const imgX = dim.x + padding + (maxW - pdfWidth)/2;
                        const imgY = dim.y + padding + (maxH - pdfHeight)/2;

                        doc.addImage(imgObj.src, 'JPEG', imgX, imgY, pdfWidth, pdfHeight);
                    } catch(e) {
                         console.error("Gagal menggambar gambar dalem sel", e);
                    }
                }
            }
        });
    }

    doc.save(`LPJ_${clinicName.replace(/ /g, '_')}_${periodText.replace(/ /g, '_')}.pdf`);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 h-full flex flex-col pt-2 max-w-5xl mx-auto w-full">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 shrink-0 px-2 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
                <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-500 uppercase tracking-widest font-bold">Laporan Pertanggungjawaban Master</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white leading-none">
                LPJ Klinik Detail
            </h2>
          </div>
          <button 
             onClick={generatePDF}
             className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-500 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-lg"
          >
             <Printer className="w-4 h-4" /> Cetak PDF Lengkap
          </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 px-2">
         <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Klinik Terpilih</label>
            <div className="relative">
               <Building2 className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
               <select 
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none appearance-none font-medium"
                  value={selectedClinic}
                  onChange={e => setSelectedClinic(e.target.value)}
               >
                  <option value="all">Semua Klinik (Kompilasi)</option>
                  {clinicsInfo.map(c => (
                     <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
               </select>
            </div>
         </div>
         <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Cakupan Periode</label>
            <div className="relative">
               <CalendarDays className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
               <select 
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none appearance-none font-medium"
                  value={periodType}
                  onChange={e => setPeriodType(e.target.value as any)}
               >
                  <option value="daily">Harian</option>
                  <option value="weekly">Mingguan</option>
                  <option value="monthly">Bulanan</option>
               </select>
            </div>
         </div>
         <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Tanggal Tarik Data</label>
            <div className="relative">
               <input 
                  type={periodType === 'monthly' ? 'month' : 'date'}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none font-medium"
                  value={periodType === 'monthly' ? reportDate.slice(0, 7) : reportDate}
                  onChange={e => {
                     setReportDate(periodType === 'monthly' ? e.target.value + '-01' : e.target.value);
                  }}
               />
            </div>
         </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-2 mb-6 text-center">
         <div className="bg-white dark:bg-slate-900 p-4 rounded-[24px] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-center items-center">
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Total Kunjungan</h4>
            <p className="text-3xl font-black text-slate-900 dark:text-white">{filteredData.totalVisited}</p>
         </div>
         <div className="bg-white dark:bg-slate-900 p-4 rounded-[24px] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-center items-center">
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Pendaftaran Baru</h4>
            <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{filteredData.patientsRegistered}</p>
         </div>
         <div className="bg-white dark:bg-slate-900 p-4 rounded-[24px] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-center items-center">
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex flex-col gap-1">Demografi Hadir</h4>
            <p className="text-xs font-bold text-slate-600 dark:text-slate-400"><span className="text-blue-500">{filteredData.genderCount.L} Laki-laki</span> <span className="opacity-50 mx-1">/</span> <span className="text-pink-500">{filteredData.genderCount.P} Perempuan</span></p>
         </div>
         <div className="bg-white dark:bg-slate-900 p-4 rounded-[24px] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-center items-center">
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Total Pendapatan</h4>
            <p className="text-xl font-black text-slate-900 dark:text-white tracking-tighter">Rp {filteredData.totalRevenue.toLocaleString('id-ID')}</p>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-2 pb-12">
         {/* Rekap Diagnosa */}
         <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-[24px] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col min-h-[300px]">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40">
               <h3 className="font-bold text-sm tracking-widest uppercase text-slate-700 dark:text-slate-300">Rekap Diagnosa</h3>
            </div>
            <div className="p-4 flex-1 overflow-y-auto">
               {Object.entries(filteredData.diagnosisCount).length === 0 ? (
                  <div className="h-full flex items-center justify-center text-slate-400 text-sm">Tidak ada data</div>
               ) : (
                  <table className="w-full text-left text-sm">
                     <thead>
                        <tr className="text-[10px] text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                           <th className="pb-2 font-semibold">Diagnosa</th>
                           <th className="pb-2 font-semibold text-right">Kasus</th>
                        </tr>
                     </thead>
                     <tbody>
                        {Object.entries(filteredData.diagnosisCount).sort((a, b) => b[1] - a[1])
                           .slice((getPage('diag') - 1) * 10, getPage('diag') * 10)
                           .map(([diag, count], idx) => (
                           <tr key={idx} className="border-b border-slate-50 dark:border-slate-800/50 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/30">
                              <td className="py-2.5 font-medium">{diag}</td>
                              <td className="py-2.5 text-right font-mono text-emerald-600 dark:text-emerald-400 font-bold">{count}</td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               )}
            </div>
            <Pagination 
               totalItems={Object.keys(filteredData.diagnosisCount).length}
               itemsPerPage={10}
               currentPage={getPage('diag')}
               onPageChange={(page) => setPage('diag', page)}
               className="rounded-b-[24px]"
            />
         </div>

         {/* Rekap Tindakan & Layanan Dasar */}
         <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-[24px] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col min-h-[300px]">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40">
               <h3 className="font-bold text-sm tracking-widest uppercase text-slate-700 dark:text-slate-300">Tindakan Medis Layanan</h3>
            </div>
            <div className="p-4 flex-1 overflow-y-auto">
               {Object.values(filteredData.serviceCount).length === 0 ? (
                  <div className="h-full flex items-center justify-center text-slate-400 text-sm">Tidak ada data layanan khusus</div>
               ) : (
                  <table className="w-full text-left text-sm">
                     <thead>
                        <tr className="text-[10px] text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                           <th className="pb-2 font-semibold">Tindakan</th>
                           <th className="pb-2 font-semibold text-right">Qty</th>
                           <th className="pb-2 font-semibold text-right">Nilai Total</th>
                        </tr>
                     </thead>
                     <tbody>
                        {Object.values(filteredData.serviceCount).sort((a,b) => b.qty - a.qty)
                           .slice((getPage('srv') - 1) * 10, getPage('srv') * 10)
                           .map((srv, idx) => (
                           <tr key={idx} className="border-b border-slate-50 dark:border-slate-800/50 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/30">
                              <td className="py-2.5 font-medium pr-2 truncate max-w-[120px]" title={srv.name}>{srv.name}</td>
                              <td className="py-2.5 text-right font-mono font-bold text-indigo-600 dark:text-indigo-400">{srv.qty}</td>
                              <td className="py-2.5 text-right font-mono text-slate-500 text-[10px]">Rp {(srv.total/1000)}k</td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               )}
            </div>
            <Pagination 
               totalItems={Object.keys(filteredData.serviceCount).length}
               itemsPerPage={10}
               currentPage={getPage('srv')}
               onPageChange={(page) => setPage('srv', page)}
               className="rounded-b-[24px]"
            />
         </div>

         {/* Obat Keluar */}
         <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-[24px] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col min-h-[300px]">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40">
               <h3 className="font-bold text-sm tracking-widest uppercase text-slate-700 dark:text-slate-300">Farmasi Obat Keluar</h3>
            </div>
            <div className="p-4 flex-1 overflow-y-auto">
               {Object.values(filteredData.drugCount).length === 0 ? (
                  <div className="h-full flex items-center justify-center text-slate-400 text-sm">Tidak ada data obat</div>
               ) : (
                  <table className="w-full text-left text-sm">
                     <thead>
                        <tr className="text-[10px] text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                           <th className="pb-2 font-semibold">Nama Obat</th>
                           <th className="pb-2 font-semibold text-right">Keluar</th>
                           <th className="pb-2 font-semibold text-right">Nilai</th>
                        </tr>
                     </thead>
                     <tbody>
                        {Object.values(filteredData.drugCount).sort((a,b) => b.qty - a.qty)
                           .slice((getPage('drug') - 1) * 10, getPage('drug') * 10)
                           .map((drug, idx) => (
                           <tr key={idx} className="border-b border-slate-50 dark:border-slate-800/50 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/30">
                              <td className="py-2.5 font-medium pr-2 truncate max-w-[120px]" title={drug.name}>{drug.name}</td>
                              <td className="py-2.5 text-right font-mono font-bold text-orange-600 dark:text-orange-400 text-xs">
                                {drug.qty} <span className="text-[9px] font-sans font-normal text-slate-400">{drug.unit}</span>
                              </td>
                              <td className="py-2.5 text-right font-mono text-slate-500 text-[10px]">Rp {(drug.total/1000)}k</td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               )}
            </div>
            <Pagination 
               totalItems={Object.keys(filteredData.drugCount).length}
               itemsPerPage={10}
               currentPage={getPage('drug')}
               onPageChange={(page) => setPage('drug', page)}
               className="rounded-b-[24px]"
            />
         </div>
      </div>

      <div className="px-2 pb-12">
         {/* Detail Kunjungan Table */}
         <div className="bg-white dark:bg-slate-900 rounded-[24px] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col mb-8">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40">
               <h3 className="font-bold text-sm tracking-widest uppercase text-slate-700 dark:text-slate-300">Rincian Komprehensif Kunjungan Pasien</h3>
               <p className="text-xs text-slate-500 mt-1">Daftar layanan, obat, metode bayar dan keluhan per kunjungan.</p>
            </div>
            <div className="p-4 overflow-x-auto min-h-[300px]">
               {filteredData.detailedVisits.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-slate-400 text-sm">Tidak ada data kunjungan detail</div>
               ) : (
                  <table className="w-full text-left text-sm">
                     <thead>
                        <tr className="text-[10px] text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 whitespace-nowrap">
                           <th className="pb-2 font-semibold">TGL / RM</th>
                           <th className="pb-2 font-semibold">Identitas Pasien</th>
                           <th className="pb-2 font-semibold max-w-[150px]">Tanda Vital</th>
                           <th className="pb-2 font-semibold">Diagnosa</th>
                           <th className="pb-2 font-semibold min-w-[200px]">Tindakan & Obat</th>
                           <th className="pb-2 font-semibold">Cara Bayar</th>
                           <th className="pb-2 font-semibold text-right">Biaya</th>
                        </tr>
                     </thead>
                     <tbody className="align-top">
                        {filteredData.detailedVisits
                           .slice((getPage('visit') - 1) * 10, getPage('visit') * 10)
                           .map((visit, idx) => (
                           <tr key={idx} className="border-b border-slate-50 dark:border-slate-800/50 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/30">
                              <td className="py-3 font-mono text-xs whitespace-nowrap">
                                <div className="text-slate-800 dark:text-slate-200">{visit.date}</div>
                                <div className="text-[10px] text-slate-500">RM: #{visit.rm}</div>
                              </td>
                              <td className="py-3">
                                 <div className="font-bold text-slate-800 dark:text-white capitalize">{visit.name}</div>
                                 <div className="text-xs text-slate-500">{visit.age} Thn • {visit.gender}</div>
                              </td>
                              <td className="py-3 text-[10px] text-slate-500 max-w-[150px]" title={visit.vitals}>{visit.vitals}</td>
                              <td className="py-3 text-xs font-medium text-slate-700 dark:text-slate-300 max-w-[200px] truncate" title={visit.diag}>{visit.diag}</td>
                              <td className="py-3">
                                 {visit.itemsGiven.length > 0 ? (
                                    <div className="flex flex-wrap gap-1">
                                       {visit.itemsGiven.map((itemStr: string, i: number) => (
                                          <span key={i} className="inline-block px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-[10px] rounded text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">{itemStr}</span>
                                       ))}
                                    </div>
                                 ) : (
                                    <span className="text-xs text-slate-400 italic">Data layanan kosong</span>
                                 )}
                              </td>
                              <td className="py-3 w-24">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${visit.payment.toLowerCase().includes('bpjs') ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'}`}>
                                  {visit.payment}
                                </span>
                              </td>
                              <td className="py-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                                Rp {visit.total.toLocaleString('id-ID')}
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               )}
            </div>
            <Pagination 
               totalItems={filteredData.detailedVisits.length}
               itemsPerPage={10}
               currentPage={getPage('visit')}
               onPageChange={(page) => setPage('visit', page)}
               className="rounded-b-[24px]"
            />
         </div>

         {/* USG Measurements Section */}
         {filteredData.detailedVisits.some(v => v.usgMetrics && v.usgMetrics.length > 0) && (
             <div className="bg-white dark:bg-slate-900 rounded-[24px] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col mb-8">
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40">
                   <h3 className="font-bold text-sm tracking-widest uppercase text-slate-700 dark:text-slate-300">Rekapitulasi Hasil Pengukuran USG Kehamilan</h3>
                </div>
                <div className="p-4 overflow-x-auto">
                   <table className="w-full text-left text-sm">
                      <thead>
                         <tr className="text-[10px] text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 whitespace-nowrap">
                            <th className="pb-2 font-semibold">TGL / RM</th>
                            <th className="pb-2 font-semibold">Identitas Pasien</th>
                            <th className="pb-2 font-semibold">Parameter / Angka Hasil USG (Biometri)</th>
                         </tr>
                      </thead>
                      <tbody className="align-top">
                         {filteredData.detailedVisits.filter(v => v.usgMetrics && v.usgMetrics.length > 0)
                            .slice((getPage('usg') - 1) * 10, getPage('usg') * 10)
                            .map((visit, idx) => (
                            <tr key={idx} className="border-b border-slate-50 dark:border-slate-800/50 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/30">
                               <td className="py-3 font-mono text-xs whitespace-nowrap">
                                 <div className="text-slate-800 dark:text-slate-200">{visit.date}</div>
                                 <div className="text-[10px] text-slate-500">RM: #{visit.rm}</div>
                               </td>
                               <td className="py-3">
                                  <div className="font-bold text-slate-800 dark:text-white capitalize">{visit.name}</div>
                               </td>
                               <td className="py-3">
                                  <div className="flex flex-wrap gap-2">
                                     {visit.usgMetrics.map((um: string, i: number) => (
                                         <span key={i} className="inline-block px-2 py-1 bg-pink-50 dark:bg-pink-900/20 text-[10px] font-bold rounded-lg text-pink-700 dark:text-pink-400 border border-pink-100 dark:border-pink-800/30">{um}</span>
                                     ))}
                                  </div>
                               </td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
                <Pagination 
                   totalItems={filteredData.detailedVisits.filter(v => v.usgMetrics && v.usgMetrics.length > 0).length}
                   itemsPerPage={10}
                   currentPage={getPage('usg')}
                   onPageChange={(page) => setPage('usg', page)}
                   className="rounded-b-[24px]"
                />
             </div>
         )}
         
         {/* Lampiran USG Section */}
         {filteredData.allImages.length > 0 && (
             <div className="bg-white dark:bg-slate-900 rounded-[24px] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 flex justify-between items-center">
                   <h3 className="font-bold text-sm tracking-widest uppercase text-slate-700 dark:text-slate-300">Lampiran Bukti Pencitraan / USG</h3>
                   <span className="text-xs font-bold bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2 py-1 rounded">{filteredData.allImages.length} Lampiran</span>
                </div>
                <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                   {filteredData.allImages.map((imgObj, idx) => (
                      <div key={idx} className="flex flex-col gap-3 group">
                         <div className="aspect-square sm:aspect-[4/3] rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm bg-slate-50 dark:bg-slate-950 relative">
                            <img src={imgObj.src} alt={imgObj.label} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                         </div>
                         <p className="text-[10px] font-bold text-center text-slate-500 uppercase tracking-wider w-full truncate px-2" title={imgObj.label}>{imgObj.label}</p>
                      </div>
                   ))}
                </div>
             </div>
         )}
      </div>
    </div>
  );
}
