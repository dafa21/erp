export const parseDatabaseDate = (dateVal: any): Date => {
  if (!dateVal) return new Date(NaN);
  if (dateVal instanceof Date) return dateVal;
  if (typeof dateVal === 'number') return new Date(dateVal);
  
  if (typeof dateVal === 'string') {
    const str = dateVal.trim();
    if (/^\d+$/.test(str)) {
      return new Date(parseInt(str, 10));
    }
    if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
      const hasZone = str.includes('Z') || /[\+\-]\d{2}/.test(str.substring(10)) || /GMT|UTC/i.test(str);
      if (!hasZone) {
        const isoStr = str.replace(' ', 'T') + 'Z';
        const d = new Date(isoStr);
        if (!isNaN(d.getTime())) {
          return d;
        }
      }
    }
  }
  return new Date(dateVal);
};

export const formatIDDate = (dateVal: any): string => {
  if (!dateVal) return '-';
  try {
    const d = parseDatabaseDate(dateVal);
    if (isNaN(d.getTime())) return '-';
    
    let timeZone = undefined;
    try {
      const systemTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (systemTimeZone && (
        systemTimeZone.startsWith('Asia/Jakarta') || systemTimeZone.startsWith('Asia/Pontianak') || systemTimeZone.startsWith('Asia/Surabaya') ||
        systemTimeZone.startsWith('Asia/Makassar') || systemTimeZone.startsWith('Asia/Denpasar') ||
        systemTimeZone.startsWith('Asia/Jayapura')
      )) {
        timeZone = systemTimeZone;
      } else {
        timeZone = 'Asia/Jakarta';
      }
    } catch (e) {
      timeZone = 'Asia/Jakarta';
    }

    const dateParts = new Intl.DateTimeFormat('id-ID', {
      timeZone,
      day: 'numeric',
      month: 'numeric',
      year: 'numeric'
    }).formatToParts(d);
    
    const dayVal = dateParts.find(p => p.type === 'day')?.value || '1';
    const monthVal = dateParts.find(p => p.type === 'month')?.value || '1';
    const yearVal = dateParts.find(p => p.type === 'year')?.value || '2026';
    
    const day = String(dayVal).padStart(2, '0');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'];
    const monthIdx = parseInt(monthVal, 10) - 1;
    const month = months[monthIdx] || 'Jan';
    
    return `${day}-${month}-${yearVal}`;
  } catch (e) {
    return '-';
  }
};

export const formatIDTime = (dateVal: any): string => {
  if (!dateVal) return '-';
  try {
    const d = parseDatabaseDate(dateVal);
    if (isNaN(d.getTime())) return '-';
    
    let timeZone = undefined;
    let tzSuffix = 'WIB';
    
    try {
      const systemTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (systemTimeZone && (systemTimeZone.startsWith('Asia/Jakarta') || systemTimeZone.startsWith('Asia/Pontianak') || systemTimeZone.startsWith('Asia/Surabaya'))) {
        timeZone = systemTimeZone;
        tzSuffix = 'WIB';
      } else if (systemTimeZone && (systemTimeZone.startsWith('Asia/Makassar') || systemTimeZone.startsWith('Asia/Ujung_Pandang') || systemTimeZone.startsWith('Asia/Denpasar'))) {
        timeZone = systemTimeZone;
        tzSuffix = 'WITA';
      } else if (systemTimeZone && (systemTimeZone.startsWith('Asia/Jayapura') || systemTimeZone.startsWith('Asia/Dili'))) {
        timeZone = systemTimeZone;
        tzSuffix = 'WIT';
      } else {
        timeZone = 'Asia/Jakarta';
        tzSuffix = 'WIB';
      }
    } catch (e) {
      timeZone = 'Asia/Jakarta';
      tzSuffix = 'WIB';
    }

    const timeParts = new Intl.DateTimeFormat('id-ID', {
      timeZone,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).formatToParts(d);
    
    const hours = timeParts.find(p => p.type === 'hour')?.value || '00';
    const minutes = timeParts.find(p => p.type === 'minute')?.value || '00';
    const seconds = timeParts.find(p => p.type === 'second')?.value || '00';
    
    return `${hours}:${minutes}:${seconds} ${tzSuffix}`;
  } catch (e) {
    return '-';
  }
};

export const formatIDTimeShort = (dateVal: any): string => {
  if (!dateVal) return '-';
  try {
    const d = parseDatabaseDate(dateVal);
    if (isNaN(d.getTime())) return '-';
    
    let timeZone = undefined;
    let tzSuffix = 'WIB';
    
    try {
      const systemTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (systemTimeZone && (systemTimeZone.startsWith('Asia/Jakarta') || systemTimeZone.startsWith('Asia/Pontianak') || systemTimeZone.startsWith('Asia/Surabaya'))) {
        timeZone = systemTimeZone;
        tzSuffix = 'WIB';
      } else if (systemTimeZone && (systemTimeZone.startsWith('Asia/Makassar') || systemTimeZone.startsWith('Asia/Ujung_Pandang') || systemTimeZone.startsWith('Asia/Denpasar'))) {
        timeZone = systemTimeZone;
        tzSuffix = 'WITA';
      } else if (systemTimeZone && (systemTimeZone.startsWith('Asia/Jayapura') || systemTimeZone.startsWith('Asia/Dili'))) {
        timeZone = systemTimeZone;
        tzSuffix = 'WIT';
      } else {
        timeZone = 'Asia/Jakarta';
        tzSuffix = 'WIB';
      }
    } catch (e) {
      timeZone = 'Asia/Jakarta';
      tzSuffix = 'WIB';
    }

    const timeParts = new Intl.DateTimeFormat('id-ID', {
      timeZone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).formatToParts(d);
    
    const hours = timeParts.find(p => p.type === 'hour')?.value || '00';
    const minutes = timeParts.find(p => p.type === 'minute')?.value || '00';
    
    return `${hours}:${minutes} ${tzSuffix}`;
  } catch (e) {
    return '-';
  }
};

export const formatIDDateTime = (dateVal: any): string => {
  if (!dateVal) return '-';
  const dStr = formatIDDate(dateVal);
  const tStr = formatIDTimeShort(dateVal);
  if (dStr === '-' || tStr === '-') return '-';
  return `${dStr} ${tStr}`;
};
