import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, ArrowLeft, Heart, Sparkles, Flame, Clock, Check, User, Users } from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserPreferences } from '../types';
import { playSoundEffect } from '../utils/audio';
import { triggerHaptic } from '../utils/haptics';
import danceImg from '../assets/images/abstract_dance_blur_1787059943370.jpg';

interface OnboardingFlowProps {
  onComplete: (prefs: UserPreferences) => void;
  initialPrefs?: UserPreferences;
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete, initialPrefs }) => {
  const [step, setStep] = useState(1);
  const [userName, setUserName] = useState(initialPrefs?.userName || '');
  const [spouseName, setSpouseName] = useState(initialPrefs?.spouseName || '');
  const [relationshipDuration, setRelationshipDuration] = useState(
    initialPrefs?.relationshipDuration || '1–5 years'
  );
  const [primaryDesire, setPrimaryDesire] = useState(
    initialPrefs?.primaryDesire || 'Romantic Touch & Closeness'
  );
  const [notificationTime, setNotificationTime] = useState(
    initialPrefs?.notificationTime || 'Evening'
  );

  const handleNext = () => {
    playSoundEffect('tap');
    triggerHaptic('light');
    if (step < 4) {
      setStep(step + 1);
    }
  };

  const handlePrev = () => {
    playSoundEffect('tap');
    triggerHaptic('light');
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleFinish = () => {
    playSoundEffect('spark');
    triggerHaptic('success');
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#1c1917', '#44403c', '#78716c', '#f5f5f4'],
      });
    } catch {}

    const completedPrefs: UserPreferences = {
      userName: userName.trim() || 'Alex',
      spouseName: spouseName.trim() || 'Sam',
      relationshipDuration,
      primaryDesire,
      notificationTime,
      voice: 'Kore',
      isOnboarded: true,
    };

    onComplete(completedPrefs);
  };

  const totalSteps = 4;

  return (
    <div
      id="onboarding-container"
      className="w-full h-full min-h-[100dvh] sm:min-h-[720px] sm:max-w-[400px] bg-[#fbf9f5] rounded-none sm:rounded-[44px] shadow-none sm:shadow-2xl p-5 sm:p-7 flex flex-col justify-between relative border-0 sm:border sm:border-stone-200/60 overflow-hidden select-none font-sans text-stone-900"
    >
      {/* Top Header & Progress */}
      <div className="space-y-4 pt-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {step > 1 ? (
              <button
                onClick={handlePrev}
                className="p-1.5 -ml-1.5 rounded-full text-stone-400 hover:text-stone-800 hover:bg-stone-100 transition-colors"
                title="Previous step"
              >
                <ArrowLeft className="w-4 h-4 stroke-[2]" />
              </button>
            ) : (
              <div className="w-7 h-7 rounded-full bg-stone-900 text-white flex items-center justify-center shadow-sm">
                <Heart className="w-3.5 h-3.5 stroke-[2]" />
              </div>
            )}
            <span className="text-sm font-bold tracking-tight text-stone-900">DareLy</span>
          </div>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i + 1 === step
                    ? 'w-6 bg-stone-900'
                    : i + 1 < step
                    ? 'w-2 bg-stone-600'
                    : 'w-2 bg-stone-200'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Step Content with Motion Transitions */}
      <div className="my-auto py-2">
        <AnimatePresence mode="wait">
          {/* STEP 1: Welcome & Visual Showcase */}
          {step === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: 18 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -18 }}
              transition={{ duration: 0.22 }}
              className="space-y-5"
            >
              {/* Preview Hero Card */}
              <div className="w-full aspect-[4/3] rounded-[28px] overflow-hidden relative shadow-md bg-stone-100 border border-stone-200/60">
                <img
                  src={danceImg}
                  alt="DareLy Showcase"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[10px] font-semibold text-stone-800 shadow-sm">
                  Daily 3 Sparks
                </div>
              </div>

              <div className="space-y-1.5 text-center">
                <h2 className="text-2xl font-bold tracking-tight text-stone-900">
                  Micro-Moments for Married Life
                </h2>
                <p className="text-xs font-normal text-stone-500 leading-relaxed max-w-[280px] mx-auto">
                  3 simple, intentional sparks dealt every day at midnight to keep your marriage playful, affectionate, and close.
                </p>
              </div>

              {/* Value Pillars */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-stone-200/60 shadow-sm">
                  <div className="w-8 h-8 rounded-xl bg-stone-100 flex items-center justify-center text-stone-900 shrink-0">
                    <Sparkles className="w-4 h-4 stroke-[1.8]" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-stone-900 tracking-tight">3 Sparks a Day</p>
                    <p className="text-[10px] font-normal text-stone-400">Playful, Romantic Touch & Deep Conversation</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-stone-200/60 shadow-sm">
                  <div className="w-8 h-8 rounded-xl bg-stone-100 flex items-center justify-center text-stone-900 shrink-0">
                    <Flame className="w-4 h-4 stroke-[1.8]" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-stone-900 tracking-tight">Daily Streak Rhythm</p>
                    <p className="text-[10px] font-normal text-stone-400">Build small, consistent connection habits</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 2: Names & Couple Identity */}
          {step === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: 18 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -18 }}
              transition={{ duration: 0.22 }}
              className="space-y-4"
            >
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-stone-900 tracking-tight">
                  Who is this ritual for?
                </h2>
                <p className="text-xs font-normal text-stone-400">
                  We customize your daily spark cards and prompts with your names.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-stone-600 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 stroke-[1.8]" />
                    <span>Your First Name</span>
                  </label>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="e.g. Alex"
                    className="w-full p-3.5 rounded-2xl bg-white border border-stone-200 text-xs text-stone-900 font-medium focus:outline-none focus:border-stone-900 shadow-sm transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-stone-600 flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5 stroke-[1.8]" />
                    <span>Your Spouse's Name</span>
                  </label>
                  <input
                    type="text"
                    value={spouseName}
                    onChange={(e) => setSpouseName(e.target.value)}
                    placeholder="e.g. Sam"
                    className="w-full p-3.5 rounded-2xl bg-white border border-stone-200 text-xs text-stone-900 font-medium focus:outline-none focus:border-stone-900 shadow-sm transition-colors"
                  />
                </div>

                <div className="space-y-1.5 pt-1">
                  <label className="text-[11px] font-semibold text-stone-600 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 stroke-[1.8]" />
                    <span>How long have you two been together?</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {['< 1 year', '1–5 years', '5–10 years', '10+ years'].map((dur) => (
                      <button
                        key={dur}
                        type="button"
                        onClick={() => {
                          playSoundEffect('tap');
                          setRelationshipDuration(dur);
                        }}
                        className={`p-2.5 rounded-xl text-xs font-semibold transition-all ${
                          relationshipDuration === dur
                            ? 'bg-stone-900 text-white shadow-sm'
                            : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
                        }`}
                      >
                        {dur}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 3: Connection Preferences */}
          {step === 3 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, x: 18 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -18 }}
              transition={{ duration: 0.22 }}
              className="space-y-4"
            >
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-stone-900 tracking-tight">
                  What spark do you crave most?
                </h2>
                <p className="text-xs font-normal text-stone-400">
                  Select your primary intention to calibrate your daily card balance.
                </p>
              </div>

              <div className="space-y-2 pt-1">
                {[
                  {
                    title: 'Spontaneous Play & Laughter',
                    desc: 'Micro-games, teasing dares, surprise pantry tests',
                  },
                  {
                    title: 'Romantic Touch & Closeness',
                    desc: 'Prolonged embraces, massages, whispered confessions',
                  },
                  {
                    title: 'Deep Late-Night Talks',
                    desc: 'Vulnerability swaps, future dreaming, eye gazing',
                  },
                  {
                    title: 'Cozy Unwinding & Presence',
                    desc: 'Screen-free tea rituals, balcony stargazing, slow sips',
                  },
                ].map((item) => (
                  <button
                    key={item.title}
                    type="button"
                    onClick={() => {
                      playSoundEffect('tap');
                      setPrimaryDesire(item.title);
                    }}
                    className={`w-full p-3 text-left rounded-2xl border transition-all ${
                      primaryDesire === item.title
                        ? 'bg-stone-900 text-white border-stone-900 shadow-sm'
                        : 'bg-white text-stone-800 border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    <p className="text-xs font-bold tracking-tight">{item.title}</p>
                    <p
                      className={`text-[10px] font-normal mt-0.5 ${
                        primaryDesire === item.title ? 'text-stone-300' : 'text-stone-400'
                      }`}
                    >
                      {item.desc}
                    </p>
                  </button>
                ))}
              </div>

              <div className="space-y-1.5 pt-1">
                <label className="text-[11px] font-semibold text-stone-600 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 stroke-[1.8]" />
                  <span>When do you usually spend time together?</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['Morning', 'Evening', 'Late Night'].map((time) => (
                    <button
                      key={time}
                      type="button"
                      onClick={() => {
                        playSoundEffect('tap');
                        setNotificationTime(time);
                      }}
                      className={`p-2.5 rounded-xl text-xs font-semibold transition-all ${
                        notificationTime.includes(time)
                          ? 'bg-stone-900 text-white shadow-sm'
                          : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 4: Ready to Launch */}
          {step === 4 && (
            <motion.div
              key="step-4"
              initial={{ opacity: 0, x: 18 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -18 }}
              transition={{ duration: 0.22 }}
              className="space-y-5 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-stone-900 text-white mx-auto flex items-center justify-center shadow-lg">
                <Sparkles className="w-7 h-7 stroke-[1.8]" />
              </div>

              <div className="space-y-1">
                <h2 className="text-2xl font-bold text-stone-900 tracking-tight">
                  You're Ready
                </h2>
                <p className="text-xs font-normal text-stone-500 max-w-[260px] mx-auto leading-relaxed">
                  Your personalized deck for{' '}
                  <span className="font-bold text-stone-900">{userName || 'Alex'}</span> &{' '}
                  <span className="font-bold text-stone-900">{spouseName || 'Sam'}</span> is
                  dealt for today.
                </p>
              </div>

              <div className="p-4 rounded-3xl bg-white border border-stone-200/80 shadow-sm space-y-2.5 text-left text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                  <span className="text-stone-400 font-medium text-[11px]">Today's Ritual</span>
                  <span className="font-bold text-stone-900">3 Fresh Sparks</span>
                </div>
                <div className="flex items-center gap-2 text-stone-700 font-medium">
                  <Check className="w-3.5 h-3.5 text-stone-900 stroke-[2.5]" />
                  <span>1 Playful sensory dare</span>
                </div>
                <div className="flex items-center gap-2 text-stone-700 font-medium">
                  <Check className="w-3.5 h-3.5 text-stone-900 stroke-[2.5]" />
                  <span>1 Romantic touch moment</span>
                </div>
                <div className="flex items-center gap-2 text-stone-700 font-medium">
                  <Check className="w-3.5 h-3.5 text-stone-900 stroke-[2.5]" />
                  <span>1 Deep bedtime conversation</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Action Button */}
      <div className="pt-2">
        {step < 4 ? (
          <button
            onClick={handleNext}
            className="w-full py-4 rounded-full bg-stone-900 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md hover:bg-stone-800 active:scale-95 transition-all"
          >
            <span>Continue</span>
            <ArrowRight className="w-4 h-4 stroke-[2]" />
          </button>
        ) : (
          <button
            onClick={handleFinish}
            className="w-full py-4 rounded-full bg-stone-900 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md hover:bg-stone-800 active:scale-95 transition-all"
          >
            <Sparkles className="w-4 h-4 stroke-[2]" />
            <span>Deal Today's 3 Sparks</span>
          </button>
        )}
      </div>
    </div>
  );
};
