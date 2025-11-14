
import React from 'react';
import { CalculationMode } from '../types';

interface ModeSelectorProps {
  activeMode: CalculationMode;
  onModeChange: (mode: CalculationMode) => void;
}

const modes = [
  { id: CalculationMode.GROSS_TO_NET, label: 'Gaji & Tunjangan' },
  { id: CalculationMode.BUDGET_TO_NET, label: 'Budget Perusahaan' },
  { id: CalculationMode.NET_TO_GROSS, label: 'Take Home Pay' },
];

export const ModeSelector: React.FC<ModeSelectorProps> = ({ activeMode, onModeChange }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-1 flex space-x-1">
      {modes.map((mode) => (
        <button
          key={mode.id}
          onClick={() => onModeChange(mode.id)}
          className={`w-full text-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:ring-offset-white dark:focus:ring-offset-gray-800
            ${activeMode === mode.id
              ? 'bg-primary text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
        >
          {mode.label}
        </button>
      ))}
    </div>
  );
};