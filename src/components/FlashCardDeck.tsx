import React, { useState } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'motion/react';
import {
  RotateCcw,
  Volume2,
  VolumeX,
  Heart,
  Sparkles,
  Loader2,
  Clock,
  Flame,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';
import { Dare, UserPreferences } from '../types';
import { playSoundEffect, playPcmAudio, stopCurrentAudio } from '../utils/audio';
import { triggerHaptic } from '../utils/haptics';

interface FlashCardDeckProps {
  currentDare: Dare | null;
  currentIndex: number;
  totalCards: number;
  spouseName: string;
  preferences: UserPreferences;
  onNext: () => void;
  onPrev: () => void;
  onComplete: (dare: Dare) => void;
  isCompletedToday: boolean;
  onGenerateAiSpark: () => void;
  isGeneratingAi: boolean;
}

export const FlashCardDeck: React.FC<FlashCardDeckProps> = ({
  currentDare,
  currentIndex,
  totalCards,
  spouseName,
  preferences,
  onNext,
  onPrev,
  onComplete,
  isCompletedToday,
  onGenerateAiSpark,
  isGeneratingAi,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);

  // Motion values for intuitive drag gestures
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0.4, 0.9, 1, 0.9, 0.4]);

  const displayName = spouseName.trim() || 'My Spouse';

  if (!currentDare) {
    return (
      <div className="w-full flex flex-col items-center justify-center p-8 text-center bg-stone-900/60 rounded-3xl border border-stone-800">
        <Sparkles className="w-8 h-8 text-rose-400 mb-2 animate-pulse" />
        <h3 className="text-base font-bold text-stone-100 mb-1">Drawing Today's Spark...</h3>
        <p className="text-xs text-stone-400">Loading romantic cards for you and {displayName}</p>
      </div>
    );
  }

  const handleFlip = () => {
    playSoundEffect('flip');
    triggerHaptic('light');
    setIsFlipped(!isFlipped);
  };

  const handleSwipe = (direction: 'left' | 'right') => {
    setSwipeDirection(direction);
    playSoundEffect('draw');
    triggerHaptic('medium');
    stopCurrentAudio();
    setIsPlayingAudio(false);
    setIsFlipped(false);

    setTimeout(() => {
      if (direction === 'left') {
        onNext();
      } else {
        onPrev();
      }
      setSwipeDirection(null);
    }, 180);
  };

  const handleTTS = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlayingAudio) {
      stopCurrentAudio();
      setIsPlayingAudio(false);
      return;
    }

    setAudioLoading(true);
    triggerHaptic('light');
    try {
      const text = `${currentDare.title}. ${currentDare.description}. Conversation question: ${currentDare.conversationStarter}`;
      const res = await fetch('/api/dares/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voice: preferences.voice || 'Kore' }),
      });
      const data = await res.json();
      setAudioLoading(false);

      if (data.success && data.audioBase64) {
        setIsPlayingAudio(true);
        playPcmAudio(data.audioBase64, 24000, () => {
          setIsPlayingAudio(false);
        });
      } else if ('speechSynthesis' in window) {
        const u = new SpeechSynthesisUtterance(text);
        u.onend = () => setIsPlayingAudio(false);
        window.speechSynthesis.speak(u);
        setIsPlayingAudio(true);
      }
    } catch {
      setAudioLoading(false);
      if ('speechSynthesis' in window) {
        const u = new SpeechSynthesisUtterance(`${currentDare.title}. ${currentDare.description}`);
        u.onend = () => setIsPlayingAudio(false);
        window.speechSynthesis.speak(u);
        setIsPlayingAudio(true);
      }
    }
  };

  const renderSpice = (spice: number) => {
    return (
      <div className="flex items-center gap-0.5" title={`Spiciness: ${spice}/4`}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Flame
            key={i}
            className={`w-3 h-3 ${
              i < spice ? 'text-rose-500 fill-rose-500' : 'text-stone-700 fill-transparent'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div id="flashcard-deck-container" className="w-full flex flex-col items-center justify-center relative">
      {/* Card Count Pill & Flip Hint */}
      <div className="w-full max-w-sm flex items-center justify-between px-2 mb-2 text-xs text-stone-400">
        <span className="font-semibold text-stone-400 text-[11px]">
          Card {currentIndex + 1} of {totalCards}
        </span>
        <span className="text-[11px] text-stone-500 flex items-center gap-1">
          <RotateCcw className="w-3 h-3 text-rose-400" />
          <span>Tap card to reveal conversation</span>
        </span>
      </div>

      {/* 3D Flashcard Container */}
      <div className="w-full max-w-sm aspect-[4/5.4] relative select-none [perspective:1200px]">
        {/* Layer Stack Depth Effect */}
        <div className="absolute inset-0 bg-stone-900/50 rounded-[32px] border border-stone-800/60 transform translate-y-3 scale-[0.95] opacity-50 shadow-md" />
        <div className="absolute inset-0 bg-stone-900/70 rounded-[32px] border border-stone-800/80 transform translate-y-1.5 scale-[0.98] opacity-75 shadow-lg" />

        {/* Top Swipable Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentDare.id}
            style={{ x, rotate, opacity }}
            initial={{ scale: 0.94, opacity: 0, y: 15 }}
            animate={{
              scale: 1,
              opacity: 1,
              y: 0,
              x: swipeDirection === 'left' ? -260 : swipeDirection === 'right' ? 260 : 0,
            }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.24, ease: 'easeOut' }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.6}
            onDragEnd={(_, info) => {
              if (info.offset.x > 75) {
                handleSwipe('right');
              } else if (info.offset.x < -75) {
                handleSwipe('left');
              }
            }}
            className="w-full h-full relative cursor-grab active:cursor-grabbing"
          >
            {/* 3D Flip Container */}
            <motion.div
              animate={{ rotateY: isFlipped ? 180 : 0 }}
              transition={{ duration: 0.45, ease: 'easeInOut' }}
              onClick={handleFlip}
              className="w-full h-full relative [transform-style:preserve-3d]"
            >
              {/* --- FRONT OF FLASHCARD (Action Dare) --- */}
              <div
                id={`flashcard-front-${currentDare.id}`}
                className="absolute inset-0 w-full h-full rounded-[32px] p-6 flex flex-col justify-between [backface-visibility:hidden] bg-gradient-to-b from-stone-900/95 via-stone-900/90 to-stone-950/95 border border-rose-500/20 shadow-2xl backdrop-blur-xl overflow-hidden"
              >
                {/* Subtle Ambient Glow */}
                <div className="absolute -top-20 -right-20 w-48 h-48 rounded-full bg-rose-500/10 blur-3xl pointer-events-none" />
                <div className="absolute -bottom-20 -left-20 w-44 h-44 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

                {/* Top Bar on Card */}
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl drop-shadow-md">{currentDare.emoji}</span>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-rose-300">
                        {currentDare.category}
                      </span>
                      <div className="flex items-center gap-1 text-[11px] text-stone-400">
                        <Clock className="w-3 h-3" />
                        <span>{currentDare.estimatedMinutes} min</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {renderSpice(currentDare.spiceLevel)}
                    <button
                      id="btn-tts-card"
                      onClick={handleTTS}
                      disabled={audioLoading}
                      className={`p-2 rounded-full transition-all ${
                        isPlayingAudio
                          ? 'bg-rose-500 text-white shadow-md animate-pulse'
                          : 'bg-stone-850 hover:bg-stone-800 text-stone-300 border border-stone-700/60'
                      }`}
                      title="Read aloud"
                    >
                      {audioLoading ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-400" />
                      ) : isPlayingAudio ? (
                        <VolumeX className="w-3.5 h-3.5 text-white" />
                      ) : (
                        <Volume2 className="w-3.5 h-3.5 text-rose-400" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Card Title & Dare Description */}
                <div className="relative z-10 my-auto py-2 space-y-3.5">
                  <h2 className="text-xl sm:text-2xl font-black text-stone-100 tracking-tight leading-snug">
                    {currentDare.title}
                  </h2>

                  <p className="text-sm text-stone-200 leading-relaxed font-normal bg-stone-950/50 p-4 rounded-2xl border border-white/5 shadow-inner">
                    {currentDare.description}
                  </p>

                  {/* Why It Works psychology tag */}
                  <div className="bg-stone-900/70 p-2.5 rounded-xl border border-stone-800 text-[11px] text-stone-300 flex items-start gap-2">
                    <span className="text-amber-400 shrink-0 mt-0.5">💡</span>
                    <p className="leading-snug">
                      <strong className="text-amber-300 font-semibold">Marital Spark:</strong>{' '}
                      {currentDare.whyItWorks}
                    </p>
                  </div>
                </div>

                {/* Card Bottom Footer */}
                <div className="relative z-10 pt-2 border-t border-stone-800/80 flex items-center justify-between text-xs text-stone-400">
                  <span className="text-[11px] text-stone-400 font-medium">
                    With <span className="text-rose-300 font-semibold">{displayName}</span>
                  </span>
                  <span className="text-[11px] text-stone-500 flex items-center gap-1">
                    <span>Tap to flip</span>
                    <RotateCcw className="w-3 h-3 text-rose-400/80" />
                  </span>
                </div>
              </div>

              {/* --- BACK OF FLASHCARD (Conversation Starter) --- */}
              <div
                id={`flashcard-back-${currentDare.id}`}
                className="absolute inset-0 w-full h-full rounded-[32px] p-6 flex flex-col justify-between [transform:rotateY(180deg)] [backface-visibility:hidden] bg-gradient-to-b from-stone-900 via-stone-900 to-stone-950 border border-amber-500/30 shadow-2xl backdrop-blur-xl overflow-hidden"
              >
                <div className="flex items-center justify-between pb-2 border-b border-stone-800">
                  <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold uppercase tracking-wider">
                    <span>💬</span>
                    <span>Conversation Spark</span>
                  </div>
                  <span className="text-xs text-stone-500">Tap to flip back</span>
                </div>

                <div className="my-auto space-y-4 text-center py-2">
                  <div className="w-12 h-12 mx-auto rounded-full bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-300 text-xl">
                    💖
                  </div>

                  <div className="space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
                      Ask each other:
                    </span>
                    <p className="text-lg sm:text-xl font-bold text-stone-100 italic leading-relaxed px-2">
                      "{currentDare.conversationStarter}"
                    </p>
                  </div>

                  <p className="text-xs text-stone-400 bg-stone-950/60 p-3 rounded-xl border border-stone-800 leading-normal">
                    🌿 <span className="text-stone-300 font-medium">Marriage Tip:</span> Listen with full attention before sharing your own thoughts.
                  </p>
                </div>

                <div className="pt-2 border-t border-stone-800/80 flex items-center justify-center gap-1.5 text-xs text-amber-400 font-medium">
                  <RotateCcw className="w-3 h-3" />
                  <span>Tap anywhere to flip back</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* --- MINIMALIST THUMB ACTION BAR --- */}
      <div
        id="flashcard-thumb-controls"
        className="w-full max-w-sm mt-4 px-2 flex items-center justify-between gap-3"
      >
        {/* Swipe Left / Previous */}
        <button
          id="btn-prev-card"
          onClick={() => handleSwipe('right')}
          className="p-3.5 rounded-full bg-stone-900/90 hover:bg-stone-800 text-stone-300 border border-stone-800 transition-all shadow-md active:scale-95"
          title="Previous card"
        >
          <ChevronLeft className="w-5 h-5 text-stone-400" />
        </button>

        {/* AI Spark Surprise */}
        <button
          id="btn-ai-spark"
          onClick={() => {
            playSoundEffect('spark');
            triggerHaptic('medium');
            onGenerateAiSpark();
          }}
          disabled={isGeneratingAi}
          className="p-3.5 rounded-full bg-stone-900/90 hover:bg-stone-800 text-amber-300 border border-amber-500/30 transition-all shadow-md active:scale-95 flex items-center justify-center"
          title="Generate fresh AI spark for spouses"
        >
          {isGeneratingAi ? (
            <Loader2 className="w-5 h-5 animate-spin text-amber-400" />
          ) : (
            <Sparkles className="w-5 h-5 text-amber-400" />
          )}
        </button>

        {/* Big Primary Heart / Complete Button */}
        <button
          id="btn-complete-dare"
          onClick={() => {
            playSoundEffect('celebrate');
            triggerHaptic('success');
            onComplete(currentDare);
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-3.5 px-4 rounded-full font-bold text-sm transition-all shadow-lg active:scale-98 ${
            isCompletedToday
              ? 'bg-stone-800 text-emerald-300 border border-emerald-500/40'
              : 'bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 text-stone-950 shadow-rose-950/40 hover:brightness-110'
          }`}
        >
          {isCompletedToday ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Done Today!</span>
            </>
          ) : (
            <>
              <Heart className="w-4 h-4 fill-stone-950 text-stone-950" />
              <span>Spark Completed</span>
            </>
          )}
        </button>

        {/* Swipe Right / Next */}
        <button
          id="btn-next-card"
          onClick={() => handleSwipe('left')}
          className="p-3.5 rounded-full bg-stone-900/90 hover:bg-stone-800 text-stone-300 border border-stone-800 transition-all shadow-md active:scale-95"
          title="Next card"
        >
          <ChevronRight className="w-5 h-5 text-stone-400" />
        </button>
      </div>

      {/* Gentle Swipe Gesture Guide */}
      <p className="text-[11px] text-stone-400 mt-3 text-center">
        ← Swipe left or right to browse cards • Tap to flip →
      </p>
    </div>
  );
};
