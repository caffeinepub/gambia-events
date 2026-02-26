import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { EventCategory } from '../backend';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatEventDate(datetime: bigint): string {
  const ms = Number(datetime) / 1_000_000;
  const date = new Date(ms);
  return date.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatShortDate(datetime: bigint): string {
  const ms = Number(datetime) / 1_000_000;
  const date = new Date(ms);
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function getCategoryLabel(category: EventCategory): string {
  const labels: Record<EventCategory, string> = {
    [EventCategory.music]: 'Music',
    [EventCategory.festivals]: 'Festivals',
    [EventCategory.culture]: 'Culture',
    [EventCategory.nightlife]: 'Nightlife',
    [EventCategory.comedy]: 'Comedy',
    [EventCategory.fashion]: 'Fashion',
    [EventCategory.community]: 'Community',
  };
  return labels[category] ?? category;
}

export function getCategoryEmoji(category: EventCategory): string {
  const emojis: Record<EventCategory, string> = {
    [EventCategory.music]: '🎵',
    [EventCategory.festivals]: '🎪',
    [EventCategory.culture]: '🏺',
    [EventCategory.nightlife]: '🌙',
    [EventCategory.comedy]: '😂',
    [EventCategory.fashion]: '👗',
    [EventCategory.community]: '🤝',
  };
  return emojis[category] ?? '🎉';
}

export function getCategoryColor(category: EventCategory): string {
  const colors: Record<EventCategory, string> = {
    [EventCategory.music]: 'bg-purple-500/90 text-white',
    [EventCategory.festivals]: 'bg-primary/90 text-primary-foreground',
    [EventCategory.culture]: 'bg-forest/90 text-forest-foreground',
    [EventCategory.nightlife]: 'bg-indigo-600/90 text-white',
    [EventCategory.comedy]: 'bg-gold/90 text-gold-foreground',
    [EventCategory.fashion]: 'bg-pink-500/90 text-white',
    [EventCategory.community]: 'bg-teal-600/90 text-white',
  };
  return colors[category] ?? 'bg-muted text-muted-foreground';
}

export function isToday(datetime: bigint): boolean {
  const ms = Number(datetime) / 1_000_000;
  const date = new Date(ms);
  const today = new Date();
  return date.toDateString() === today.toDateString();
}

export function isThisWeek(datetime: bigint): boolean {
  const ms = Number(datetime) / 1_000_000;
  const date = new Date(ms);
  const now = new Date();
  const weekEnd = new Date(now);
  weekEnd.setDate(now.getDate() + 7);
  return date >= now && date <= weekEnd;
}

export function isThisMonth(datetime: bigint): boolean {
  const ms = Number(datetime) / 1_000_000;
  const date = new Date(ms);
  const now = new Date();
  return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
}
