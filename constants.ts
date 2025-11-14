// Batas Atas Gaji untuk BPJS
export const BPJS_KESEHATAN_SALARY_CAP = 12000000;
export const BPJS_PENSIUN_SALARY_CAP = 10053400; // As of 2024

// Persentase Iuran BPJS
export const JHT_EMPLOYEE_RATE = 0.02; // 2%
export const JHT_COMPANY_RATE = 0.037; // 3.7%
export const JP_EMPLOYEE_RATE = 0.01; // 1%
export const JP_COMPANY_RATE = 0.02; // 2%
export const JKM_COMPANY_RATE = 0.003; // 0.3%
export const JKS_EMPLOYEE_RATE = 0.01; // 1%
export const JKS_COMPANY_RATE = 0.04; // 4%

// Konstanta PPh 21
export const BIAYA_JABATAN_RATE = 0.05; // 5%
export const BIAYA_JABATAN_MAX_MONTHLY = 500000;
export const BIAYA_JABATAN_MAX_YEARLY = 6000000;
export const NPWP_PENALTY_RATE = 1.20; // 20% higher tax for non-NPWP holders

// Tarif PTKP (Penghasilan Tidak Kena Pajak) per tahun
export const PTKP_RATES: { [key: string]: number } = {
  TK0: 54000000,
  TK1: 58500000,
  TK2: 63000000,
  TK3: 67500000,
  K0: 58500000,
  K1: 63000000,
  K2: 67500000,
  K3: 72000000,
  KI0: 112500000, // PTKP Istri + PTKP Suami (asumsi suami K0)
  KI1: 117000000,
  KI2: 121500000,
  KI3: 126000000,
};

// Layer Tarif PPh 21 Progresif (UU HPP)
export const PPH21_BRACKETS = [
  { limit: 60000000, rate: 0.05 },
  { limit: 250000000, rate: 0.15 },
  { limit: 500000000, rate: 0.25 },
  { limit: 5000000000, rate: 0.30 },
  { limit: Infinity, rate: 0.35 },
];

// Konstanta Perhitungan Lembur (UU Cipta Kerja)
export const OVERTIME_BASE_RATE_DIVISOR = 173;
export const OVERTIME_WEEKDAY_FIRST_HOUR_MULTIPLIER = 1.5;
export const OVERTIME_WEEKDAY_SUBSEQUENT_HOUR_MULTIPLIER = 2.0;
// Untuk 5 hari kerja/minggu
export const OVERTIME_HOLIDAY_FIRST_8_HOURS_MULTIPLIER = 2.0;
export const OVERTIME_HOLIDAY_9TH_HOUR_MULTIPLIER = 3.0;
export const OVERTIME_HOLIDAY_10TH_PLUS_HOUR_MULTIPLIER = 4.0;


// Konstanta Rate Gaji
export const WORKING_DAYS_PER_MONTH = 22;
export const WORKING_HOURS_PER_DAY = 8;

// Tanggal Hari Raya Idul Fitri (Hari Pertama)
export const EID_AL_FITR_DATES: { [year: number]: string } = {
    2024: '2024-04-10',
    2025: '2025-03-31',
    2026: '2026-03-20',
    2027: '2027-03-09',
};

// Mapping PTKP to TER Category (PMK 168/2023)
export const PTKP_TO_TER_CATEGORY: { [key: string]: 'A' | 'B' | 'C' } = {
  'TK/0': 'A', 'TK/1': 'A', 'K/0': 'A',
  'TK/2': 'B', 'TK/3': 'B', 'K/1': 'B', 'K/2': 'B',
  'K/3': 'C',
  'K/I/0': 'A', 'K/I/1': 'A', 
  'K/I/2': 'B', 'K/I/3': 'C'
};

// Tarif Efektif Rata-rata (TER) Bulanan - PMK 168/2023
// Based on Penghasilan Bruto Bulanan
const createTERTable = (entries: [number, number][]): { limit: number, rate: number }[] => {
    return entries.map(([limit, rate]) => ({ limit, rate: rate / 100 }));
};

export const TER_A = createTERTable([
    [5400000, 0], [5650000, 0.25], [5950000, 0.5], [6300000, 0.75], [6750000, 1],
    [7500000, 1.25], [8550000, 1.5], [9650000, 1.75], [10050000, 2], [10350000, 2.25],
    [10700000, 2.5], [11600000, 3], [12500000, 4], [13750000, 5], [15100000, 6],
    [16950000, 7], [19750000, 8], [24150000, 9], [26450000, 10], [28000000, 11],
    [30050000, 12], [32400000, 13], [35400000, 14], [39100000, 15], [43850000, 16],
    [47800000, 17], [51400000, 18], [56300000, 19], [62300000, 20], [68600000, 21],
    [77500000, 22], [89000000, 23], [103000000, 24], [125000000, 25], [157000000, 26],
    [206000000, 27], [337000000, 28], [454000000, 29], [550000000, 30], [695000000, 31],
    [910000000, 32], [1400000000, 33], [Infinity, 34]
]);

export const TER_B = createTERTable([
    [6200000, 0], [6500000, 0.25], [6850000, 0.5], [7300000, 0.75], [8500000, 1],
    [9750000, 1.5], [10750000, 2], [11250000, 2.25], [11600000, 2.5], [12600000, 3],
    [13600000, 4], [14950000, 5], [16400000, 6], [18400000, 7], [20600000, 8],
    [22700000, 9], [27700000, 10], [29350000, 11], [33950000, 12], [37100000, 13],
    [41100000, 14], [45800000, 15], [49500000, 16], [53800000, 17], [59500000, 18],
    [64000000, 19], [71000000, 20], [80000000, 21], [93000000, 22], [109000000, 23],
    [129000000, 24], [163000000, 25], [211000000, 26], [274000000, 27], [359000000, 28],
    [459000000, 29], [555000000, 30], [704000000, 31], [957000000, 32], [1405000000, 33],
    [Infinity, 34]
]);

export const TER_C = createTERTable([
    [6600000, 0], [6950000, 0.25], [7350000, 0.5], [7800000, 0.75], [8850000, 1],
    [9800000, 1.25], [10950000, 1.5], [11200000, 1.75], [12050000, 2], [12950000, 3],
    [14150000, 4], [15550000, 5], [17050000, 6], [19500000, 7], [22700000, 8],
    [26600000, 9], [28100000, 10], [30100000, 11], [32600000, 12], [35400000, 13],
    [38900000, 14], [43000000, 15], [47400000, 16], [51200000, 17], [55800000, 18],
    [60400000, 19], [66700000, 20], [74500000, 21], [83200000, 22], [95600000, 23],
    [110000000, 24], [134000000, 25], [169000000, 26], [221000000, 27], [390000000, 28],
    [463000000, 29], [561000000, 30], [709000000, 31], [965000000, 32], [1419000000, 33],
    [Infinity, 34]
]);

export const TER_TABLES = {
    A: TER_A,
    B: TER_B,
    C: TER_C,
};