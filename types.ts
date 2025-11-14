// PTKP Status (Status Perkawinan dan Tanggungan)
export enum PTKPStatus {
  TK0 = "TK/0", // Tidak Kawin, 0 Tanggungan
  TK1 = "TK/1",
  TK2 = "TK/2",
  TK3 = "TK/3",
  K0 = "K/0",   // Kawin, 0 Tanggungan
  K1 = "K/1",
  K2 = "K/2",
  K3 = "K/3",
  KI0 = "K/I/0", // Kawin, Istri Bekerja/Penghasilan Digabung, 0 Tanggungan
  KI1 = "K/I/1",
  KI2 = "K/I/2",
  KI3 = "K/I/3",
}

// JKK Risk Level (Tingkat Risiko Jaminan Kecelakaan Kerja)
export enum JKKRate {
  VERY_LOW = 0.0024,
  LOW = 0.0054,
  MEDIUM = 0.0089,
  HIGH = 0.0127,
  VERY_HIGH = 0.0174,
}

// Metode Perhitungan PPh 21
export enum TaxPolicy {
  GROSS = "GROSS", // Pajak ditanggung karyawan
  GROSS_UP = "GROSS_UP", // Perusahaan memberikan tunjangan pajak
}

// Tipe mode kalkulasi
export enum CalculationMode {
  GROSS_TO_NET = "gross-to-net", // Dari Gaji Bruto ke Gaji Bersih
  BUDGET_TO_NET = "budget-to-net", // Dari Budget Perusahaan ke Gaji Bersih
  NET_TO_GROSS = "net-to-gross", // Dari Gaji Bersih ke Gaji Bruto
}

// Input data from the form
export interface SalaryInput {
  gajiPokok: number;
  tunjanganTetap: number;
  tunjanganTidakTetap: number;
  tunjanganLain: number;
  bonus: number;
  lemburJamKerja: number;
  lemburJamLibur: number;
  ptkpStatus: PTKPStatus;
  jkkRate: JKKRate;
  punyaNPWP: boolean;
  taxPolicy: TaxPolicy;
  
  // Opsi Tambahan
  includeTHR: boolean;
  includePKWT: boolean;
  contractStartDate: string; // YYYY-MM-DD
  contractEndDate: string; // YYYY-MM-DD

  // Fields for reverse calculation modes
  totalBudget: number;
  desiredTakeHomePay: number;
}

// Fix: Define and export the SalaryResult interface which was causing import errors.
// The result of the salary calculation
export interface SalaryResult {
  takeHomePay: number;
  details: CalculationDetails;
}

// Detailed calculation breakdown for display
export interface CalculationDetails {
  // Komponen Gaji (Input & Prorate)
  gajiPokok: number;
  tunjanganTetap: number;
  tunjanganTidakTetap: number;
  tunjanganLain: number;
  upahLembur: number;
  bonus: number;
  thr: number;
  pkwtCompensation: number;
  
  // Komponen Gaji (Tergabung untuk Display)
  gajiTunjanganTetap: number;
  tunjanganTidakTetapGrouped: number;

  // Premi & Tunjangan dari Perusahaan (Komponen Bruto)
  premiJKK: number;
  premiJKM: number;
  premiJKS: number;
  tunjanganPajak: number;
  totalPenghasilanBruto: number; // Bruto PPh 21

  // Rincian Perhitungan PPh 21 (TER)
  kategoriTER: 'A' | 'B' | 'C' | 'N/A';
  terRate: number;
  pph21: number; // Final PPh untuk bulan ini

  // Potongan Karyawan
  potonganJHT: number;
  potonganJP: number;
  potonganJKS: number;
  potonganPPh21: number;
  totalPotongan: number;

  // Iuran Perusahaan
  iuranJHTPerusahaan: number;
  iuranJPPerusahaan: number;
  iuranJKKPerusahaan: number;
  iuranJKMPerusahaan: number;
  iuranJKSPerusahaan: number;
  
  // Total Biaya Perusahaan
  totalCostOfCompany: number;
  
  // Informasi Rate Gaji
  rateGajiPerHari: number;
  rateGajiPerJam: number;

  // Detail Lembur
  jkkRate: number;
}
