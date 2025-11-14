
import React, { useState, useEffect } from 'react';
import { SalaryInput, SalaryResult, PTKPStatus, JKKRate, TaxPolicy, CalculationMode } from './types';
import { performCalculation } from './services/calculator';
import { InputForm } from './components/InputForm';
import { ResultDisplay } from './components/ResultDisplay';
import { GithubIcon } from './components/ui/Icons';
import { ModeSelector } from './components/ModeSelector';
import { ThemeToggle } from './components/ui/ThemeToggle';

const DEFAULTS = {
  gajiPokok: 0,
  tunjanganTetap: 0,
  tunjanganTidakTetap: 0,
  totalBudget: 0,
  desiredTakeHomePay: 0,
};

const getInitialState = (): SalaryInput => {
    const today = new Date().toISOString().split('T')[0];
    return {
        gajiPokok: DEFAULTS.gajiPokok,
        tunjanganTetap: DEFAULTS.tunjanganTetap,
        tunjanganTidakTetap: DEFAULTS.tunjanganTidakTetap,
        tunjanganLain: 0,
        bonus: 0,
        lemburJamKerja: 0,
        lemburJamLibur: 0,
        ptkpStatus: PTKPStatus.K0,
        jkkRate: JKKRate.VERY_LOW,
        punyaNPWP: true,
        taxPolicy: TaxPolicy.GROSS,
        includeTHR: false,
        includePKWT: false,
        contractStartDate: today,
        contractEndDate: today,
        totalBudget: DEFAULTS.totalBudget,
        desiredTakeHomePay: DEFAULTS.desiredTakeHomePay,
    };
};

type Theme = 'light' | 'dark';

function App() {
  const [calculationMode, setCalculationMode] = useState<CalculationMode>(CalculationMode.GROSS_TO_NET);
  const [salaryInput, setSalaryInput] = useState<SalaryInput>(getInitialState());
  const [salaryResult, setSalaryResult] = useState<SalaryResult | null>(null);
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    // Check for saved theme in localStorage or system preference
    const savedTheme = localStorage.getItem('theme') as Theme;
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme) {
      setTheme(savedTheme);
    } else if (systemPrefersDark) {
      setTheme('dark');
    }
  }, []);

  useEffect(() => {
    // Apply theme class to root element and save choice
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const handleCalculate = () => {
    const result = performCalculation(calculationMode, salaryInput);
    setSalaryResult(result);
  };

  const handleReset = () => {
    setSalaryInput(getInitialState());
    setSalaryResult(null);
  };

  const handleModeChange = (newMode: CalculationMode) => {
    setCalculationMode(newMode);
    setSalaryResult(null);
    setSalaryInput(getInitialState());
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className="text-2xl md:text-3xl font-bold text-primary">Kalkulator Gaji</h1>
            <div className="flex items-center space-x-4">
              <a href="https://github.com/your-repo" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white">
                  <GithubIcon className="w-6 h-6" />
              </a>
              <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
            </div>
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-8">
        <ModeSelector activeMode={calculationMode} onModeChange={handleModeChange} />
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mt-6">
          <div className="lg:col-span-2">
            <InputForm 
              input={salaryInput} 
              setInput={setSalaryInput} 
              onCalculate={handleCalculate}
              onReset={handleReset}
              calculationMode={calculationMode}
            />
          </div>
          <div className="lg:col-span-3">
            <ResultDisplay result={salaryResult} />
          </div>
        </div>
      </main>

      <footer className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">
        <p>&copy; {new Date().getFullYear()} Kalkulator Gaji. Dibuat untuk tujuan simulasi.</p>
      </footer>
    </div>
  );
}

export default App;