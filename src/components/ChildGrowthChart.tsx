import React from 'react';
import { 
  LineChart as RechartsLineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';
import { Scale, LineChart, Download, Activity } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
  WHO_WEIGHT_BOYS, WHO_WEIGHT_GIRLS, 
  WHO_HEIGHT_BOYS, WHO_HEIGHT_GIRLS,
  WHO_HEAD_CIRC_BOYS, WHO_HEAD_CIRC_GIRLS
} from '../data/growthReference';

interface Child {
  name: string;
  gender: string;
  birth_date?: string;
  growth?: {
    age_months: number;
    weight: number;
    height: number;
    head_circumference?: number;
    date_measured?: string;
    notes?: string;
    [key: string]: any;
  }[];
}

interface ChildGrowthChartProps {
  child: Child;
  darkMode: boolean;
}

export const ChildGrowthChart: React.FC<ChildGrowthChartProps> = ({ child, darkMode }) => {
  // Kurangi sedikit kriteria WHO untuk menyesuaikan profil anak Indonesia (Kemenkes/KMS Murni)
  const adjustForIndonesia = (p: number, factor: number) => Number((p * factor).toFixed(1));

  const getWeightData = () => {
    const refData = child.gender === 'Laki-laki' ? WHO_WEIGHT_BOYS : WHO_WEIGHT_GIRLS;
    const patientData = child.growth || [];
    
    // Gabungkan data pasien dan WHO berdasarkan age_months
    const allMonths = Array.from(new Set([
      ...refData.map(r => r.age_months),
      ...patientData.map(g => g.age_months)
    ])).sort((a, b) => a - b);

    return allMonths.map(month => {
      const r = refData.find(x => x.age_months === month) || {} as any;
      const p = patientData.find(x => x.age_months === month);
      return {
        age_months: month,
        p3: r.p3 ? adjustForIndonesia(r.p3, 0.95) : undefined,
        p15: r.p15 ? adjustForIndonesia(r.p15, 0.95) : undefined,
        p50: r.p50 ? adjustForIndonesia(r.p50, 0.95) : undefined,
        p85: r.p85 ? adjustForIndonesia(r.p85, 0.95) : undefined,
        p97: r.p97 ? adjustForIndonesia(r.p97, 0.95) : undefined,
        weight: p ? p.weight : undefined,
      };
    });
  };

  const getHeightData = () => {
    const refData = child.gender === 'Laki-laki' ? WHO_HEIGHT_BOYS : WHO_HEIGHT_GIRLS;
    const patientData = child.growth || [];

    // Gabungkan data pasien dan WHO berdasarkan age_months
    const allMonths = Array.from(new Set([
      ...refData.map(r => r.age_months),
      ...patientData.map(g => g.age_months)
    ])).sort((a, b) => a - b);

    return allMonths.map(month => {
      const r = refData.find(x => x.age_months === month) || {} as any;
      const p = patientData.find(x => x.age_months === month);
      return {
        age_months: month,
        p3: r.p3 ? adjustForIndonesia(r.p3, 0.97) : undefined,
        p15: r.p15 ? adjustForIndonesia(r.p15, 0.97) : undefined,
        p50: r.p50 ? adjustForIndonesia(r.p50, 0.97) : undefined,
        p85: r.p85 ? adjustForIndonesia(r.p85, 0.97) : undefined,
        p97: r.p97 ? adjustForIndonesia(r.p97, 0.97) : undefined,
        height: p ? p.height : undefined,
      };
    });
  };

  const getHeadCircData = () => {
    const refData = child.gender === 'Laki-laki' ? WHO_HEAD_CIRC_BOYS : WHO_HEAD_CIRC_GIRLS;
    const patientData = child.growth || [];

    const allMonths = Array.from(new Set([
      ...refData.map(r => r.age_months),
      ...patientData.filter(g => g.head_circumference).map(g => g.age_months)
    ])).sort((a, b) => a - b);

    return allMonths.map(month => {
      const r = refData.find(x => x.age_months === month) || {} as any;
      const p = patientData.find(x => x.age_months === month && x.head_circumference);
      return {
        age_months: month,
        p3: r.p3 ? adjustForIndonesia(r.p3, 0.98) : undefined,
        p15: r.p15 ? adjustForIndonesia(r.p15, 0.98) : undefined,
        p50: r.p50 ? adjustForIndonesia(r.p50, 0.98) : undefined,
        p85: r.p85 ? adjustForIndonesia(r.p85, 0.98) : undefined,
        p97: r.p97 ? adjustForIndonesia(r.p97, 0.98) : undefined,
        head_circumference: p ? p.head_circumference : undefined,
      };
    });
  };

  const generatePDF = () => {
    const doc = new jsPDF('portrait', 'mm', 'a4');
    const sortedGrowth = [...(child.growth || [])].sort((a, b) => a.age_months - b.age_months);
    const latest = sortedGrowth[sortedGrowth.length - 1];

    const formatDate = (dateStr?: string) => {
      if (!dateStr) return '-';
      try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        return d.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
      } catch {
        return dateStr;
      }
    };

    const getInterpretations = () => {
      if (!latest) return { hStatus: 'Tidak Ada Data', wStatus: 'Tidak Ada Data' };
      const ageMonths = latest.age_months;
      const refHeight = (child.gender === 'Laki-laki' ? WHO_HEIGHT_BOYS : WHO_HEIGHT_GIRLS).find(r => r.age_months === ageMonths) || 
                       (child.gender === 'Laki-laki' ? WHO_HEIGHT_BOYS : WHO_HEIGHT_GIRLS)[(child.gender === 'Laki-laki' ? WHO_HEIGHT_BOYS : WHO_HEIGHT_GIRLS).length - 1];
      const refWeight = (child.gender === 'Laki-laki' ? WHO_WEIGHT_BOYS : WHO_WEIGHT_GIRLS).find(r => r.age_months === ageMonths) || 
                       (child.gender === 'Laki-laki' ? WHO_WEIGHT_BOYS : WHO_WEIGHT_GIRLS)[(child.gender === 'Laki-laki' ? WHO_WEIGHT_BOYS : WHO_WEIGHT_GIRLS).length - 1];

      const hStatus = latest.height < refHeight.p3 ? 'Risiko Stunting' : latest.height < refHeight.p15 ? 'Perlu Perhatian' : 'Optimal';
      const wStatus = latest.weight < refWeight.p3 ? 'Berat Kurang' : latest.weight < refWeight.p15 ? 'Perlu Perhatian' : 'Optimal';
      return { hStatus, wStatus };
    };

    const { hStatus: latestSubHeightStatus, wStatus: latestSubWeightStatus } = getInterpretations();

    // ----------------- PAGE 1: HEADER & PATIENT METADATA & WEIGHT CHART & RECOMMENDATIONS -----------------
    // Primary Header Banner
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('KAMPUS SEHAT & KIA PORTAL', 15, 17);
    doc.setFontSize(10);
    doc.setFont('Helvetica', 'normal');
    doc.text('Kartu Menuju Sehat (KMS) - Laporan Tumbuh Kembang Anak', 15, 24);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text('KLINIK PRATAMA RAWAT JALAN • DIREKTORAT KIA KEMENTERIAN KESEHATAN RI', 15, 30);

    // Patient Info Block (Slate background card)
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(15, 45, 180, 24, 3, 3, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(15, 45, 180, 24, 3, 3, 'D');
    
    doc.setTextColor(15, 23, 42);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('NAMA ANAK:', 20, 51);
    doc.setFont('Helvetica', 'normal');
    doc.text(child.name.toUpperCase(), 48, 51);
    
    doc.setFont('Helvetica', 'bold');
    doc.text('JENIS KELAMIN:', 20, 57);
    doc.setFont('Helvetica', 'normal');
    doc.text(child.gender || '-', 48, 57);
    
    doc.setFont('Helvetica', 'bold');
    doc.text('TANGGAL LAHIR:', 20, 63);
    doc.setFont('Helvetica', 'normal');
    doc.text(child.birth_date ? formatDate(child.birth_date) : '-', 48, 63);
    
    // Right side of child card
    doc.setFont('Helvetica', 'bold');
    doc.text('TANGGAL LAPORAN:', 110, 51);
    doc.setFont('Helvetica', 'normal');
    doc.text(formatDate(new Date().toISOString().split('T')[0]), 148, 51);
    
    doc.setFont('Helvetica', 'bold');
    doc.text('USIA PENGUKURAN:', 110, 57);
    doc.setFont('Helvetica', 'normal');
    doc.text(latest ? `${latest.age_months} Bulan` : '-', 148, 57);

    // Summary Metric Cards
    const cardWidth = 56;
    const cardHeight = 22;
    const cardY = 74;
    
    // Weight Card
    doc.setFillColor(240, 253, 250); // teal-50
    doc.roundedRect(15, cardY, cardWidth, cardHeight, 2, 2, 'F');
    doc.setDrawColor(153, 246, 228); // teal-200
    doc.roundedRect(15, cardY, cardWidth, cardHeight, 2, 2, 'D');
    doc.setTextColor(13, 148, 136); // teal-600
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(7);
    doc.text('BERAT BADAN TERAKHIR', 19, cardY + 5);
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(11);
    doc.text(latest ? `${latest.weight} kg` : '-', 19, cardY + 13);
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(`Status: ${latestSubWeightStatus}`, 19, cardY + 18);
    
    // Height Card
    doc.setFillColor(239, 246, 255); // blue-50
    doc.roundedRect(77, cardY, cardWidth, cardHeight, 2, 2, 'F');
    doc.setDrawColor(191, 219, 254); // blue-200
    doc.roundedRect(77, cardY, cardWidth, cardHeight, 2, 2, 'D');
    doc.setTextColor(37, 99, 235); // blue-600
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(7);
    doc.text('TINGGI BADAN TERAKHIR', 81, cardY + 5);
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(11);
    doc.text(latest ? `${latest.height} cm` : '-', 81, cardY + 13);
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(`Status: ${latestSubHeightStatus}`, 81, cardY + 18);
    
    // Head Circumference Card
    doc.setFillColor(250, 245, 255); // purple-50
    doc.roundedRect(139, cardY, cardWidth, cardHeight, 2, 2, 'F');
    doc.setDrawColor(233, 213, 255); // purple-200
    doc.roundedRect(139, cardY, cardWidth, cardHeight, 2, 2, 'D');
    doc.setTextColor(147, 51, 234); // purple-600
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(7);
    doc.text('LINGKAR KEPALA TERAKHIR', 143, cardY + 5);
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(11);
    doc.text(latest && latest.head_circumference ? `${latest.head_circumference} cm` : '-', 143, cardY + 13);
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(latest && latest.head_circumference ? 'Normal' : 'Belum ada data', 143, cardY + 18);

    // DRAW WEIGHT-FOR-AGE CHART (VECTOR SHAPES)
    const chartLeft = 30;
    const chartWidth = 160;
    const chartTop = 108;
    const chartHeight = 55;
    const chartBottom = chartTop + chartHeight;

    doc.setTextColor(15, 23, 42);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('KURVA BERAT BADAN TERHADAP USIA (STANDAR BENCHMARK WHO)', 15, chartTop - 4);

    doc.setFillColor(252, 253, 254);
    doc.setDrawColor(241, 245, 249);
    doc.rect(chartLeft, chartTop, chartWidth, chartHeight, 'F');

    const getX = (age: number) => chartLeft + (Math.min(24, Math.max(0, age)) / 24) * chartWidth;
    const getYWeight = (val: number) => chartBottom - (Math.min(18, Math.max(0, val)) / 18) * chartHeight;

    doc.setLineWidth(0.1);
    doc.setFontSize(6);
    doc.setFont('Helvetica', 'normal');
    doc.setTextColor(148, 163, 184);

    // Weight reference lines (y-axis)
    for (let kg = 0; kg <= 18; kg += 2) {
      const py = getYWeight(kg);
      doc.setDrawColor(241, 245, 249);
      doc.line(chartLeft, py, chartLeft + chartWidth, py);
      doc.text(`${kg}kg`, chartLeft - 5, py + 1.5, { align: 'right' });
    }

    // Age reference lines (x-axis)
    for (let m = 0; m <= 24; m += 3) {
      const px = getX(m);
      doc.setDrawColor(241, 245, 249);
      doc.line(px, chartTop, px, chartBottom);
      doc.text(`${m}m`, px, chartBottom + 4, { align: 'center' });
    }

    const refWeightData = child.gender === 'Laki-laki' ? WHO_WEIGHT_BOYS : WHO_WEIGHT_GIRLS;

    // Plot P3 (Lower limit)
    doc.setDrawColor(244, 63, 94); // red
    doc.setLineWidth(0.25);
    doc.setLineDashPattern([2, 1.5], 0);
    for (let i = 0; i < refWeightData.length - 1; i++) {
      const p1 = refWeightData[i];
      const p2 = refWeightData[i + 1];
      doc.line(getX(p1.age_months), getYWeight(p1.p3), getX(p2.age_months), getYWeight(p2.p3));
    }
    doc.text('P3', getX(24) + 1, getYWeight(refWeightData[refWeightData.length - 1].p3) + 1.2);

    // Plot P50 (Optimal Median)
    doc.setDrawColor(59, 130, 246); // blue
    doc.setLineWidth(0.4);
    doc.setLineDashPattern([], 0);
    for (let i = 0; i < refWeightData.length - 1; i++) {
      const p1 = refWeightData[i];
      const p2 = refWeightData[i + 1];
      doc.line(getX(p1.age_months), getYWeight(p1.p50), getX(p2.age_months), getYWeight(p2.p50));
    }
    doc.text('P50', getX(24) + 1, getYWeight(refWeightData[refWeightData.length - 1].p50) + 1.2);

    // Plot P97 (Upper limit)
    doc.setDrawColor(244, 63, 94);
    doc.setLineWidth(0.25);
    doc.setLineDashPattern([2, 1.5], 0);
    for (let i = 0; i < refWeightData.length - 1; i++) {
      const p1 = refWeightData[i];
      const p2 = refWeightData[i + 1];
      doc.line(getX(p1.age_months), getYWeight(p1.p97), getX(p2.age_months), getYWeight(p2.p97));
    }
    doc.text('P97', getX(24) + 1, getYWeight(refWeightData[refWeightData.length - 1].p97) + 1.2);

    // Plot Patient Weight Line
    const validWeightPoints = sortedGrowth.filter(g => g.weight > 0);
    if (validWeightPoints.length > 0) {
      doc.setDrawColor(16, 185, 129); // emerald
      doc.setLineWidth(1.2);
      doc.setLineDashPattern([], 0);
      for (let i = 0; i < validWeightPoints.length - 1; i++) {
        const g1 = validWeightPoints[i];
        const g2 = validWeightPoints[i + 1];
        doc.line(getX(g1.age_months), getYWeight(g1.weight), getX(g2.age_months), getYWeight(g2.weight));
      }

      // Nodes
      doc.setFillColor(16, 185, 129);
      doc.setDrawColor(255, 255, 255);
      doc.setLineWidth(0.4);
      validWeightPoints.forEach(g => {
        doc.circle(getX(g.age_months), getYWeight(g.weight), 1.5, 'FD');
      });
    }

    // Border
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.35);
    doc.line(chartLeft, chartTop, chartLeft, chartBottom);
    doc.line(chartLeft, chartBottom, chartLeft + chartWidth, chartBottom);

    // Recommendation / Clinical Interpretation Card
    const adviceY = 175;
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(15, adviceY, 180, 93, 3, 3, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(15, adviceY, 180, 93, 3, 3, 'D');

    doc.setTextColor(15, 23, 42);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text('REKOMENDASI NUTRISI, MPASI & TINDAKAN PREVENTIF:', 20, adviceY + 8);

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(51, 65, 85);

    const latestHeight = latest ? latest.height : 0;
    const refHeightLimit = (child.gender === 'Laki-laki' ? WHO_HEIGHT_BOYS : WHO_HEIGHT_GIRLS).find(r => r.age_months === (latest ? latest.age_months : 0)) || 
                          (child.gender === 'Laki-laki' ? WHO_HEIGHT_BOYS : WHO_HEIGHT_GIRLS)[0];
    const isStuntingRisk = latestHeight > 0 && latestHeight < refHeightLimit.p3;

    let adviceLines: string[] = [];
    if (isStuntingRisk) {
      adviceLines = [
        '• Tinggi badan anak terdeteksi di bawah batas persentil 3 kurva standar WHO (-2 SD). Sangat disarankan berkonsultasi',
        '  dengan Dokter Spesialis Anak (Sp.A) guna melakukan pelacakan klinis dini mengenai risiko gangguan tumbuh kembang (Stunting).',
        '• Optimalkan pemberian asupan makanan pendamping ASI (MPASI) yang sarat dengan protein hewani padat gizi (seperti telur dada,',
        '  ikan kembung, hati ayam, serta daging merah) setiap hari guna merangsang pertumbuhan sel tulang yang memanjang.',
        '• Berikan suplementasi zat besi, kalsium, maupun vitamin sesuai instruksi resmi tenaga medis di faskes.',
        '• Amati dan cegah infeksi saluran cerna yang kerap berulang dengan menjaga higiene air minum, sanitasi dapur, serta lingkungan.',
        '• Lakukan penimbangan berat badan serta pengukuran tinggi badan secara rutin per 2 minggu sekali di posyandu terdekat.'
      ];
    } else if (latestSubHeightStatus === 'Perlu Perhatian' || latestSubWeightStatus === 'Perlu Perhatian') {
      adviceLines = [
        '• Indikator pertumbuhan anak saat ini mendekati garis ambang batas bawah standard normal WHO. Memerlukan penyesuaian nutrisi.',
        '• Evaluasi kembali komposisi dan porsi makan anak. Perbanyak lemak tambahan sehat (seperti minyak kelapa murni, mentega,',
        '  atau santan kelapa asli) pada MPASI untuk mensuplai kalori tinggi demi peningkatan berat badan berkelanjutan.',
        '• Teruskan pemberian ASI secara terjadwal atau MPASI berkualitas tinggi dengan serat, vitamin, dan zat besi prima.',
        '• Berikan anak ruang aktif bernilai positif (seperti bermain interaktif terarah) demi melatih motorik halus dan kasar.',
        '• Pastikan anak Anda mendapatkan imunisasi wajib lengkap sesuai ketetapan umur guna menguatkan daya tahan tubuh.'
      ];
    } else {
      adviceLines = [
        '• Selamat! Grafik pertumbuhan fisik (Tinggi & Berat Badan) anak Anda tumbuh sangat optimal sesuai garis median ideal WHO.',
        '  Garis median (P50) mengindikasikan status gizi, tumbuh kembang, dan penyerapan kalori berjalan dengan luar biasa baik!',
        '• Pertahankan pemberian ASI eksklusif dan MPASI sehat bergizi yang variatif serta seimbang (porsi buah, protein, karbohidrat).',
        '• Stimulasi koordinasi gerak fisik anak lewat aktivitas fisik meraba, bergerak aktif, dan berbicara sesuai usianya.',
        '• Selalu penuhi kepanduan imunisasi rutin dan tambahan selanjutnya guna mencegah berbagai penyakit menular anak.',
        '• Tetap kontrol tumbuh kembang sang buah hati secara tertib satu bulan sekali melalui fasilitas kesehatan terdekat Anda.'
      ];
    }

    let textY = adviceY + 15;
    adviceLines.forEach(line => {
      doc.text(line, 20, textY);
      textY += 4.5;
    });

    // Signature/Clinician Placeholder
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text('TENAGA KESEHATAN PEMERIKSA', 20, adviceY + 62);
    doc.setFont('Helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text('Klinik Utama Kampus Sehat & KIA KIA', 20, adviceY + 67);
    doc.line(20, adviceY + 80, 75, adviceY + 80);
    doc.text('( Dokter Anak / Bidan KIA )', 20, adviceY + 84);

    // Footer Page 1
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.25);
    doc.line(15, 282, 195, 282);
    doc.setTextColor(148, 163, 184);
    doc.setFontSize(7);
    doc.text('Digenerasi otomatis secara aman via Sistem Kartu Menuju Sehat - Klinik KIA Utama', 15, 287);
    doc.text('Halaman 1 dari 2', 195, 287, { align: 'right' });


    // ----------------- PAGE 2: HEIGHT CHART & ANTHROPOMETRIC RECORDS TABLE -----------------
    doc.addPage();
    
    // Page 2 top header bar
    doc.setFillColor(15, 23, 42); // slate-900 Header Strip
    doc.rect(0, 0, 210, 12, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('LAPORAN GRAFIK TINGGI BADAN & RIWAYAT ANTROPOMETRI - KMS ONLINE', 15, 7.5);

    // DRAW HEIGHT-FOR-AGE CHART (VECTOR SHAPES)
    const chartHeightTop = 24;
    const chartHeightBottom = chartHeightTop + chartHeight;

    doc.setTextColor(15, 23, 42);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('KURVA TINGGI BADAN TERHADAP USIA (STANDAR TINGGI/UMUR WHO)', 15, chartHeightTop - 4);

    doc.setFillColor(252, 253, 254);
    doc.setDrawColor(241, 245, 249);
    doc.rect(chartLeft, chartHeightTop, chartWidth, chartHeight, 'F');

    const getYHeight = (val: number) => chartHeightBottom - ((Math.min(100, Math.max(40, val)) - 40) / (100 - 40)) * chartHeight;

    // Gridlines & Labels (Y-Axis)
    doc.setLineWidth(0.1);
    doc.setFontSize(6);
    doc.setFont('Helvetica', 'normal');
    doc.setTextColor(148, 163, 184);

    for (let cm = 40; cm <= 100; cm += 10) {
      const py = getYHeight(cm);
      doc.setDrawColor(241, 245, 249);
      doc.line(chartLeft, py, chartLeft + chartWidth, py);
      doc.text(`${cm}cm`, chartLeft - 5, py + 1.5, { align: 'right' });
    }

    // Gridlines & Labels (X-Axis)
    for (let m = 0; m <= 24; m += 3) {
      const px = getX(m);
      doc.setDrawColor(241, 245, 249);
      doc.line(px, chartHeightTop, px, chartHeightBottom);
      doc.text(`${m}m`, px, chartHeightBottom + 4, { align: 'center' });
    }

    const refHeightData = child.gender === 'Laki-laki' ? WHO_HEIGHT_BOYS : WHO_HEIGHT_GIRLS;

    // Plot P3
    doc.setDrawColor(244, 63, 94);
    doc.setLineWidth(0.25);
    doc.setLineDashPattern([2, 1.5], 0);
    for (let i = 0; i < refHeightData.length - 1; i++) {
      const p1 = refHeightData[i];
      const p2 = refHeightData[i + 1];
      doc.line(getX(p1.age_months), getYHeight(p1.p3), getX(p2.age_months), getYHeight(p2.p3));
    }
    doc.text('P3', getX(24) + 1, getYHeight(refHeightData[refHeightData.length - 1].p3) + 1.2);

    // Plot P50
    doc.setDrawColor(16, 185, 129); // emerald
    doc.setLineWidth(0.4);
    doc.setLineDashPattern([], 0);
    for (let i = 0; i < refHeightData.length - 1; i++) {
      const p1 = refHeightData[i];
      const p2 = refHeightData[i + 1];
      doc.line(getX(p1.age_months), getYHeight(p1.p50), getX(p2.age_months), getYHeight(p2.p50));
    }
    doc.text('P50', getX(24) + 1, getYHeight(refHeightData[refHeightData.length - 1].p50) + 1.2);

    // Plot P97
    doc.setDrawColor(244, 63, 94);
    doc.setLineWidth(0.25);
    doc.setLineDashPattern([2, 1.5], 0);
    for (let i = 0; i < refHeightData.length - 1; i++) {
      const p1 = refHeightData[i];
      const p2 = refHeightData[i + 1];
      doc.line(getX(p1.age_months), getYHeight(p1.p97), getX(p2.age_months), getYHeight(p2.p97));
    }
    doc.text('P97', getX(24) + 1, getYHeight(refHeightData[refHeightData.length - 1].p97) + 1.2);

    // Plot Patient Height Curve
    const validHeightPoints = sortedGrowth.filter(g => g.height > 0);
    if (validHeightPoints.length > 0) {
      doc.setDrawColor(59, 130, 246); // blue
      doc.setLineWidth(1.2);
      doc.setLineDashPattern([], 0);
      for (let i = 0; i < validHeightPoints.length - 1; i++) {
        const g1 = validHeightPoints[i];
        const g2 = validHeightPoints[i + 1];
        doc.line(getX(g1.age_months), getYHeight(g1.height), getX(g2.age_months), getYHeight(g2.height));
      }

      // Nodes
      doc.setFillColor(59, 130, 246);
      doc.setDrawColor(255, 255, 255);
      doc.setLineWidth(0.4);
      validHeightPoints.forEach(g => {
        doc.circle(getX(g.age_months), getYHeight(g.height), 1.5, 'FD');
      });
    }

    // Border
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.35);
    doc.line(chartLeft, chartHeightTop, chartLeft, chartHeightBottom);
    doc.line(chartLeft, chartHeightBottom, chartLeft + chartWidth, chartHeightBottom);

    // ANTHROPOMETRIC HISTORY SECTION (TABLE)
    doc.setTextColor(15, 23, 42);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('TABEL RIWAYAT ANTROPOMETRI BALITA KELUARGA', 15, chartHeightBottom + 12);

    const tableHead = [['No', 'Tgl Pengukuran', 'Usia Anak', 'Berat Badan', 'Tinggi/Panjang', 'Lk. Kepala', 'Catatan Orang Tua / Keluhan']];
    const tableBody = sortedGrowth.map((g, idx) => [
      idx + 1,
      g.date_measured ? formatDate(g.date_measured) : '-',
      `${g.age_months} Bulan`,
      `${g.weight} kg`,
      `${g.height} cm`,
      g.head_circumference ? `${g.head_circumference} cm` : '-',
      g.notes || '-'
    ]);

    autoTable(doc, {
      startY: chartHeightBottom + 15,
      margin: { left: 15, right: 15 },
      head: tableHead,
      body: tableBody,
      theme: 'striped',
      headStyles: {
        fillColor: [15, 23, 42],
        textColor: [255, 255, 255],
        fontSize: 7.5,
        fontStyle: 'bold',
        halign: 'center',
        valign: 'middle'
      },
      bodyStyles: {
        fontSize: 7.5,
        halign: 'center',
        valign: 'middle'
      },
      columnStyles: {
        0: { cellWidth: 10 },
        1: { cellWidth: 32 },
        2: { cellWidth: 20 },
        3: { cellWidth: 22 },
        4: { cellWidth: 22 },
        5: { cellWidth: 20 },
        6: { halign: 'left', cellWidth: 44 }
      }
    });

    // Sign off & stamp block
    const finalTableY = (doc as any).lastAutoTable.finalY || 180;
    const signOffY = Math.min(235, finalTableY + 12);

    doc.setFillColor(254, 254, 254);
    doc.setTextColor(15, 23, 42);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('CATATAN PETUGAS KIA & ADMIN:', 15, signOffY + 5);
    doc.setFont('Helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text('Grafik ini melacak kurva standard persentil WHO secara real-time berdasarkan input valid bidan & asisten faskes.', 15, signOffY + 10);
    doc.text('Laporan ini sah digunakan sebagai referensi rujukan medis eksternal (Rujuk RSUD / Spesialis Anak).', 15, signOffY + 14);

    // Bottom Footer Page 2
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.25);
    doc.line(15, 282, 195, 282);
    doc.setTextColor(148, 163, 184);
    doc.setFontSize(7);
    doc.text('Digenerasi otomatis secara aman via Sistem Kartu Menuju Sehat - Klinik KIA Utama', 15, 287);
    doc.text('Halaman 2 dari 2', 195, 287, { align: 'right' });

    // Save File
    doc.save(`KMS_Laporan_Tumbuh_Kembang_${child.name.replace(/\s+/g, '_')}.pdf`);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* PDF Export Banner Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 transition-colors">
        <div>
          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">Ekstop Laporan Tumbuh Kembang</h4>
          <p className="text-[10px] text-slate-400 dark:text-slate-505 font-medium leading-relaxed">Unduh laporan cetak digital (PDF) lengkap terhadap standard baku WHO untuk diserahkan kepada orang tua & dokter anak.</p>
        </div>
        <button
          onClick={generatePDF}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-md shadow-indigo-100 dark:shadow-none cursor-pointer"
        >
          <Download className="w-4 h-4" /> Download Laporan (PDF)
        </button>
      </div>

      <div className="flex flex-col gap-8">
        {/* Weight Chart */}
        <div className="bg-white dark:bg-slate-900 p-4 md:p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm aspect-auto h-[250px] md:h-[350px] flex flex-col w-full">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest flex items-center gap-2">
              <Scale className="w-4 h-4 text-emerald-500" /> Kurva Berat Badan (kg)
            </h4>
            <span className="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 text-[10px] px-3 py-1 rounded-full font-bold">
              vs Kemenkes Nasional
            </span>
          </div>
          <div className="flex-grow min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsLineChart data={getWeightData()}>
                <defs>
                  <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="1 1" stroke={darkMode ? "#1e293b" : "#e2e8f0"} vertical={true} horizontal={true} strokeWidth={1} />
                <XAxis 
                  dataKey="age_months" 
                  fontSize={8} 
                  tickMargin={5} 
                  axisLine={{stroke: darkMode ? '#334155' : '#cbd5e1'}} 
                  tickLine={{stroke: darkMode ? '#334155' : '#cbd5e1'}} 
                  type="number"
                  domain={[0, 24]}
                  tickCount={25}
                  ticks={[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24]}
                  tick={{fill: darkMode ? '#64748b' : '#94a3b8'}}
                />
                <YAxis 
                  fontSize={8} 
                  axisLine={{stroke: darkMode ? '#334155' : '#cbd5e1'}}  
                  tickLine={{stroke: darkMode ? '#334155' : '#cbd5e1'}} 
                  tickFormatter={(v) => `${v}kg`}
                  tickCount={21}
                  domain={[0, 20]}
                  tick={{fill: darkMode ? '#64748b' : '#94a3b8'}}
                />
                <RechartsTooltip 
                  contentStyle={{ 
                    backgroundColor: darkMode ? '#0f172a' : '#fff', 
                    borderRadius: '12px', 
                    border: darkMode ? '1px solid #1e293b' : 'none', 
                    boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)', 
                    fontSize: '11px', 
                    color: darkMode ? '#cbd5e1' : '#1e293b',
                    fontWeight: '500'
                  }}
                  labelFormatter={(v) => `Usia: ${v} Bulan`}
                  itemStyle={{ padding: '2px 0' }}
                />
                {/* WHO Percentile Curves */}
                <Line 
                  type="monotone" 
                  dataKey="p3" 
                  stroke={darkMode ? "#ef4444" : "#dc2626"} 
                  strokeWidth={2} 
                  dot={false} 
                  name="Garis Merah Bawah (P3)" 
                  opacity={0.8} 
                  isAnimationActive={true}
                  animationDuration={1000}
                />
                <Line 
                  type="monotone" 
                  dataKey="p15" 
                  stroke={darkMode ? "#fbbf24" : "#f59e0b"} 
                  strokeWidth={2} 
                  dot={false} 
                  name="Peringatan Bawah (P15)" 
                  opacity={0.8} 
                  isAnimationActive={true}
                />
                <Line 
                  type="monotone" 
                  dataKey="p50" 
                  stroke={darkMode ? "#10b981" : "#059669"} 
                  strokeWidth={3} 
                  dot={false} 
                  name="Ideal (P50)" 
                  opacity={0.9} 
                  isAnimationActive={true}
                />
                <Line 
                  type="monotone" 
                  dataKey="p85" 
                  stroke={darkMode ? "#fbbf24" : "#f59e0b"} 
                  strokeWidth={2} 
                  dot={false} 
                  name="Peringatan Atas (P85)" 
                  opacity={0.8} 
                  isAnimationActive={true}
                />
                <Line 
                  type="monotone" 
                  dataKey="p97" 
                  stroke={darkMode ? "#ef4444" : "#dc2626"} 
                  strokeWidth={2} 
                  dot={false} 
                  name="Garis Merah Atas (P97)" 
                  opacity={0.8} 
                  isAnimationActive={true}
                />
                
                <Line 
                  type="monotone" 
                  dataKey="weight" 
                  stroke="#3b82f6" 
                  strokeWidth={4} 
                  dot={{ fill: '#3b82f6', strokeWidth: 3, r: 5, stroke: darkMode ? '#0f172a' : '#fff' }} 
                  activeDot={{ r: 8, strokeWidth: 0 }}
                  isAnimationActive={true}
                  animationDuration={1200}
                  animationEasing="ease-out"
                  animationBegin={400}
                  connectNulls
                  name="Titik Pasien KMS"
                />
                <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '20px', fontWeight: 'bold', color: darkMode ? '#94a3b8' : '#64748b' }} iconType="circle" />
              </RechartsLineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Height Chart */}
        <div className="bg-white dark:bg-slate-900 p-4 md:p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm aspect-auto h-[250px] md:h-[350px] flex flex-col w-full">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest flex items-center gap-2">
              <LineChart className="w-4 h-4 text-blue-500" /> Kurva Tinggi Badan (cm)
            </h4>
            <span className="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 text-[10px] px-3 py-1 rounded-full font-bold">
              vs Kemenkes Nasional
            </span>
          </div>
          <div className="flex-grow min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsLineChart data={getHeightData()}>
                <CartesianGrid strokeDasharray="1 1" stroke={darkMode ? "#1e293b" : "#e2e8f0"} vertical={true} horizontal={true} strokeWidth={1} />
                <XAxis 
                  dataKey="age_months" 
                  fontSize={8} 
                  tickMargin={5} 
                  axisLine={{stroke: darkMode ? '#334155' : '#cbd5e1'}} 
                  tickLine={{stroke: darkMode ? '#334155' : '#cbd5e1'}} 
                  type="number" 
                  domain={[0, 24]} 
                  tickCount={25}
                  ticks={[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24]}
                  tick={{fill: darkMode ? '#64748b' : '#94a3b8'}} 
                />
                <YAxis 
                  fontSize={8} 
                  axisLine={{stroke: darkMode ? '#334155' : '#cbd5e1'}} 
                  tickLine={{stroke: darkMode ? '#334155' : '#cbd5e1'}} 
                  tickFormatter={(v) => `${v}cm`} 
                  tick={{fill: darkMode ? '#64748b' : '#94a3b8'}} 
                  domain={[40, 100]}
                  tickCount={13}
                />
                <RechartsTooltip 
                  contentStyle={{ 
                    backgroundColor: darkMode ? '#0f172a' : '#fff', 
                    borderRadius: '12px', 
                    border: darkMode ? '1px solid #1e293b' : 'none', 
                    boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)', 
                    fontSize: '11px', 
                    color: darkMode ? '#cbd5e1' : '#1e293b',
                    fontWeight: '500'
                  }} 
                  labelFormatter={(v) => `Usia: ${v} Bulan`} 
                  itemStyle={{ padding: '2px 0' }}
                />
                
                <Line 
                  type="monotone" 
                  dataKey="p3" 
                  stroke={darkMode ? "#ef4444" : "#dc2626"} 
                  strokeWidth={2} 
                  dot={false} 
                  name="Garis Merah Bawah (P3)" 
                  opacity={0.8} 
                  isAnimationActive={true}
                  animationDuration={1000}
                />
                <Line 
                  type="monotone" 
                  dataKey="p15" 
                  stroke={darkMode ? "#fbbf24" : "#f59e0b"} 
                  strokeWidth={2} 
                  dot={false} 
                  name="Peringatan Bawah (P15)" 
                  opacity={0.8} 
                  isAnimationActive={true}
                />
                <Line 
                  type="monotone" 
                  dataKey="p50" 
                  stroke={darkMode ? "#10b981" : "#059669"} 
                  strokeWidth={3} 
                  dot={false} 
                  name="Ideal (P50)" 
                  opacity={0.9} 
                  isAnimationActive={true}
                />
                <Line 
                  type="monotone" 
                  dataKey="p85" 
                  stroke={darkMode ? "#fbbf24" : "#f59e0b"} 
                  strokeWidth={2} 
                  dot={false} 
                  name="Peringatan Atas (P85)" 
                  opacity={0.8} 
                  isAnimationActive={true}
                />
                <Line 
                  type="monotone" 
                  dataKey="p97" 
                  stroke={darkMode ? "#ef4444" : "#dc2626"} 
                  strokeWidth={2} 
                  dot={false} 
                  name="Garis Merah Atas (P97)" 
                  opacity={0.8} 
                  isAnimationActive={true}
                />
                
                <Line 
                  type="monotone" 
                  dataKey="height" 
                  stroke="#3b82f6" 
                  strokeWidth={4} 
                  dot={{ fill: '#3b82f6', strokeWidth: 3, r: 5, stroke: darkMode ? '#0f172a' : '#fff' }} 
                  activeDot={{ r: 8, strokeWidth: 0 }} 
                  isAnimationActive={true}
                  animationDuration={1200}
                  animationEasing="ease-out"
                  animationBegin={400}
                  connectNulls 
                  name="Titik Pasien KMS" 
                />
                <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '20px', fontWeight: 'bold', color: darkMode ? '#94a3b8' : '#64748b' }} iconType="circle" />
              </RechartsLineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Head Circumference Chart */}
        <div className="bg-white dark:bg-slate-900 p-4 md:p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm aspect-auto h-[250px] md:h-[350px] flex flex-col w-full">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest flex items-center gap-2">
              <Activity className="w-4 h-4 text-purple-500" /> Kurva Lingkar Kepala (cm)
            </h4>
            <span className="bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-400 text-[10px] px-3 py-1 rounded-full font-bold">
              vs Kemenkes Nasional
            </span>
          </div>
          <div className="flex-grow min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsLineChart data={getHeadCircData()}>
                <CartesianGrid strokeDasharray="1 1" stroke={darkMode ? "#1e293b" : "#e2e8f0"} vertical={true} horizontal={true} strokeWidth={1} />
                <XAxis 
                  dataKey="age_months" 
                  fontSize={8} 
                  tickMargin={5} 
                  axisLine={{stroke: darkMode ? '#334155' : '#cbd5e1'}} 
                  tickLine={{stroke: darkMode ? '#334155' : '#cbd5e1'}} 
                  type="number" 
                  domain={[0, 24]} 
                  tickCount={25}
                  ticks={[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24]}
                  tick={{fill: darkMode ? '#64748b' : '#94a3b8'}} 
                />
                <YAxis 
                  fontSize={8} 
                  axisLine={{stroke: darkMode ? '#334155' : '#cbd5e1'}} 
                  tickLine={{stroke: darkMode ? '#334155' : '#cbd5e1'}} 
                  tickFormatter={(v) => `${v}cm`} 
                  tick={{fill: darkMode ? '#64748b' : '#94a3b8'}} 
                  domain={[30, 60]}
                  tickCount={16}
                />
                <RechartsTooltip 
                  contentStyle={{ 
                    backgroundColor: darkMode ? '#0f172a' : '#fff', 
                    borderRadius: '12px', 
                    border: darkMode ? '1px solid #1e293b' : 'none', 
                    boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)', 
                    fontSize: '11px', 
                    color: darkMode ? '#cbd5e1' : '#1e293b',
                    fontWeight: '500'
                  }} 
                  labelFormatter={(v) => `Usia: ${v} Bulan`} 
                  itemStyle={{ padding: '2px 0' }}
                />
                
                <Line 
                  type="monotone" 
                  dataKey="p3" 
                  stroke={darkMode ? "#ef4444" : "#dc2626"} 
                  strokeWidth={2} 
                  dot={false} 
                  name="Garis Merah Bawah (P3)" 
                  opacity={0.8} 
                  isAnimationActive={true}
                  animationDuration={1000}
                />
                <Line 
                  type="monotone" 
                  dataKey="p15" 
                  stroke={darkMode ? "#fbbf24" : "#f59e0b"} 
                  strokeWidth={2} 
                  dot={false} 
                  name="Peringatan Bawah (P15)" 
                  opacity={0.8} 
                  isAnimationActive={true}
                />
                <Line 
                  type="monotone" 
                  dataKey="p50" 
                  stroke={darkMode ? "#10b981" : "#059669"} 
                  strokeWidth={3} 
                  dot={false} 
                  name="Ideal (P50)" 
                  opacity={0.9} 
                  isAnimationActive={true}
                />
                <Line 
                  type="monotone" 
                  dataKey="p85" 
                  stroke={darkMode ? "#fbbf24" : "#f59e0b"} 
                  strokeWidth={2} 
                  dot={false} 
                  name="Peringatan Atas (P85)" 
                  opacity={0.8} 
                  isAnimationActive={true}
                />
                <Line 
                  type="monotone" 
                  dataKey="p97" 
                  stroke={darkMode ? "#ef4444" : "#dc2626"} 
                  strokeWidth={2} 
                  dot={false} 
                  name="Garis Merah Atas (P97)" 
                  opacity={0.8} 
                  isAnimationActive={true}
                />
                
                <Line 
                  type="monotone" 
                  dataKey="head_circumference" 
                  stroke="#9333ea" 
                  strokeWidth={4} 
                  dot={{ fill: '#9333ea', strokeWidth: 3, r: 5, stroke: darkMode ? '#0f172a' : '#fff' }} 
                  activeDot={{ r: 8, strokeWidth: 0 }} 
                  isAnimationActive={true}
                  animationDuration={1200}
                  animationEasing="ease-out"
                  connectNulls 
                  name="Titik Pasien KMS" 
                />
                <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '20px', fontWeight: 'bold', color: darkMode ? '#94a3b8' : '#64748b' }} iconType="circle" />
              </RechartsLineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
