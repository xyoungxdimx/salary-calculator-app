
import React from 'react';

export const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value);
};

interface InfoRowProps {
  label: string;
  value: string | number;
  isTotal?: boolean;
  isNegative?: boolean;
}

export const InfoRow: React.FC<InfoRowProps> = ({ label, value, isTotal = false, isNegative = false }) => {
  const formattedValue = typeof value === 'number' ? formatCurrency(value) : value;
  const valueColor = isNegative ? 'text-red-600 dark:text-red-500' : 'text-gray-800 dark:text-gray-200';
  
  return (
    <div className={`flex justify-between items-center py-1.5 ${isTotal ? 'border-t border-gray-200 dark:border-gray-700 mt-2 pt-2' : ''}`}>
      <p className={`text-sm ${isTotal ? 'font-semibold' : ''} text-gray-600 dark:text-gray-400`}>{label}</p>
      <p className={`text-sm font-medium ${valueColor} ${isTotal ? 'font-bold' : ''}`}>{isNegative && typeof value === 'number' && value > 0 ? `- ${formattedValue}` : formattedValue}</p>
    </div>
  );
};