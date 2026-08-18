import { Dare } from '../types';
import { SPOUSE_DARES } from '../data/presetDares';

// Simple deterministic hash for a date string like "2026-08-18"
function getDaySeed(dateStr: string): number {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    const char = dateStr.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * Returns exactly 3 deterministic curated dares for today:
 * Slot 1: Playful / Flirty
 * Slot 2: Romance / Touch
 * Slot 3: Deep Conversation
 */
export function getDailyThreeSparks(date: Date = new Date()): Dare[] {
  const dateStr = date.toISOString().split('T')[0];
  const seed = getDaySeed(dateStr);

  const playfulPool = SPOUSE_DARES.filter((d) => d.category === 'Playful' || d.category === 'Flirty');
  const romancePool = SPOUSE_DARES.filter((d) => d.category === 'Romance' || d.category === 'Cozy');
  const deepPool = SPOUSE_DARES.filter((d) => d.category === 'Deep');

  const card1 = {
    ...playfulPool[seed % playfulPool.length],
    dailySlot: 1 as const,
  };

  const card2 = {
    ...romancePool[(seed + 1) % romancePool.length],
    dailySlot: 2 as const,
  };

  const card3 = {
    ...deepPool[(seed + 2) % deepPool.length],
    dailySlot: 3 as const,
  };

  return [card1, card2, card3];
}

/**
 * Calculate hours, minutes, seconds remaining until local midnight
 */
export function getTimeUntilMidnight(): { hours: number; minutes: number; seconds: number; formatted: string } {
  const now = new Date();
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
  const diffMs = midnight.getTime() - now.getTime();

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

  const pad = (n: number) => n.toString().padStart(2, '0');
  const formatted = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;

  return { hours, minutes, seconds, formatted };
}
