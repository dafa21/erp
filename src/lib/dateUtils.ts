export const parseDatabaseDate = (dateVal: any): Date => {
  if (!dateVal) return new Date(""); // invalid date
  if (dateVal instanceof Date) return dateVal;
  if (typeof dateVal === 'string') {
    if (dateVal.match(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/)) {
      const p = dateVal.split(/[- :]/);
      return new Date(Date.UTC(parseInt(p[0]), parseInt(p[1])-1, parseInt(p[2]), parseInt(p[3]), parseInt(p[4]), parseInt(p[5])));
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
  
  // Try to determine if it has a time component
  let hasTime = false;
  if (dateVal instanceof Date) {
    hasTime = true;
  } else if (typeof dateVal === 'string' && (dateVal.includes(':') || dateVal.includes('T'))) {
    hasTime = true;
  } else if (typeof dateVal === 'number') {
    hasTime = true;
  }

  if (!hasTime) {
    return dStr;
  }

  const tStr = formatIDTimeShort(dateVal);
  if (dStr === '-' || tStr === '-') return dStr;
  return `${dStr} ${tStr}`;
};
