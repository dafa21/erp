
export interface GrowthPoint {
  age_months: number;
  p3: number;
  p15: number;
  p50: number;
  p85: number;
  p97: number;
}

export const WHO_WEIGHT_BOYS: GrowthPoint[] = [
  { age_months: 0, p3: 2.4, p15: 2.9, p50: 3.3, p85: 3.9, p97: 4.4 },
  { age_months: 1, p3: 3.4, p15: 3.9, p50: 4.5, p85: 5.1, p97: 5.8 },
  { age_months: 2, p3: 4.3, p15: 4.9, p50: 5.6, p85: 6.3, p97: 7.1 },
  { age_months: 3, p3: 5.0, p15: 5.7, p50: 6.4, p85: 7.2, p97: 8.0 },
  { age_months: 4, p3: 5.6, p15: 6.3, p50: 7.0, p85: 7.9, p97: 8.7 },
  { age_months: 5, p3: 6.0, p15: 6.8, p50: 7.5, p85: 8.4, p97: 9.3 },
  { age_months: 6, p3: 6.4, p15: 7.1, p50: 7.9, p85: 8.8, p97: 9.8 },
  { age_months: 8, p3: 6.9, p15: 7.7, p50: 8.6, p85: 9.6, p97: 10.7 },
  { age_months: 10, p3: 7.4, p15: 8.2, p50: 9.2, p85: 10.2, p97: 11.4 },
  { age_months: 12, p3: 7.7, p15: 8.6, p50: 9.6, p85: 10.8, p97: 12.0 },
  { age_months: 15, p3: 8.3, p15: 9.2, p50: 10.3, p85: 11.5, p97: 12.8 },
  { age_months: 18, p3: 8.8, p15: 9.8, p50: 10.9, p85: 12.2, p97: 13.7 },
  { age_months: 21, p3: 9.2, p15: 10.3, p50: 11.5, p85: 12.9, p97: 14.5 },
  { age_months: 24, p3: 9.7, p15: 10.8, p50: 12.2, p85: 13.6, p97: 15.3 }
];

export const WHO_WEIGHT_GIRLS: GrowthPoint[] = [
  { age_months: 0, p3: 2.4, p15: 2.8, p50: 3.2, p85: 3.7, p97: 4.2 },
  { age_months: 1, p3: 3.2, p15: 3.6, p50: 4.2, p85: 4.8, p97: 5.5 },
  { age_months: 2, p3: 3.9, p15: 4.5, p50: 5.1, p85: 5.8, p97: 6.6 },
  { age_months: 3, p3: 4.5, p15: 5.1, p50: 5.8, p85: 6.6, p97: 7.5 },
  { age_months: 4, p3: 5.0, p15: 5.6, p50: 6.4, p85: 7.3, p97: 8.2 },
  { age_months: 5, p3: 5.4, p15: 6.1, p50: 6.9, p85: 7.8, p97: 8.8 },
  { age_months: 6, p3: 5.7, p15: 6.5, p50: 7.3, p85: 8.3, p97: 9.3 },
  { age_months: 8, p3: 6.3, p15: 7.0, p50: 7.9, p85: 9.0, p97: 10.2 },
  { age_months: 10, p3: 6.7, p15: 7.5, p50: 8.5, p85: 9.6, p97: 10.9 },
  { age_months: 12, p3: 7.0, p15: 7.9, p50: 8.9, p85: 10.1, p97: 11.5 },
  { age_months: 15, p3: 7.6, p15: 8.5, p50: 9.6, p85: 10.9, p97: 12.4 },
  { age_months: 18, p3: 8.1, p15: 9.1, p50: 10.2, p85: 11.6, p97: 13.2 },
  { age_months: 21, p3: 8.6, p15: 9.6, p50: 10.9, p85: 12.4, p97: 14.1 },
  { age_months: 24, p3: 9.0, p15: 10.2, p50: 11.5, p85: 13.1, p97: 14.8 }
];

export const WHO_HEIGHT_BOYS: GrowthPoint[] = [
  { age_months: 0, p3: 46.1, p15: 48.0, p50: 49.9, p85: 51.8, p97: 53.7 },
  { age_months: 3, p3: 57.3, p15: 59.4, p50: 61.4, p85: 63.5, p97: 65.5 },
  { age_months: 6, p3: 63.3, p15: 65.5, p50: 67.6, p85: 69.8, p97: 71.9 },
  { age_months: 9, p3: 67.5, p15: 69.7, p50: 72.0, p85: 74.2, p97: 76.5 },
  { age_months: 12, p3: 71.0, p15: 73.4, p50: 75.7, p85: 78.1, p97: 80.5 },
  { age_months: 18, p3: 76.9, p15: 79.6, p50: 82.3, p85: 85.0, p97: 87.7 },
  { age_months: 24, p3: 81.7, p15: 84.8, p50: 87.8, p85: 90.9, p97: 93.9 }
];

export const WHO_HEIGHT_GIRLS: GrowthPoint[] = [
  { age_months: 0, p3: 45.4, p15: 47.3, p50: 49.1, p85: 51.0, p97: 52.9 },
  { age_months: 3, p3: 55.6, p15: 57.7, p50: 59.8, p85: 61.9, p97: 64.0 },
  { age_months: 6, p3: 61.2, p15: 63.5, p50: 65.7, p85: 68.0, p97: 70.3 },
  { age_months: 9, p3: 65.3, p15: 67.7, p50: 70.1, p85: 72.6, p97: 75.0 },
  { age_months: 12, p3: 68.9, p15: 71.4, p50: 74.0, p85: 76.6, p97: 79.2 },
  { age_months: 18, p3: 74.9, p15: 77.8, p50: 80.7, p85: 83.6, p97: 86.5 },
  { age_months: 24, p3: 80.0, p15: 83.2, p50: 86.4, p85: 89.6, p97: 92.9 }
];

export const WHO_HEAD_CIRC_BOYS: GrowthPoint[] = [
  { age_months: 0, p3: 32.1, p15: 33.3, p50: 34.5, p85: 35.7, p97: 36.9 },
  { age_months: 3, p3: 38.2, p15: 39.3, p50: 40.5, p85: 41.7, p97: 42.8 },
  { age_months: 6, p3: 41.3, p15: 42.1, p50: 43.3, p85: 44.5, p97: 45.3 },
  { age_months: 12, p3: 44.1, p15: 45.1, p50: 46.1, p85: 47.1, p97: 48.1 },
  { age_months: 24, p3: 46.6, p15: 47.5, p50: 48.5, p85: 49.5, p97: 50.4 }
];

export const WHO_HEAD_CIRC_GIRLS: GrowthPoint[] = [
  { age_months: 0, p3: 31.7, p15: 32.8, p50: 33.9, p85: 35.0, p97: 36.1 },
  { age_months: 3, p3: 37.2, p15: 38.3, p50: 39.5, p85: 40.7, p97: 41.8 },
  { age_months: 6, p3: 40.0, p15: 41.1, p50: 42.2, p85: 43.3, p97: 44.4 },
  { age_months: 12, p3: 42.9, p15: 43.9, p50: 44.9, p85: 45.9, p97: 46.9 },
  { age_months: 24, p3: 45.6, p15: 46.4, p50: 47.4, p85: 48.4, p97: 49.2 }
];
