import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const CITIES = ['All Cities', 'Banjul', 'Serrekunda', 'Bakau', 'Brikama', 'Other'];
const DATE_RANGES = [
  { value: 'all', label: 'Any Date' },
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
];

interface FilterBarProps {
  city: string;
  dateRange: string;
  onCityChange: (city: string) => void;
  onDateRangeChange: (range: string) => void;
}

export default function FilterBar({ city, dateRange, onCityChange, onDateRangeChange }: FilterBarProps) {
  return (
    <div className="flex flex-wrap gap-3">
      <Select value={city} onValueChange={onCityChange}>
        <SelectTrigger className="w-40 min-h-touch bg-card">
          <SelectValue placeholder="City" />
        </SelectTrigger>
        <SelectContent>
          {CITIES.map((c) => (
            <SelectItem key={c} value={c}>{c}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={dateRange} onValueChange={onDateRangeChange}>
        <SelectTrigger className="w-40 min-h-touch bg-card">
          <SelectValue placeholder="Date" />
        </SelectTrigger>
        <SelectContent>
          {DATE_RANGES.map((d) => (
            <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
