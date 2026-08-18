import React, { useState } from 'react';
import { X, Flame, Sparkles, Bookmark, Heart, Trash2, Calendar, Loader2, User } from 'lucide-react';
import { CompletedDareMemory, Dare } from '../types';
import { playSoundEffect } from '../utils/audio';
import { triggerHaptic } from '../utils/haptics';

interface JournalModalProps {
  isOpen: boolean;
  onClose: () => void;
  memories: CompletedDareMemory[];
  onDeleteMemory: (id: string) => void;
  streakCount: number;
}

export const JournalModal: React.FC<JournalModalProps> = ({
  isOpen,
  onClose,
  memories,
  onDeleteMemory,
  streakCount,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-white rounded-[32px] p-6 shadow-2xl border border-stone-100 flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-800">
              <Bookmark className="w-4 h-4 stroke-[1.8]" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-stone-900 leading-none">Sparks Journal</h3>
              <p className="text-[11px] text-stone-400 mt-0.5">{memories.length} saved moments</p>
            </div>
          </div>
          <button
            onClick={() => {
              playSoundEffect('tap');
              onClose();
            }}
            className="p-1.5 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700"
          >
            <X className="w-4 h-4 stroke-[2]" />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto py-3 space-y-2.5 no-scrollbar">
          {memories.length === 0 ? (
            <div className="py-12 text-center text-stone-400 space-y-2">
              <Heart className="w-8 h-8 text-stone-300 mx-auto stroke-[1.5]" />
              <p className="text-xs font-semibold text-stone-600">No sparks completed yet</p>
              <p className="text-[11px] text-stone-400 max-w-[200px] mx-auto">
                Swipe through your daily cards and tap the play button to complete a spark.
              </p>
            </div>
          ) : (
            memories.map((mem) => {
              const dateStr = new Date(mem.completedAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
              });

              return (
                <div
                  key={mem.id}
                  className="p-3.5 rounded-2xl bg-stone-50 border border-stone-100 space-y-1 relative"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-900">{mem.dareTitle}</span>
                    <span className="text-[10px] text-stone-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3 stroke-[1.5]" />
                      {dateStr}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500 line-clamp-2 leading-relaxed">
                    {mem.dareDescription}
                  </p>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-stone-400">With {mem.spouseName || 'Spouse'}</span>
                    <button
                      onClick={() => onDeleteMemory(mem.id)}
                      className="text-stone-300 hover:text-rose-500 p-1"
                      title="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5 stroke-[1.5]" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

interface AiGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  spouseName: string;
  onGenerated: (dare: Dare) => void;
}

export const AiGeneratorModal: React.FC<AiGeneratorModalProps> = ({
  isOpen,
  onClose,
  spouseName,
  onGenerated,
}) => {
  const [loading, setLoading] = useState(false);
  const [vibe, setVibe] = useState<'romance' | 'playful' | 'deep' | 'cozy' | 'flirty'>('romance');

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setLoading(true);
    triggerHaptic('medium');
    try {
      const res = await fetch('/api/dares/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          relationship: spouseName || 'Spouse',
          vibe: `${vibe} and intimate`,
          intensity: 'light',
          customTone: 'minimalist, romantic, warm and playful for married partners',
        }),
      });
      const data = await res.json();
      setLoading(false);

      if (data.success && data.dare) {
        const newDare: Dare = {
          id: `ai-spark-${Date.now()}`,
          title: data.dare.title,
          subtitle: data.dare.subtitle || 'AI Spark',
          description: data.dare.description,
          whyItWorks: data.dare.whyItWorks || 'Creates shared intimacy and appreciation.',
          estimatedMinutes: data.dare.estimatedMinutes || 3,
          conversationStarter: data.dare.conversationStarter || 'What did you love most about today?',
          spiceLevel: data.dare.spiceLevel || 2,
          category: 'Custom',
          imageUrl: 'https://picsum.photos/seed/romantic/600/800',
          isAiGenerated: true,
        };

        playSoundEffect('spark');
        triggerHaptic('success');
        onGenerated(newDare);
        onClose();
      }
    } catch {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-white rounded-[32px] p-6 shadow-2xl border border-stone-100 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-800">
              <Sparkles className="w-4 h-4 stroke-[1.8]" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-stone-900 leading-none">Generate AI Spark</h3>
              <p className="text-[11px] text-stone-400 mt-0.5">Bespoke dare for you & {spouseName || 'Spouse'}</p>
            </div>
          </div>
          <button
            onClick={() => {
              playSoundEffect('tap');
              onClose();
            }}
            className="p-1.5 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700"
          >
            <X className="w-4 h-4 stroke-[2]" />
          </button>
        </div>

        <div className="space-y-2">
          <label className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
            Choose Tone
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(['romance', 'playful', 'deep', 'cozy', 'flirty'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setVibe(t)}
                className={`py-2 px-3 rounded-xl text-xs font-semibold capitalize transition-all ${
                  vibe === t
                    ? 'bg-stone-900 text-white shadow-sm'
                    : 'bg-stone-50 text-stone-600 hover:bg-stone-100'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full py-3.5 rounded-full bg-stone-900 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md hover:bg-stone-800 transition-colors"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <Sparkles className="w-4 h-4 stroke-[1.8]" />
              <span>Generate New Card</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

interface StreakProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  streakCount: number;
  bestStreak: number;
  spouseName: string;
  onUpdateSpouseName: (name: string) => void;
}

export const StreakProfileModal: React.FC<StreakProfileModalProps> = ({
  isOpen,
  onClose,
  streakCount,
  bestStreak,
  spouseName,
  onUpdateSpouseName,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-white rounded-[32px] p-6 shadow-2xl border border-stone-100 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-800">
              <Flame className="w-4 h-4 stroke-[1.8]" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-stone-900 leading-none">Spouse & Streak</h3>
              <p className="text-[11px] text-stone-400 mt-0.5">Daily marriage rhythm</p>
            </div>
          </div>
          <button
            onClick={() => {
              playSoundEffect('tap');
              onClose();
            }}
            className="p-1.5 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700"
          >
            <X className="w-4 h-4 stroke-[2]" />
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-100 text-center">
            <span className="text-2xl font-black text-stone-900">{streakCount}</span>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400 mt-0.5">
              Day Streak
            </p>
          </div>
          <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-100 text-center">
            <span className="text-2xl font-black text-stone-900">{bestStreak}</span>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400 mt-0.5">
              Best Streak
            </p>
          </div>
        </div>

        {/* Spouse Name Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-stone-600 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 stroke-[1.8]" />
            <span>Spouse's Name</span>
          </label>
          <input
            type="text"
            value={spouseName}
            onChange={(e) => onUpdateSpouseName(e.target.value)}
            placeholder="e.g. Sarah, Alex, My Love"
            className="w-full p-3 rounded-2xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:outline-none focus:border-stone-900 transition-colors"
          />
        </div>

        <button
          onClick={() => {
            playSoundEffect('accept');
            onClose();
          }}
          className="w-full py-3 rounded-full bg-stone-900 text-white font-bold text-xs hover:bg-stone-800 transition-colors"
        >
          Save & Close
        </button>
      </div>
    </div>
  );
};
