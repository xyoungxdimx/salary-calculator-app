
import { SalaryInput, SalaryResult, CalculationDetails, TaxPolicy, CalculationMode } from '../types';
import * as C from '../constants';

const getTERRate = (kategori: 'A' | 'B' | 'C', bruto: number): number => {
    const table = C.TER_TABLES[kategori];
    for (const tier of table) {
        if (bruto <= tier.limit) {
            return tier.rate;
        }
    }
    return table[table.length - 1].rate;
};


const calculateOvertime = (gajiBulanan: number, jamKerja: number, jamLibur: number): number => {
    if (gajiBulanan <= 0 || (jamKerja <= 0 && jamLibur <= 0)) {
        return 0;
    }
    const upahPerJam = (1 / C.OVERTIME_BASE_RATE_DIVISOR) * gajiBulanan;
    
    let lemburKerja = 0;
    if (jamKerja > 0) {
        const jamPertama = Math.min(jamKerja, 1);
        lemburKerja += jamPertama * C.OVERTIME_WEEKDAY_FIRST_HOUR_MULTIPLIER * upahPerJam;
        
        const jamBerikutnya = Math.max(0, jamKerja - 1);
        lemburKerja += jamBerikutnya * C.OVERTIME_WEEKDAY_SUBSEQUENT_HOUR_MULTIPLIER * upahPerJam;
    }
    
    let lemburLibur = 0;
    if (jamLibur > 0) {
        // Asumsi 5 hari kerja seminggu
        const jamTier1 = Math.min(jamLibur, 8);
        lemburLibur += jamTier1 * C.OVERTIME_HOLIDAY_FIRST_8_HOURS_MULTIPLIER * upahPerJam;

        if (jamLibur > 8) {
            const jamTier2 = Math.min(jamLibur - 8, 1); // Jam ke-9
            lemburLibur += jamTier2 * C.OVERTIME_HOLIDAY_9TH_HOUR_MULTIPLIER * upahPerJam;
        }
        
        if (jamLibur > 9) {
            const jamTier3 = jamLibur - 9; // Jam ke-10 dst.
            lemburLibur += jamTier3 * C.OVERTIME_HOLIDAY_10TH_PLUS_HOUR_MULTIPLIER * upahPerJam;
        }
    }
    
    return lemburKerja + lemburLibur;
};

// Calculates number of full elapsed months.
const calculateFullMonths = (startDate: Date, endDate: Date): number => {
    if (endDate < startDate) return 0;

    const d1 = startDate.getDate();
    const m1 = startDate.getMonth();
    const y1 = startDate.getFullYear();

    const d2 = endDate.getDate();
    const m2 = endDate.getMonth();
    const y2 = endDate.getFullYear();

    let months = (y2 - y1) * 12;
    months += m2 - m1;

    // If the end day is before the start day, it's not a full month.
    if (d2 < d1) {
        months--;
    }

    return Math.max(0, months);
};


const calculateSalary = (input: SalaryInput): SalaryResult => {
  const { 
    gajiPokok, tunjanganTetap, tunjanganTidakTetap, tunjanganLain, bonus, 
    lemburJamKerja, lemburJamLibur, ptkpStatus, jkkRate, punyaNPWP,
    taxPolicy,
    includeTHR, includePKWT, contractStartDate, contractEndDate
  } = input;

  // --- Komponen Gaji & BPJS (Sama untuk semua metode) ---
  const gajiDasarBPJS = gajiPokok + tunjanganTetap;
  const upahLembur = calculateOvertime(gajiDasarBPJS, lemburJamKerja, lemburJamLibur);
  
  let thr = 0;
  if (includeTHR && contractStartDate) {
      const startDate = new Date(contractStartDate);
      const today = new Date();
      let eidDateFound = false;
      // Check current and next year for Eid date
      for (let i = 0; i < 2; i++) {
        const year = today.getFullYear() + i;
        if (C.EID_AL_FITR_DATES[year]) {
            const eidDate = new Date(C.EID_AL_FITR_DATES[year]);
            // Use the first upcoming Eid date
            if (eidDate >= today) {
                const serviceMonths = calculateFullMonths(startDate, eidDate);
                if (serviceMonths >= 12) {
                    thr = gajiPokok + tunjanganTetap;
                } else if (serviceMonths >= 1) {
                    thr = (serviceMonths / 12) * (gajiPokok + tunjanganTetap);
                }
                eidDateFound = true;
                break;
            }
        }
      }
  }

  let pkwtCompensation = 0;
  if (includePKWT && contractStartDate && contractEndDate) {
      const startDate = new Date(contractStartDate);
      const endDate = new Date(contractEndDate);
      const totalServiceMonths = calculateFullMonths(startDate, endDate);
      if (totalServiceMonths >= 1) pkwtCompensation = (totalServiceMonths / 12) * (gajiPokok + tunjanganTetap);
  }

  const iuranJKKPerusahaan = gajiDasarBPJS * jkkRate;
  const iuranJKMPerusahaan = gajiDasarBPJS * C.JKM_COMPANY_RATE;
  const iuranJHTPerusahaan = gajiDasarBPJS * C.JHT_COMPANY_RATE;
  const gajiDasarJKS = Math.min(gajiDasarBPJS, C.BPJS_KESEHATAN_SALARY_CAP);
  const iuranJKSPerusahaan = gajiDasarJKS * C.JKS_COMPANY_RATE;
  const iuranJKSKaryawan = gajiDasarJKS * C.JKS_EMPLOYEE_RATE;
  const gajiDasarJP = Math.min(gajiDasarBPJS, C.BPJS_PENSIUN_SALARY_CAP);
  const iuranJPPerusahaan = gajiDasarJP * C.JP_COMPANY_RATE;
  const iuranJPKaryawan = gajiDasarJP * C.JP_EMPLOYEE_RATE;
  const iuranJHTKaryawan = gajiDasarBPJS * C.JHT_EMPLOYEE_RATE;

  // --- Perhitungan PPh 21 (Metode TER) ---
  const brutoRutinSebulanNonTunjanganPajak = gajiPokok + tunjanganTetap + tunjanganTidakTetap + tunjanganLain + iuranJKKPerusahaan + iuranJKMPerusahaan + iuranJKSPerusahaan;
  const brutoTidakRutinBulanIni = bonus + upahLembur + thr + pkwtCompensation;
  const kategoriTER = C.PTKP_TO_TER_CATEGORY[ptkpStatus] || 'A';
  
  let tunjanganPajak = 0;
  let pph21 = 0;
  let terRate = 0;

  if (taxPolicy === TaxPolicy.GROSS_UP) {
      // --- Iterasi untuk Gross Up ---
      for (let i = 0; i < 15; i++) {
        const brutoBulanIni = brutoRutinSebulanNonTunjanganPajak + brutoTidakRutinBulanIni + tunjanganPajak;
        const currentTERRate = getTERRate(kategoriTER, brutoBulanIni);
        const pphTerbaru = brutoBulanIni * currentTERRate;
        
        terRate = currentTERRate;

        let pphDenganPenalty = pphTerbaru < 0 ? 0 : pphTerbaru;
        if (!punyaNPWP) {
          pphDenganPenalty *= C.NPWP_PENALTY_RATE;
        }

        if (Math.abs(pphDenganPenalty - tunjanganPajak) < 1) {
            tunjanganPajak = pphDenganPenalty; // final adjustment
            break;
        }
        tunjanganPajak = pphDenganPenalty;
      }
      pph21 = tunjanganPajak;
  } else { // TaxPolicy.GROSS
      tunjanganPajak = 0;
      const brutoBulanIni = brutoRutinSebulanNonTunjanganPajak + brutoTidakRutinBulanIni;
      terRate = getTERRate(kategoriTER, brutoBulanIni);
      const pphTerbaru = brutoBulanIni * terRate;

      let pphDenganPenalty = pphTerbaru < 0 ? 0 : pphTerbaru;
      if (!punyaNPWP) {
          pphDenganPenalty *= C.NPWP_PENALTY_RATE;
      }
      pph21 = pphDenganPenalty;
  }

  // --- Final Assembly ---
  const gajiTunjanganTetap = gajiPokok + tunjanganTetap;
  const tunjanganTidakTetapGrouped = tunjanganTidakTetap + tunjanganLain + bonus + upahLembur + thr + pkwtCompensation;
  const totalPendapatan = gajiTunjanganTetap + tunjanganTidakTetapGrouped;
  
  const iuranKaryawanTotal = iuranJHTKaryawan + iuranJPKaryawan + iuranJKSKaryawan;
  const potonganPPh21 = (taxPolicy === TaxPolicy.GROSS) ? pph21 : 0; // PPh 21 only deducted in Gross method
  const totalPotongan = iuranKaryawanTotal + potonganPPh21;

  const takeHomePay = totalPendapatan - totalPotongan;
  
  const totalIuranPerusahaan = iuranJHTPerusahaan + iuranJPPerusahaan + iuranJKKPerusahaan + iuranJKMPerusahaan + iuranJKSPerusahaan;
  const totalCostOfCompany = totalPendapatan + totalIuranPerusahaan + tunjanganPajak;
  const totalPenghasilanBruto = totalPendapatan + iuranJKKPerusahaan + iuranJKMPerusahaan + iuranJKSPerusahaan + tunjanganPajak;
  
  // Perhitungan Rate Gaji
  const rateGajiPerHari = totalPendapatan > 0 ? totalPendapatan / C.WORKING_DAYS_PER_MONTH : 0;
  const rateGajiPerJam = rateGajiPerHari > 0 ? rateGajiPerHari / C.WORKING_HOURS_PER_DAY : 0;


  const details: CalculationDetails = {
    gajiPokok, tunjanganTetap, tunjanganTidakTetap, tunjanganLain, upahLembur, bonus, thr, pkwtCompensation,
    gajiTunjanganTetap, tunjanganTidakTetapGrouped,
    premiJKK: iuranJKKPerusahaan, premiJKM: iuranJKMPerusahaan, premiJKS: iuranJKSPerusahaan,
    tunjanganPajak, totalPenghasilanBruto,
    kategoriTER, terRate,
    pph21,
    potonganJHT: iuranJHTKaryawan, potonganJP: iuranJPKaryawan, potonganJKS: iuranJKSKaryawan,
    potonganPPh21: pph21, // For display purposes, always show the calculated tax
    totalPotongan,
    iuranJHTPerusahaan, iuranJPPerusahaan, iuranJKKPerusahaan, iuranJKMPerusahaan, iuranJKSPerusahaan,
    totalCostOfCompany,
    rateGajiPerHari, rateGajiPerJam,
    jkkRate,
  };

  return { takeHomePay, details };
};


const calculateFromTakeHomePay = (input: SalaryInput): SalaryResult | null => {
    const targetTHP = input.desiredTakeHomePay;
    if (targetTHP <= 0) return null;

    let lowGuess = targetTHP * 0.8;
    let highGuess = targetTHP * 1.5;
    let currentInput = { ...input };

    for (let i = 0; i < 20; i++) { // Max 20 iterations using binary search for stability
        let midGuess = (lowGuess + highGuess) / 2;
        currentInput = { ...input, gajiPokok: midGuess, tunjanganTetap: 0, tunjanganTidakTetap: 0, tunjanganLain: 0, bonus: 0, lemburJamKerja: 0, lemburJamLibur: 0, includeTHR: false, includePKWT: false };

        const result = calculateSalary(currentInput);
        const currentTHP = result.takeHomePay;
        const error = targetTHP - currentTHP;

        if (Math.abs(error) < 1) { 
            return result;
        }

        if (error > 0) { // Current THP is too low, need higher gross
            lowGuess = midGuess;
        } else { // Current THP is too high, need lower gross
            highGuess = midGuess;
        }
    }
    
    currentInput.gajiPokok = (lowGuess + highGuess) / 2;
    return calculateSalary(currentInput); // Return the last attempt
};

const calculateFromBudget = (input: SalaryInput): SalaryResult | null => {
    const targetBudget = input.totalBudget;
    if (targetBudget <= 0) return null;

    let lowGuess = targetBudget * 0.5;
    let highGuess = targetBudget;
    let currentInput = { ...input };

    for (let i = 0; i < 20; i++) {
        let midGuess = (lowGuess + highGuess) / 2;
        currentInput = { ...input, gajiPokok: midGuess, tunjanganTetap: 0, tunjanganTidakTetap: 0, tunjanganLain: 0, bonus: 0, lemburJamKerja: 0, lemburJamLibur: 0, includeTHR: false, includePKWT: false };
        
        const result = calculateSalary(currentInput);
        const currentBudget = result.details.totalCostOfCompany;
        const error = targetBudget - currentBudget;

        if (Math.abs(error) < 1) {
            return result;
        }

        if (error > 0) { // Current budget is too low, need higher gross
            lowGuess = midGuess;
        } else { // Current budget is too high, need lower gross
            highGuess = midGuess;
        }
    }
    
    currentInput.gajiPokok = (lowGuess + highGuess) / 2;
    return calculateSalary(currentInput);
};


export const performCalculation = (mode: CalculationMode, input: SalaryInput): SalaryResult | null => {
    switch(mode) {
        case CalculationMode.GROSS_TO_NET:
            return calculateSalary(input);
        case CalculationMode.BUDGET_TO_NET:
            return calculateFromBudget(input);
        case CalculationMode.NET_TO_GROSS:
            return calculateFromTakeHomePay(input);
        default:
            return null;
    }
};