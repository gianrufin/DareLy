import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Check, RotateCcw, Volume2, VolumeX, Loader2, Heart, Clock } from 'lucide-react';
import { Dare } from '../types';
import { playSoundEffect, playPcmAudio, stopCurrentAudio } from '../utils/audio';
import { triggerHaptic } from '../utils/haptics';

interface MinimalCardCarouselProps {
  dares: Dare[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
  onComplete: (dare: Dare) => void;
  completedDareIdsToday: Set<string>;
  spouseName: string;
  isTodayMode: boolean;
  timeRemainingStr: string;
}

export const MinimalCardCarousel: React.FC<MinimalCardCarouselProps> = ({
  dares,
  currentIndex,
  onIndexChange,
  onComplete,
  completedDareIdsToday,
  spouseName,
  isTodayMode,
  timeRemainingStr,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);

  const currentDare = dares[currentIndex] || dares[0];
  const nextDare = dares[(currentIndex + 1) % dares.length];
  const isThisDareCompletedToday = completedDareIdsToday.has(currentDare.id);

  const handleNext = () => {
    playSoundEffect('draw');
    triggerHaptic('light');
    stopCurrentAudio();
    setIsPlayingAudio(false);
    setIsFlipped(false);
    onIndexChange((currentIndex + 1) % dares.length);
  };

  const handlePrev = () => {
    playSoundEffect('draw');
    triggerHaptic('light');
    stopCurrentAudio();
    setIsPlayingAudio(false);
    setIsFlipped(false);
    onIndexChange((currentIndex - 1 + dares.length) % dares.length);
  };

  const handleCardClick = () => {
    playSoundEffect('flip');
    triggerHaptic('light');
    setIsFlipped(!isFlipped);
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
      const text = `${currentDare.title}. ${currentDare.description}. Conversation prompt: ${currentDare.conversationStarter}`;
      const res = await fetch('/api/dares/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voice: 'Kore' }),
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

  const partnerName = spouseName.trim() || 'your spouse';

  return (
    <div className="w-full relative flex flex-col items-center justify-center select-none space-y-3">
      {/* Daily Progress Tracker Header (Only in Today's mode) */}
      {isTodayMode && (
        <div className="w-full max-w-[340px] flex items-center justify-between px-1 text-xs">
          {/* 3 Pill Progress Dots */}
          <div className="flex items-center gap-1.5">
            {dares.map((d, idx) => {
              const done = completedDareIdsToday.has(d.id);
              const isActive = idx === currentIndex;
              return (
                <button
                  key={d.id}
                  onClick={() => onIndexChange(idx)}
                  className={`h-2 rounded-full transition-all ${
                    isActive
                      ? 'w-6 bg-stone-900'
                      : done
                      ? 'w-2.5 bg-stone-700'
                      : 'w-2 bg-stone-300'
                  }`}
                  title={`Spark ${idx + 1}: ${d.title} (${done ? 'Completed' : 'Pending'})`}
                />
              );
            })}
            <span className="text-[11px] font-semibold text-stone-500 ml-1">
              Spark {currentIndex + 1} of 3
            </span>
          </div>

          {/* Countdown to Next Midnight Refresh */}
          <div className="flex items-center gap-1 text-[11px] text-stone-400 font-mono">
            <Clock className="w-3 h-3 stroke-[1.8]" />
            <span>{timeRemainingStr}</span>
          </div>
        </div>
      )}

      {/* Main Carousel Area */}
      <div className="w-full max-w-[320px] sm:max-w-[340px] aspect-[1/1.36] relative [perspective:1200px]">
        {/* Next Card Peek on the right (Matches reference video) */}
        {nextDare && dares.length > 1 && (
          <div
            onClick={handleNext}
            className="absolute top-3 -right-8 w-full h-[94%] rounded-[32px] overflow-hidden bg-stone-200 shadow-md opacity-40 transform translate-x-3 scale-95 cursor-pointer pointer-events-auto transition-transform"
          >
            <img
              src={nextDare.imageUrl}
              alt={nextDare.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover grayscale opacity-50"
            />
          </div>
        )}

        {/* Active Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentDare.id}
            initial={{ scale: 0.95, opacity: 0, x: 40 }}
            animate={{ scale: 1, opacity: 1, x: 0 }}
            exit={{ scale: 0.95, opacity: 0, x: -40 }}
            transition={{ duration: 0.26, ease: 'easeOut' }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.35}
            onDragEnd={(_, info) => {
              if (info.offset.x < -60) {
                handleNext();
              } else if (info.offset.x > 60) {
                handlePrev();
              }
            }}
            className="w-full h-full relative cursor-pointer"
          >
            {/* 3D Flip Container */}
            <motion.div
              animate={{ rotateY: isFlipped ? 180 : 0 }}
              transition={{ duration: 0.45, ease: 'easeInOut' }}
              onClick={handleCardClick}
              className="w-full h-full relative [transform-style:preserve-3d]"
            >
              {/* --- FRONT OF CARD --- */}
              <div
                id={`card-front-${currentDare.id}`}
                className="absolute inset-0 w-full h-full rounded-[32px] overflow-hidden shadow-xl bg-white border border-stone-200/60 flex flex-col justify-between [backface-visibility:hidden]"
              >
                {/* Upper Image Section */}
                <div className="relative flex-1 w-full bg-stone-100 overflow-hidden">
                  <img
                    src={currentDare.imageUrl}
                    alt={currentDare.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />

                  {/* Top-Right Duration Pill */}
                  <div className="absolute top-3.5 right-3.5 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-stone-800 shadow-sm border border-black/5">
                    {currentDare.estimatedMinutes} min
                  </div>

                  {/* Top-Left Category & Daily Slot Pill */}
                  <div className="absolute top-3.5 left-3.5 flex items-center gap-1.5">
                    <span className="bg-stone-900/85 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-medium text-white shadow-sm">
                      {isTodayMode ? `Daily #${currentIndex + 1} • ${currentDare.category}` : currentDare.category}
                    </span>
                  </div>

                  {/* Audio Listen Button */}
                  <button
                    onClick={handleTTS}
                    className={`absolute bottom-3 left-3 p-2 rounded-full backdrop-blur-md transition-all ${
                      isPlayingAudio
                        ? 'bg-stone-900 text-white shadow-md'
                        : 'bg-white/85 text-stone-700 hover:bg-white'
                    }`}
                    title="Listen to dare narration"
                  >
                    {audioLoading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : isPlayingAudio ? (
                      <VolumeX className="w-3.5 h-3.5" />
                    ) : (
                      <Volume2 className="w-3.5 h-3.5 stroke-[1.8]" />
                    )}
                  </button>

                  {/* Completed Badge Indicator */}
                  {isThisDareCompletedToday && (
                    <div className="absolute bottom-3 right-3 bg-stone-900 text-white px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 shadow-md">
                      <Check className="w-3 h-3 stroke-[2.5]" />
                      <span>Completed</span>
                    </div>
                  )}
                </div>

                {/* Bottom Dock on Card (Exact Match to Video) */}
                <div className="p-4 sm:p-5 bg-white flex items-center justify-between">
                  <div className="pr-3 flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-bold text-stone-900 tracking-tight leading-snug truncate">
                      {currentDare.title}
                    </h3>
                    <p className="text-xs text-stone-400 mt-0.5 truncate">
                      {currentDare.subtitle}
                    </p>
                  </div>

                  {/* Circular Black Action Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      playSoundEffect('accept');
                      triggerHaptic('success');
                      onComplete(currentDare);
                    }}
                    className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shrink-0 shadow-md transition-transform active:scale-90 ${
                      isThisDareCompletedToday
                        ? 'bg-stone-800 text-stone-300'
                        : 'bg-stone-900 text-white hover:bg-stone-800'
                    }`}
                    title={isThisDareCompletedToday ? 'Completed' : 'Mark spark completed'}
                  >
                    {isThisDareCompletedToday ? (
                      <Check className="w-5 h-5 stroke-[2.5]" />
                    ) : (
                      <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-white ml-0.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* --- BACK OF CARD (Conversation Spark) --- */}
              <div
                id={`card-back-${currentDare.id}`}
                className="absolute inset-0 w-full h-full rounded-[32px] p-6 bg-stone-900 text-white [transform:rotateY(180deg)] [backface-visibility:hidden] flex flex-col justify-between shadow-xl border border-stone-800"
              >
                {/* Header */}
                <div className="flex items-center justify-between text-xs text-stone-400 border-b border-stone-800 pb-2">
                  <span className="font-semibold text-stone-300">Conversation Spark</span>
                  <span className="text-[11px]">Tap anywhere to flip back</span>
                </div>

                {/* Body Prompt */}
                <div className="my-auto space-y-3.5 text-center">
                  <div className="w-9 h-9 mx-auto rounded-full bg-stone-800 flex items-center justify-center text-stone-200">
                    <Heart className="w-4 h-4 stroke-[1.8]" />
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400">
                      Ask {partnerName}:
                    </p>
                    <p className="text-sm sm:text-base font-bold text-stone-100 italic leading-relaxed px-1">
                      "{currentDare.conversationStarter}"
                    </p>
                  </div>
                  <p className="text-xs text-stone-400 bg-stone-950/80 p-3 rounded-2xl border border-stone-800/80 leading-relaxed">
                    {currentDare.description}
                  </p>
                </div>

                {/* Footer */}
                <div className="pt-2 border-t border-stone-800 flex items-center justify-center gap-1.5 text-xs text-stone-400 font-medium">
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Tap to flip card</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
