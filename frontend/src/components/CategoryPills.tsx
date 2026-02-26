import { ScrollArea } from '@/components/ui/scroll-area';
import { EventCategory } from '../backend';
import { getCategoryLabel, getCategoryEmoji } from '../lib/utils';

const CATEGORIES = [
  { value: 'all', label: 'All Events', emoji: '🎪' },
  { value: EventCategory.music, label: getCategoryLabel(EventCategory.music), emoji: getCategoryEmoji(EventCategory.music) },
  { value: EventCategory.festivals, label: getCategoryLabel(EventCategory.festivals), emoji: getCategoryEmoji(EventCategory.festivals) },
  { value: EventCategory.culture, label: getCategoryLabel(EventCategory.culture), emoji: getCategoryEmoji(EventCategory.culture) },
  { value: EventCategory.nightlife, label: getCategoryLabel(EventCategory.nightlife), emoji: getCategoryEmoji(EventCategory.nightlife) },
  { value: EventCategory.comedy, label: getCategoryLabel(EventCategory.comedy), emoji: getCategoryEmoji(EventCategory.comedy) },
  { value: EventCategory.fashion, label: getCategoryLabel(EventCategory.fashion), emoji: getCategoryEmoji(EventCategory.fashion) },
  { value: EventCategory.community, label: getCategoryLabel(EventCategory.community), emoji: getCategoryEmoji(EventCategory.community) },
];

interface CategoryPillsProps {
  selected: string;
  onChange: (category: string) => void;
}

export default function CategoryPills({ selected, onChange }: CategoryPillsProps) {
  return (
    <div className="w-full overflow-x-auto scrollbar-hide">
      <div className="flex gap-2 pb-1 min-w-max px-1">
        {CATEGORIES.map((cat) => {
          const isActive = selected === cat.value;
          return (
            <button
              key={cat.value}
              onClick={() => onChange(cat.value)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all min-h-touch border ${
                isActive
                  ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                  : 'bg-card text-foreground border-border hover:border-primary/50 hover:bg-primary/5'
              }`}
            >
              <span>{cat.emoji}</span>
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
