import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/40 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 12 }}
            transition={{ type: 'spring', damping: 25, stiffness: 340 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-[#fbf9f5] rounded-[36px] p-6 shadow-2xl border border-stone-200/80 flex flex-col max-h-[82vh] text-stone-900"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-stone-200/60">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-stone-900 text-white flex items-center justify-center shadow-sm">
                  <Bookmark className="w-3.5 h-3.5 stroke-[2]" />
                </div>
                <div>
                  <h3 className="font-bold text-sm tracking-tight text-stone-900">Sparks Journal</h3>
                  <p className="text-[11px] font-normal text-stone-400 mt-0.5">{memories.length} moments recorded</p>
                </div>
              </div>
              <button
                onClick={() => {
                  playSoundEffect('tap');
                  onClose();
                }}
                className="p-1.5 rounded-full hover:bg-stone-200/60 text-stone-400 hover:text-stone-700 transition-colors"
              >
                <X className="w-4 h-4 stroke-[2]" />
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto py-3.5 space-y-2.5 no-scrollbar">
              {memories.length === 0 ? (
                <div className="py-12 text-center text-stone-400 space-y-2.5">
                  <div className="w-10 h-10 mx-auto rounded-full bg-stone-100 flex items-center justify-center text-stone-300">
                    <Heart className="w-5 h-5 stroke-[1.8]" />
                  </div>
                  <p className="text-xs font-semibold text-stone-700">No sparks completed yet</p>
                  <p className="text-[11px] font-normal text-stone-400 max-w-[210px] mx-auto leading-relaxed">
                    Swipe through your daily cards and tap the play button to complete a spark with your spouse.
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
                      className="p-3.5 rounded-2xl bg-white border border-stone-200/70 shadow-sm space-y-1.5 relative"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-stone-900 tracking-tight">{mem.dareTitle}</span>
                        <span className="text-[10px] font-medium text-stone-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3 stroke-[1.8]" />
                          {dateStr}
                        </span>
                      </div>
                      <p className="text-[11px] font-normal text-stone-600 line-clamp-2 leading-relaxed">
                        {mem.dareDescription}
                      </p>
                      <div className="flex items-center justify-between pt-1 border-t border-stone-100">
                        <span className="text-[10px] font-medium text-stone-400">With {mem.spouseName || 'Spouse'}</span>
                        <button
                          onClick={() => onDeleteMemory(mem.id)}
                          className="text-stone-300 hover:text-rose-500 p-1 transition-colors"
                          title="Remove"
                        >
                          <Trash2 className="w-3.5 h-3.5 stroke-[1.8]" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
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

    // Static fallback
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
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/40 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 12 }}
            transition={{ type: 'spring', damping: 25, stiffness: 340 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-[#fbf9f5] rounded-[36px] p-6 shadow-2xl border border-stone-200/80 space-y-4 text-stone-900"
          >
            <div className="flex items-center justify-between pb-3 border-b border-stone-200/60">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-stone-900 text-white flex items-center justify-center shadow-sm">
                  <Sparkles className="w-3.5 h-3.5 stroke-[2]" />
                </div>
                <div>
                  <h3 className="font-bold text-sm tracking-tight text-stone-900">Generate Bespoke Spark</h3>
                  <p className="text-[11px] font-normal text-stone-400 mt-0.5">Crafted for you & {spouseName || 'Spouse'}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  playSoundEffect('tap');
                  onClose();
                }}
                className="p-1.5 rounded-full hover:bg-stone-200/60 text-stone-400 hover:text-stone-700 transition-colors"
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
                        : 'bg-white text-stone-600 border border-stone-200/70 hover:bg-stone-50'
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
              className="w-full py-3.5 rounded-full bg-stone-900 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md hover:bg-stone-800 active:scale-95 transition-all"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 stroke-[2]" />
                  <span>Generate New Card</span>
                </>
              )}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
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
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/40 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 12 }}
            transition={{ type: 'spring', damping: 25, stiffness: 340 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-[#fbf9f5] rounded-[36px] p-6 shadow-2xl border border-stone-200/80 space-y-4 max-h-[85vh] overflow-y-auto no-scrollbar text-stone-900"
          >
            <div className="flex items-center justify-between pb-3 border-b border-stone-200/60">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-stone-900 text-white flex items-center justify-center shadow-sm">
                  <Flame className="w-3.5 h-3.5 stroke-[2]" />
                </div>
                <div>
                  <h3 className="font-bold text-sm tracking-tight text-stone-900">Spouse & Streak</h3>
                  <p className="text-[11px] font-normal text-stone-400 mt-0.5">Daily marriage rhythm</p>
                </div>
              </div>
              <button
                onClick={() => {
                  playSoundEffect('tap');
                  onClose();
                }}
                className="p-1.5 rounded-full hover:bg-stone-200/60 text-stone-400 hover:text-stone-700 transition-colors"
              >
                <X className="w-4 h-4 stroke-[2]" />
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3.5 rounded-2xl bg-white border border-stone-200/70 shadow-sm text-center">
                <span className="text-2xl font-extrabold text-stone-900 tracking-tight">{streakCount}</span>
                <p className="text-[10px] font-medium uppercase tracking-wider text-stone-400 mt-0.5">
                  Day Streak
                </p>
              </div>
              <div className="p-3.5 rounded-2xl bg-white border border-stone-200/70 shadow-sm text-center">
                <span className="text-2xl font-extrabold text-stone-900 tracking-tight">{bestStreak}</span>
                <p className="text-[10px] font-medium uppercase tracking-wider text-stone-400 mt-0.5">
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
                placeholder="e.g. Alex"
                className="w-full p-3 rounded-2xl bg-white border border-stone-200 text-xs text-stone-900 focus:outline-none focus:border-stone-900 transition-colors font-medium shadow-sm"
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
                placeholder="e.g. Sam"
                className="w-full p-3 rounded-2xl bg-white border border-stone-200 text-xs text-stone-900 focus:outline-none focus:border-stone-900 transition-colors font-medium shadow-sm"
              />
            </div>

            {/* Intimacy Focus */}
            <div className="p-3 rounded-2xl bg-white border border-stone-200/70 shadow-sm space-y-1">
              <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Primary Intention</p>
              <p className="text-xs font-semibold text-stone-800">{preferences.primaryDesire || 'Romantic Touch & Closeness'}</p>
            </div>

            <button
              onClick={() => {
                playSoundEffect('accept');
                onClose();
              }}
              className="w-full py-3.5 rounded-full bg-stone-900 text-white font-semibold text-xs hover:bg-stone-800 active:scale-95 transition-all shadow-md"
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
                className="text-[11px] font-medium text-stone-400 hover:text-stone-700 flex items-center justify-center gap-1 mx-auto transition-colors"
              >
                <RotateCcw className="w-3 h-3 stroke-[1.8]" />
                <span>Reset App & Replay Onboarding</span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
