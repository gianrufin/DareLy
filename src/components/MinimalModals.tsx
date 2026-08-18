import React, { useState } from 'react';
import { X, Flame, Sparkles, Bookmark, Heart, Trash2, Calendar, Loader2, User, RotateCcw } from 'lucide-react';
import { CompletedDareMemory, Dare, UserPreferences } from '../types';
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
              <p className="text-[11px] text-stone-400 mt-0.5">{memories.length} moments logged</p>
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

const STATIC_FALLBACK_SPARKS: Record<string, { title: string; desc: string; convo: string; minutes: number }> = {
  romance: {
    title: 'Candlelight Slow Sip',
    desc: 'Light a single candle in the kitchen or bedroom. Sip a drink together in quiet candlelight without any other lights or phones on.',
    convo: 'What was your favorite moment between us this month?',
    minutes: 4,
  },
  playful: {
    title: 'The 60s Stare & Giggle',
    desc: 'Try to keep a completely straight face while making playful facial expressions at each other. First one to break a smile loses and grants a wish.',
    convo: 'What is the funniest inside joke we share?',
    minutes: 2,
  },
  deep: {
    title: 'Vulnerability Confession',
    desc: 'Share one fear or quiet hope you have been holding onto recently. Give each other full undivided presence with no advice.',
    convo: 'When do you feel most understood by me?',
    minutes: 5,
  },
  cozy: {
    title: 'Blanket Fort Tea Break',
    desc: 'Wrap yourselves together under a heavy blanket on the couch and spend 5 minutes doing nothing but resting together.',
    convo: 'What is your idea of a perfect relaxing evening with me?',
    minutes: 5,
  },
  flirty: {
    title: 'The Secret Whisper',
    desc: 'Lean into your partner and softly whisper your favorite thing about their body or personality today.',
    convo: 'What is something I do that you secretly find irresistible?',
    minutes: 2,
  },
};

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

    const partner = spouseName || 'Spouse';

    try {
      const res = await fetch('/api/dares/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          relationship: partner,
          vibe: `${vibe} and intimate`,
          intensity: 'light',
          customTone: 'minimalist, romantic, warm and playful for married partners',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.dare) {
          const newDare: Dare = {
            id: `ai-spark-${Date.now()}`,
            title: data.dare.title,
            subtitle: data.dare.subtitle || 'Bespoke Spark',
            description: data.dare.description,
            whyItWorks: data.dare.whyItWorks || 'Creates shared intimacy and appreciation.',
            estimatedMinutes: data.dare.estimatedMinutes || 3,
            conversationStarter: data.dare.conversationStarter || 'What did you love most about today?',
            spiceLevel: data.dare.spiceLevel || 2,
            category: 'Custom',
            imageUrl: 'https://picsum.photos/seed/romantic/600/800',
            isAiGenerated: true,
          };

          setLoading(false);
          playSoundEffect('spark');
          triggerHaptic('success');
          onGenerated(newDare);
          onClose();
          return;
        }
      }
    } catch {
      // Fallback
    }

    // Static fallback for GitHub Pages hosting
    const fallback = STATIC_FALLBACK_SPARKS[vibe] || STATIC_FALLBACK_SPARKS.romance;
    const newDare: Dare = {
      id: `ai-spark-${Date.now()}`,
      title: fallback.title,
      subtitle: `${vibe.charAt(0).toUpperCase() + vibe.slice(1)} Spark`,
      description: fallback.desc,
      whyItWorks: 'Spontaneous micro-rituals deepen marital intimacy and restore daily presence.',
      estimatedMinutes: fallback.minutes,
      conversationStarter: fallback.convo,
      spiceLevel: 2,
      category: 'Custom',
      imageUrl: 'https://picsum.photos/seed/romantic/600/800',
      isAiGenerated: true,
    };

    setLoading(false);
    playSoundEffect('spark');
    triggerHaptic('success');
    onGenerated(newDare);
    onClose();
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
              <h3 className="font-bold text-sm text-stone-900 leading-none">Generate Bespoke Spark</h3>
              <p className="text-[11px] text-stone-400 mt-0.5">Crafted for you & {spouseName || 'Spouse'}</p>
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
  preferences: UserPreferences;
  onUpdatePreferences: (prefs: Partial<UserPreferences>) => void;
  onResetApp: () => void;
}

export const StreakProfileModal: React.FC<StreakProfileModalProps> = ({
  isOpen,
  onClose,
  streakCount,
  bestStreak,
  preferences,
  onUpdatePreferences,
  onResetApp,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-white rounded-[32px] p-6 shadow-2xl border border-stone-100 space-y-4 max-h-[85vh] overflow-y-auto no-scrollbar">
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

        {/* User's Name Input */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-stone-600 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 stroke-[1.8]" />
            <span>Your Name</span>
          </label>
          <input
            type="text"
            value={preferences.userName}
            onChange={(e) => onUpdatePreferences({ userName: e.target.value })}
            placeholder="Your name"
            className="w-full p-3 rounded-2xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:outline-none focus:border-stone-900 transition-colors font-medium"
          />
        </div>

        {/* Spouse Name Input */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-stone-600 flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 stroke-[1.8]" />
            <span>Spouse's Name</span>
          </label>
          <input
            type="text"
            value={preferences.spouseName}
            onChange={(e) => onUpdatePreferences({ spouseName: e.target.value })}
            placeholder="Spouse's name"
            className="w-full p-3 rounded-2xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:outline-none focus:border-stone-900 transition-colors font-medium"
          />
        </div>

        {/* Intimacy Focus */}
        <div className="p-3 rounded-2xl bg-stone-50 border border-stone-100 space-y-1">
          <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Primary Intention</p>
          <p className="text-xs font-semibold text-stone-800">{preferences.primaryDesire || 'Romantic Touch & Closeness'}</p>
        </div>

        <button
          onClick={() => {
            playSoundEffect('accept');
            onClose();
          }}
          className="w-full py-3.5 rounded-full bg-stone-900 text-white font-bold text-xs hover:bg-stone-800 transition-colors"
        >
          Save & Close
        </button>

        {/* Reset App / Rerun Onboarding */}
        <div className="pt-1 text-center">
          <button
            onClick={() => {
              if (window.confirm('Reset app and replay first-time launch onboarding?')) {
                playSoundEffect('tap');
                onResetApp();
              }
            }}
            className="text-[11px] text-stone-400 hover:text-stone-700 flex items-center justify-center gap-1 mx-auto transition-colors"
          >
            <RotateCcw className="w-3 h-3 stroke-[1.8]" />
            <span>Reset App & Replay Onboarding</span>
          </button>
        </div>
      </div>
    </div>
  );
};
