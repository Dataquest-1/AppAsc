'use client';

interface DateFilterProps {
  value: string;
  onChange: (value: string) => void;
}

export function DateFilter({ value, onChange }: DateFilterProps) {
  return (
    <div className="flex items-center space-x-2">
      <label htmlFor="month-filter" className="text-sm font-medium text-gray-700">
        Mes:
      </label>
      <input
        type="month"
        id="month-filter"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input w-auto"
      />
    </div>
  );
}
