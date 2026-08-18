import React from 'react';
import { SlidersHorizontal, Sparkles } from 'lucide-react';
import { SpouseVibe } from '../types';
import { playSoundEffect } from '../utils/audio';
import { triggerHaptic } from '../utils/haptics';

interface FilterPillsProps {
  selectedVibe: SpouseVibe;
  onSelectVibe: (vibe: SpouseVibe) => void;
  counts: Record<SpouseVibe, number>;
  dailyCompletedCount: number;
}

const CATEGORIES: { id: SpouseVibe; label: string }[] = [
  { id: 'today', label: "Today's 3" },
  { id: 'all', label: 'All' },
  { id: 'romance', label: 'Romance' },
  { id: 'playful', label: 'Playful' },
  { id: 'deep', label: 'Deep' },
  { id: 'cozy', label: 'Cozy' },
  { id: 'flirty', label: 'Flirty' },
];

export const FilterPills: React.FC<FilterPillsProps> = ({
  selectedVibe,
  onSelectVibe,
  counts,
  dailyCompletedCount,
}) => {
  return (
    <div className="w-full flex items-center gap-2 overflow-x-auto py-1 no-scrollbar select-none">
      {/* Left Filter Icon (Matching Video) */}
      <button
        onClick={() => {
          playSoundEffect('tap');
          triggerHaptic('light');
          onSelectVibe('today');
        }}
        className="p-2.5 rounded-full bg-white border border-stone-200/80 text-stone-700 hover:bg-stone-50 shadow-sm shrink-0 transition-colors"
        title="Today's Sparks"
      >
        <SlidersHorizontal className="w-4 h-4 stroke-[1.8]" />
      </button>

      {/* Pill buttons */}
      {CATEGORIES.map((cat) => {
        const isSelected = selectedVibe === cat.id;
        const count = counts[cat.id] || 0;

        return (
          <button
            key={cat.id}
            id={`filter-pill-${cat.id}`}
            onClick={() => {
              playSoundEffect('tap');
              triggerHaptic('light');
              onSelectVibe(cat.id);
            }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold shrink-0 transition-all ${
              isSelected
                ? 'bg-stone-900 text-white shadow-sm'
                : 'bg-transparent text-stone-500 hover:text-stone-900 hover:bg-stone-100/80'
            }`}
          >
            {cat.id === 'today' && (
              <Sparkles className={`w-3.5 h-3.5 stroke-[2] ${isSelected ? 'text-white' : 'text-stone-400'}`} />
            )}
            <span>{cat.label}</span>
            <span className={`text-[11px] font-normal ${isSelected ? 'text-stone-300' : 'text-stone-400'}`}>
              {cat.id === 'today' ? `${dailyCompletedCount}/3` : count}
            </span>
          </button>
        );
      })}
    </div>
  );
};
