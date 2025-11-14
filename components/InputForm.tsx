
import React, { useMemo } from 'react';
import { SalaryInput, PTKPStatus, JKKRate, TaxPolicy, CalculationMode } from '../types';
import { PTKP_TO_TER_CATEGORY } from '../constants';
import { Card } from './ui/Card';
import { CalculatorIcon } from './ui/Icons';


interface InputFieldProps {
  label: string;
  id: keyof SalaryInput;
  value: number | string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isCurrency?: boolean;
  description?: string;
  type?: 'number' | 'date';
}

const InputField: React.FC<InputFieldProps> = ({ label, id, value, onChange, isCurrency = true, description, type = 'number' }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
        <div className="relative">
            {isCurrency && <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 dark:text-gray-400">Rp</span>}
            <input
                type={type}
                id={id}
                name={id}
                value={value}
                onChange={onChange}
                className={`w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary focus:border-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${isCurrency ? 'pl-9' : ''}`}
                min="0"
            />
        </div>
        {description && <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{description}</p>}
    </div>
);

interface SelectFieldProps<T> {
  label: string;
  id: keyof SalaryInput;
  value: T;
  options: { value: T; label: string }[];
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

const SelectField = <T extends string | number,>({ label, id, value, options, onChange }: SelectFieldProps<T>) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
        <select
            id={id}
            name={id}
            value={value}
            onChange={onChange}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary focus:border-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        >
            {options.map(opt => <option key={String(opt.value)} value={opt.value}>{opt.label}</option>)}
        </select>
    </div>
);

interface CheckboxFieldProps {
    label: string;
    id: keyof SalaryInput;
    checked: boolean;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const CheckboxField: React.FC<CheckboxFieldProps> = ({ label, id, checked, onChange }) => (
    <div className="flex items-center space-x-2">
        <input 
            type="checkbox" 
            id={id} 
            name={id}
            checked={checked}
            onChange={onChange}
            className="h-4 w-4 text-primary focus:ring-primary border-gray-300 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-600"
        />
        <label htmlFor={id} className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
    </div>
);

// Input fields for the default mode (Gross to Net)
const GrossToNetInputs: React.FC<{ input: SalaryInput; handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void; }> = ({ input, handleChange }) => (
    <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 pb-2">Komponen Gaji</h3>
        <InputField 
            label="Gaji Pokok" 
            id="gajiPokok" 
            value={input.gajiPokok} 
            onChange={handleChange} 
            description="Diisi Gaji Pokok dalam satu bulan. Untuk mencari nilai THP dan Biaya Perusahaan." 
        />
        <InputField 
            label="Tunjangan Tetap" 
            id="tunjanganTetap" 
            value={input.tunjanganTetap} 
            onChange={handleChange}
            description="Diisi Tunjangan Tetap dalam satu bulan. Untuk mencari nilai THP dan Biaya Perusahaan."
        />
        <InputField 
            label="Tunjangan Tidak Tetap" 
            id="tunjanganTidakTetap" 
            value={input.tunjanganTidakTetap} 
            onChange={handleChange}
            description="Diisi Tunjangan Tidak Tetap dalam satu bulan (tidak menjadi dasar perhitungan BPJS)"
        />
        <InputField label="Lain-lain" id="tunjanganLain" value={input.tunjanganLain} onChange={handleChange} />
        <InputField label="Bonus" id="bonus" value={input.bonus} onChange={handleChange} />
        
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 pb-2 pt-4">Perhitungan Lembur (UU Cipta Kerja)</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField label="Lembur Hari Kerja (Jam)" id="lemburJamKerja" value={input.lemburJamKerja} onChange={handleChange} isCurrency={false} />
            <InputField label="Lembur Akhir Pekan / Libur (Jam)" id="lemburJamLibur" value={input.lemburJamLibur} onChange={handleChange} isCurrency={false} />
        </div>
    </div>
);

// Input fields for Budget to Net mode
const BudgetToNetInputs: React.FC<{ input: SalaryInput; handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void; }> = ({ input, handleChange }) => (
    <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 pb-2">Input Budget</h3>
        <InputField 
            label="Total Budget Perusahaan" 
            id="totalBudget" 
            value={input.totalBudget} 
            onChange={handleChange}
            description="Total biaya yang dikeluarkan perusahaan untuk karyawan ini, termasuk gaji, tunjangan, BPJS, dan PPh 21."
        />
    </div>
);

// Input fields for Net to Gross mode
const NetToGrossInputs: React.FC<{ input: SalaryInput; handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void; }> = ({ input, handleChange }) => (
    <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 pb-2">Input Gaji Bersih</h3>
         <InputField 
            label="Take Home Pay Diinginkan" 
            id="desiredTakeHomePay" 
            value={input.desiredTakeHomePay} 
            onChange={handleChange}
            description="Jumlah bersih yang diterima karyawan setelah semua potongan."
        />
    </div>
);


interface InputFormProps {
  input: SalaryInput;
  setInput: React.Dispatch<React.SetStateAction<SalaryInput>>;
  onCalculate: () => void;
  onReset: () => void;
  calculationMode: CalculationMode;
}

export const InputForm: React.FC<InputFormProps> = ({ input, setInput, onCalculate, onReset, calculationMode }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
        const { checked } = e.target as HTMLInputElement;
        setInput(prev => ({ ...prev, [name]: checked }));
    } else {
        // Fix for: Property 'dataset' does not exist on type 'Element'.
        // By casting the result of querySelector to HTMLOptionElement, we can safely access `dataset`.
        const isBoolean = ((e.target as HTMLSelectElement).querySelector('option:checked') as HTMLOptionElement)?.dataset.isboolean;
        if(isBoolean) {
             setInput(prev => ({ ...prev, [name]: value === 'true' }));
        } else {
            // Also fix a bug where numeric values from <select> elements were being stored as strings.
            const isNumericInput = type === 'number';
            // Use Number() for stricter parsing than parseFloat(), which prevents partial parsing of strings like "1abc".
            const isNumericSelect = e.target.tagName === 'SELECT' && value.trim() !== '' && !isNaN(Number(value));

            if (isNumericInput || isNumericSelect) {
                // `parseFloat(value) || 0` correctly handles empty number inputs by converting them to 0.
                setInput(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
            } else {
                setInput(prev => ({ ...prev, [name]: value }));
            }
        }
    }
  };

  const terCategory = useMemo(() => PTKP_TO_TER_CATEGORY[input.ptkpStatus] || 'N/A', [input.ptkpStatus]);

  const ptkpOptions = Object.values(PTKPStatus).map(status => ({ value: status, label: status }));
  const jkkOptions = Object.entries(JKKRate)
    .filter(([key]) => isNaN(Number(key)))
    .map(([key, value]) => ({ value, label: `${key.replace(/_/g, ' ')} (${(Number(value) * 100).toFixed(2)}%)` }));
  const taxPolicyOptions = [
      { value: TaxPolicy.GROSS, label: 'Potongan Pajak (Gross)' },
      { value: TaxPolicy.GROSS_UP, label: 'Tunjangan Pajak (Gross Up)' },
  ];
  const npwpOptions = [
    { value: 'true', label: 'Memiliki NPWP' },
    { value: 'false', label: 'Tidak Memiliki NPWP' },
  ];


  return (
    <Card title="Data Karyawan">
      <div className="space-y-4">
        
        {calculationMode === CalculationMode.GROSS_TO_NET && <GrossToNetInputs input={input} handleChange={handleChange} />}
        {calculationMode === CalculationMode.BUDGET_TO_NET && <BudgetToNetInputs input={input} handleChange={handleChange} />}
        {calculationMode === CalculationMode.NET_TO_GROSS && <NetToGrossInputs input={input} handleChange={handleChange} />}

        {calculationMode === CalculationMode.GROSS_TO_NET && (
          <>
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 pb-2 pt-4">Kompensasi Tambahan</h3>
            <div className="space-y-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <CheckboxField label="Hitung THR" id="includeTHR" checked={input.includeTHR} onChange={handleChange} />
              {input.includeTHR && (
                <InputField label="Tanggal Mulai Kontrak" id="contractStartDate" value={input.contractStartDate} onChange={handleChange} type="date" isCurrency={false}/>
              )}
              <CheckboxField label="Kompensasi PKWT" id="includePKWT" checked={input.includePKWT} onChange={handleChange} />
              {input.includePKWT && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField label="Tgl Mulai Kontrak" id="contractStartDate" value={input.contractStartDate} onChange={handleChange} type="date" isCurrency={false}/>
                  <InputField label="Tgl Selesai Kontrak" id="contractEndDate" value={input.contractEndDate} onChange={handleChange} type="date" isCurrency={false}/>
                </div>
              )}
            </div>
          </>
        )}

        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 pb-2 pt-4">Status Pajak & BPJS</h3>
        <SelectField label="Metode Pajak" id="taxPolicy" value={input.taxPolicy} options={taxPolicyOptions} onChange={handleChange} />
        <SelectField label="Status PTKP" id="ptkpStatus" value={input.ptkpStatus} options={ptkpOptions} onChange={handleChange} />
        <div className="text-sm text-gray-500 dark:text-gray-300 bg-blue-50 dark:bg-blue-900/20 p-2 rounded-md text-center">
            Kategori Tarif Efektif (TER): <span className="font-bold text-blue-600 dark:text-blue-400">{terCategory}</span>
        </div>
        <SelectField label="Rate JKK" id="jkkRate" value={input.jkkRate} options={jkkOptions} onChange={handleChange} />
        
        <div>
            <label htmlFor="punyaNPWP" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status NPWP</label>
            <select
                id="punyaNPWP"
                name="punyaNPWP"
                value={String(input.punyaNPWP)}
                onChange={(e) => setInput(prev => ({...prev, punyaNPWP: e.target.value === 'true'}))}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary focus:border-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
                <option value="true">Memiliki NPWP</option>
                <option value="false">Tidak Memiliki NPWP</option>
            </select>
        </div>
        
        <div className="flex items-center space-x-2 mt-6">
            <button
              onClick={onCalculate}
              className="w-full bg-primary text-white font-bold py-3 px-4 rounded-lg hover:bg-teal-600 dark:hover:bg-teal-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <CalculatorIcon className="w-5 h-5" />
              <span>Hitung Gaji</span>
            </button>
             <button
              onClick={onReset}
              type="button"
              className="w-full bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 font-bold py-3 px-4 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <span>Reset</span>
            </button>
        </div>
      </div>
    </Card>
  );
};