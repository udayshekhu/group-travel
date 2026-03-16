interface CustomSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  options: { value: string; label: string; disabled?: boolean }[];
  placeholder?: string;
}

export function CustomSelect({ value, onValueChange, options, placeholder }: CustomSelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onValueChange(e.target.value)}
      className="w-full px-3 py-2 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent text-base bg-white"
    >
      {placeholder && !value && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {options.map((option) => (
        <option 
          key={option.value} 
          value={option.value} 
          disabled={option.disabled}
        >
          {option.label}
        </option>
      ))}
    </select>
  );
}