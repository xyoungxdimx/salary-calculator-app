import React from 'react';
import { SalaryResult } from '../types';
import { Card } from './ui/Card';
import { InfoRow, formatCurrency } from './ui/InfoRow';

interface ResultDisplayProps {
  result: SalaryResult | null;
}

const ResultSection: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({ title, children, className }) => (
  <div className={className}>
    <h3 className="text-md font-semibold text-gray-600 dark:text-gray-400 mb-2 mt-4">{title}</h3>
    <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg space-y-1">
      {children}
    </div>
  </div>
);

const PPh21TERDisplay: React.FC<{ details: SalaryResult['details'] }> = ({ details }) => (
    <>
        <InfoRow label="Metode" value="Tarif Efektif Rata-rata (TER)" />
        <ResultSection title="Perhitungan PPh 21 TER">
             <InfoRow label="Penghasilan Bruto (DPP)" value={details.totalPenghasilanBruto} />
             <InfoRow label="Kategori TER" value={details.kategoriTER} />
             <InfoRow label="Tarif Efektif" value={`${(details.terRate * 100).toFixed(2)} %`} />
             <InfoRow label="PPh 21 Bulan Ini" value={details.pph21} isTotal />
         </ResultSection>
    </>
);

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ result }) => {
  if (!result) {
    return (
      <Card title="Hasil Perhitungan">
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <svg className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 14h.01M12 10v-3m0 0l-3 3m3-3l3 3m-6 0h6m-6 3h6m-6 3h6" />
          </svg>
          <p className="text-gray-500 dark:text-gray-400">Hasil perhitungan akan muncul di sini.</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Silakan isi data di sebelah kiri dan klik tombol "Hitung Gaji".</p>
        </div>
      </Card>
    );
  }

  const { takeHomePay, details } = result;
  const totalPendapatan = details.gajiPokok + details.tunjanganTetap + details.tunjanganTidakTetap + details.tunjanganLain + details.upahLembur + details.bonus + details.thr + details.pkwtCompensation;

  const NonFixedComponents: React.FC = () => (
    <>
      {details.tunjanganTidakTetap > 0 && <InfoRow label="Tunj. Tidak Tetap" value={details.tunjanganTidakTetap} />}
      {details.tunjanganLain > 0 && <InfoRow label="Lain-lain" value={details.tunjanganLain} />}
      {details.bonus > 0 && <InfoRow label="Bonus" value={details.bonus} />}
      {details.upahLembur > 0 && <InfoRow label="Upah Lembur" value={details.upahLembur} />}
      {details.thr > 0 && <InfoRow label="THR" value={details.thr} />}
      {details.pkwtCompensation > 0 && <InfoRow label="Kompensasi PKWT" value={details.pkwtCompensation} />}
    </>
  );

  return (
    <div className="space-y-6">
       <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="text-center mb-4">
                <h2 className="text-lg font-semibold text-gray-600 dark:text-gray-300">Take Home Pay</h2>
                <p className="text-4xl font-bold text-primary my-2">{formatCurrency(takeHomePay)}</p>
            </div>
            <div className="text-center text-sm text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-4">
                <p>Dengan total pendapatan sebesar <span className="font-semibold text-gray-700 dark:text-gray-300">{formatCurrency(totalPendapatan)}</span>, maka:</p>
                <p className="mt-1">Biaya yang dikeluarkan perusahaan adalah <span className="font-semibold text-primary">{formatCurrency(details.totalCostOfCompany)}</span></p>
            </div>
        </div>
      
      <Card title="Rincian Gaji & Biaya">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
            {/* Kolom Biaya Perusahaan */}
            <div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 border-b-2 border-primary pb-1 mb-3">Biaya Perusahaan</h3>
                <div className="space-y-1">
                    <InfoRow label="Gaji Pokok & Tunj. Tetap" value={details.gajiTunjanganTetap} />
                    <NonFixedComponents />
                    <InfoRow label="BPJS Kesehatan (4%)" value={details.iuranJKSPerusahaan} />
                    <InfoRow label="BPJS JHT (3.7%)" value={details.iuranJHTPerusahaan} />
                    <InfoRow label="BPJS Pensiun (2%)" value={details.iuranJPPerusahaan} />
                    <InfoRow label={`BPJS JKK (${(details.jkkRate * 100).toFixed(2)}%)`} value={details.iuranJKKPerusahaan} />
                    <InfoRow label="BPJS JKM (0.3%)" value={details.iuranJKMPerusahaan} />
                    <InfoRow label="Tunjangan PPh 21" value={details.tunjanganPajak} />
                    <InfoRow label="Total Biaya Perusahaan" value={details.totalCostOfCompany} isTotal />
                </div>
            </div>
            {/* Kolom Take Home Pay */}
            <div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 border-b-2 border-primary pb-1 mb-3">Take Home Pay</h3>
                <div className="space-y-1">
                    <InfoRow label="Gaji Pokok & Tunj. Tetap" value={details.gajiTunjanganTetap} />
                    <NonFixedComponents />
                    <InfoRow label="BPJS Kesehatan (1%)" value={details.potonganJKS} isNegative />
                    <InfoRow label="BPJS JHT (2%)" value={details.potonganJHT} isNegative />
                    <InfoRow label="BPJS Pensiun (1%)" value={details.potonganJP} isNegative />
                    <InfoRow label="PPh 21" value={details.potonganPPh21} isNegative />
                    <InfoRow label="Total Take Home Pay" value={takeHomePay} isTotal />
                </div>
            </div>
        </div>

        <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Informasi Rate Gaji</h3>
             <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg space-y-1">
                <InfoRow label="Rate per Hari (est. 22 hari kerja)" value={details.rateGajiPerHari} />
                <InfoRow label="Rate per Jam (est. 8 jam/hari)" value={details.rateGajiPerJam} />
            </div>
        </div>

        <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
             <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Detail Perhitungan Pajak (PPh 21)</h3>
             <PPh21TERDisplay details={details} />
        </div>
      </Card>
    </div>
  );
};