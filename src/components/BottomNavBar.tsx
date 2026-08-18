import React from 'react';
import { Home, Flame, Sparkles, Bookmark } from 'lucide-react';
import { playSoundEffect } from '../utils/audio';
import { triggerHaptic } from '../utils/haptics';

export type TabType = 'cards' | 'streak' | 'ai' | 'journal';

interface BottomNavBarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  streakCount: number;
  memoryCount: number;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab,
  onTabChange,
  streakCount,
  memoryCount,
}) => {
  return (
    <nav
      id="bottom-dock-nav"
      className="w-full max-w-[290px] mx-auto bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-full border border-stone-200/80 shadow-xl flex items-center justify-between z-30"
    >
      {/* Home / Flashcards */}
      <button
        onClick={() => {
          playSoundEffect('tap');
          triggerHaptic('light');
          onTabChange('cards');
        }}
        className={`p-2.5 rounded-full transition-all ${
          activeTab === 'cards'
            ? 'bg-stone-900 text-white shadow-sm'
            : 'text-stone-400 hover:text-stone-800'
        }`}
        title="Sparks Cards"
      >
        <Home className="w-4 h-4 stroke-[1.8]" />
      </button>

      {/* Streak Counter */}
      <button
        onClick={() => {
          playSoundEffect('tap');
          triggerHaptic('light');
          onTabChange('streak');
        }}
        className={`p-2.5 rounded-full relative transition-all ${
          activeTab === 'streak'
            ? 'bg-stone-900 text-white shadow-sm'
            : 'text-stone-400 hover:text-stone-800'
        }`}
        title="Streak Status"
      >
        <Flame className="w-4 h-4 stroke-[1.8]" />
        {streakCount > 0 && (
          <span className="absolute -top-1 -right-1 text-[9px] font-bold px-1 rounded-full bg-stone-900 text-white">
            {streakCount}
          </span>
        )}
      </button>

      {/* Bespoke AI Spark */}
      <button
        onClick={() => {
          playSoundEffect('spark');
          triggerHaptic('medium');
          onTabChange('ai');
        }}
        className={`p-2.5 rounded-full transition-all ${
          activeTab === 'ai'
            ? 'bg-stone-900 text-white shadow-sm'
            : 'text-stone-400 hover:text-stone-800'
        }`}
        title="Generate AI Spark"
      >
        <Sparkles className="w-4 h-4 stroke-[1.8]" />
      </button>

      {/* Sparks Journal */}
      <button
        onClick={() => {
          playSoundEffect('tap');
          triggerHaptic('light');
          onTabChange('journal');
        }}
        className={`p-2.5 rounded-full relative transition-all ${
          activeTab === 'journal'
            ? 'bg-stone-900 text-white shadow-sm'
            : 'text-stone-400 hover:text-stone-800'
        }`}
        title="Completed Journal"
      >
        <Bookmark className="w-4 h-4 stroke-[1.8]" />
        {memoryCount > 0 && (
          <span className="absolute -top-1 -right-1 text-[9px] font-bold px-1 rounded-full bg-stone-900 text-white">
            {memoryCount}
          </span>
        )}
      </button>
    </nav>
  );
};
