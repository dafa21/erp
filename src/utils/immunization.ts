export const IMMUNIZATION_SCHEDULE = [
  { month: 0, name: 'Hepatitis B0', label: 'Saat Lahir' },
  { month: 0, name: 'BCG', label: '0-1 Bulan' },
  { month: 0, name: 'Polio 0', label: '0-1 Bulan' },
  { month: 2, name: 'DPT-HB-Hib 1', label: '2 Bulan' },
  { month: 2, name: 'Polio 1', label: '2 Bulan' },
  { month: 2, name: 'PCV 1', label: '2 Bulan' },
  { month: 2, name: 'Rotavirus 1', label: '2 Bulan' },
  { month: 3, name: 'DPT-HB-Hib 2', label: '3 Bulan' },
  { month: 3, name: 'Polio 2', label: '3 Bulan' },
  { month: 3, name: 'PCV 2', label: '3 Bulan' },
  { month: 3, name: 'Rotavirus 2', label: '3 Bulan' },
  { month: 4, name: 'DPT-HB-Hib 3', label: '4 Bulan' },
  { month: 4, name: 'Polio 3', label: '4 Bulan' },
  { month: 4, name: 'IPV', label: '4 Bulan' },
  { month: 4, name: 'PCV 3', label: '4 Bulan' },
  { month: 9, name: 'Campak Rubella (MR)', label: '9 Bulan' },
];

export function getAgeInMonths(birthDateStr: string): number {
  if (!birthDateStr) return 0;
  const birthDate = new Date(birthDateStr);
  const now = new Date();
  let months = (now.getFullYear() - birthDate.getFullYear()) * 12;
  months -= birthDate.getMonth();
  months += now.getMonth();
  return months <= 0 ? 0 : months;
}

export function getChildImmunizationStatus(birthDateStr: string, immunizations: any[] | undefined) {
  const ageMonths = getAgeInMonths(birthDateStr);
  const givenVaccines = (immunizations || []).map((i: any) => i.vaccine_name.toLowerCase());

  let missed = [];
  let upcoming = [];
  let completed = [];

  IMMUNIZATION_SCHEDULE.forEach(schedule => {
    const isGiven = givenVaccines.some(v => v.includes(schedule.name.toLowerCase()) || schedule.name.toLowerCase().includes(v));
    
    if (isGiven) {
      completed.push(schedule);
    } else if (ageMonths > schedule.month) {
      missed.push(schedule);
    } else {
      upcoming.push(schedule);
    }
  });

  return { missed, upcoming, completed, ageMonths };
}
