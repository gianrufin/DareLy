import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { Bell } from 'lucide-react';
import { Dare, SpouseVibe, CompletedDareMemory, UserPreferences } from './types';
import { SPOUSE_DARES } from './data/presetDares';
import { getDailyThreeSparks, getTimeUntilMidnight } from './utils/dailyDeck';
import { MinimalCardCarousel } from './components/MinimalCardCarousel';
import { FilterPills } from './components/FilterPills';
import { BottomNavBar, TabType } from './components/BottomNavBar';
import { JournalModal, AiGeneratorModal, StreakProfileModal } from './components/MinimalModals';
import { OnboardingFlow } from './components/OnboardingFlow';

const STORAGE_KEYS = {
  PREFERENCES: 'darely_minimal_prefs_v4',
  MEMORIES: 'darely_minimal_memories_v4',
  CUSTOM_DARES: 'darely_minimal_custom_dares_v4',
  STREAK: 'darely_minimal_streak_v4',
  SELECTED_VIBE: 'darely_minimal_vibe_v4',
  TODAY_COMPLETED_IDS: 'darely_today_completed_ids_v4',
};

const DEFAULT_PREFERENCES: UserPreferences = {
  userName: '',
  spouseName: '',
  relationshipDuration: '1–5 years',
  primaryDesire: 'Romantic Touch & Closeness',
  notificationTime: 'Evening',
  voice: 'Kore',
  isOnboarded: false, // Starts in onboarding for official first-time launch
};

export default function App() {
  // 1. Preferences & Onboarding State
  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
      return saved ? { ...DEFAULT_PREFERENCES, ...JSON.parse(saved) } : DEFAULT_PREFERENCES;
    } catch {
      return DEFAULT_PREFERENCES;
    }
  });

  // 2. Selected Vibe (default: 'today' for the Daily 3 Sparks)
  const [selectedVibe, setSelectedVibe] = useState<SpouseVibe>(() => {
    try {
      return (localStorage.getItem(STORAGE_KEYS.SELECTED_VIBE) as SpouseVibe) || 'today';
    } catch {
      return 'today';
    }
  });

  // 3. Custom / AI Dares
  const [customDares, setCustomDares] = useState<Dare[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CUSTOM_DARES);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // 4. Completed Memories
  const [memories, setMemories] = useState<CompletedDareMemory[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MEMORIES);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // 5. Daily Streak Tracker
  const [streakData, setStreakData] = useState<{
    currentStreak: number;
    bestStreak: number;
    lastCompletedDate: string | null;
  }>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.STREAK);
      return saved
        ? JSON.parse(saved)
        : { currentStreak: 1, bestStreak: 1, lastCompletedDate: null };
    } catch {
      return { currentStreak: 1, bestStreak: 1, lastCompletedDate: null };
    }
  });

  // 6. Completed Dare IDs for Today
  const todayDateKey = new Date().toISOString().split('T')[0];
  const [completedTodayRecord, setCompletedTodayRecord] = useState<{
    date: string;
    ids: string[];
  }>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TODAY_COMPLETED_IDS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.date === todayDateKey) {
          return parsed;
        }
      }
      return { date: todayDateKey, ids: [] };
    } catch {
      return { date: todayDateKey, ids: [] };
    }
  });

  // 7. Navigation & Modals
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<TabType>('cards');
  const [showJournalModal, setShowJournalModal] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [showStreakModal, setShowStreakModal] = useState(false);
  const [timeRemainingStr, setTimeRemainingStr] = useState('');

  // Real-time Countdown Timer until next midnight refresh
  useEffect(() => {
    const updateCountdown = () => {
      const { formatted } = getTimeUntilMidnight();
      setTimeRemainingStr(formatted);
    };
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  // Persistence
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(preferences));
    } catch {}
  }, [preferences]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SELECTED_VIBE, selectedVibe);
    } catch {}
  }, [selectedVibe]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CUSTOM_DARES, JSON.stringify(customDares));
    } catch {}
  }, [customDares]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.MEMORIES, JSON.stringify(memories));
    } catch {}
  }, [memories]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.STREAK, JSON.stringify(streakData));
    } catch {}
  }, [streakData]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TODAY_COMPLETED_IDS, JSON.stringify(completedTodayRecord));
    } catch {}
  }, [completedTodayRecord]);

  // Today's Deterministic 3 Sparks
  const dailyThree = useMemo(() => {
    return getDailyThreeSparks(new Date());
  }, []);

  // Set of completed IDs today
  const completedDareIdsToday = useMemo(() => {
    return new Set(completedTodayRecord.date === todayDateKey ? completedTodayRecord.ids : []);
  }, [completedTodayRecord, todayDateKey]);

  // How many of today's 3 are completed
  const dailyCompletedCount = useMemo(() => {
    return dailyThree.filter((d) => completedDareIdsToday.has(d.id)).length;
  }, [dailyThree, completedDareIdsToday]);

  // All Dares combined
  const allDares = useMemo(() => {
    return [...customDares, ...SPOUSE_DARES];
  }, [customDares]);

  // Counts for filter pills
  const categoryCounts = useMemo(() => {
    const counts: Record<SpouseVibe, number> = {
      today: 3,
      all: allDares.length,
      romance: 0,
      playful: 0,
      deep: 0,
      cozy: 0,
      flirty: 0,
    };

    allDares.forEach((d) => {
      const cat = d.category.toLowerCase() as SpouseVibe;
      if (counts[cat] !== undefined) {
        counts[cat]++;
      }
    });

    return counts;
  }, [allDares]);

  // Active Dares for selected filter
  const activeDaresList = useMemo(() => {
    if (selectedVibe === 'today') {
      return dailyThree;
    }
    if (selectedVibe === 'all') {
      return allDares;
    }
    return allDares.filter((d) => d.category.toLowerCase() === selectedVibe);
  }, [selectedVibe, dailyThree, allDares]);

  const todayStr = new Date().toDateString();

  // Complete spark handler
  const handleComplete = (dare: Dare) => {
    try {
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.75 },
        colors: ['#1c1917', '#44403c', '#78716c', '#f5f5f4'],
      });
    } catch {}

    const newMemory: CompletedDareMemory = {
      id: `mem-${Date.now()}`,
      dareId: dare.id,
      dareTitle: dare.title,
      dareDescription: dare.description,
      spouseName: preferences.spouseName || 'Spouse',
      completedAt: new Date().toISOString(),
      rating: 5,
    };

    setMemories((prev) => [newMemory, ...prev]);

    // Record today's completed ID
    setCompletedTodayRecord((prev) => {
      const isSameDay = prev.date === todayDateKey;
      const currentIds = isSameDay ? prev.ids : [];
      if (!currentIds.includes(dare.id)) {
        return { date: todayDateKey, ids: [...currentIds, dare.id] };
      }
      return prev;
    });

    // Advance daily streak
    setStreakData((prev) => {
      const nextStreak = prev.lastCompletedDate === todayStr ? prev.currentStreak : prev.currentStreak + 1;
      return {
        currentStreak: nextStreak,
        bestStreak: Math.max(prev.bestStreak, nextStreak),
        lastCompletedDate: todayStr,
      };
    });

    // Auto-advance to the next card in carousel after 600ms
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % activeDaresList.length);
    }, 600);
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    if (tab === 'journal') {
      setShowJournalModal(true);
    } else if (tab === 'ai') {
      setShowAiModal(true);
    } else if (tab === 'streak') {
      setShowStreakModal(true);
    }
  };

  const handleAddAiDare = (newDare: Dare) => {
    setCustomDares((prev) => [newDare, ...prev]);
    setSelectedVibe('all');
    setCurrentIndex(0);
    setActiveTab('cards');
  };

  const handleResetApp = () => {
    localStorage.removeItem(STORAGE_KEYS.PREFERENCES);
    localStorage.removeItem(STORAGE_KEYS.MEMORIES);
    localStorage.removeItem(STORAGE_KEYS.CUSTOM_DARES);
    localStorage.removeItem(STORAGE_KEYS.STREAK);
    localStorage.removeItem(STORAGE_KEYS.TODAY_COMPLETED_IDS);
    setPreferences(DEFAULT_PREFERENCES);
    setMemories([]);
    setCustomDares([]);
    setStreakData({ currentStreak: 1, bestStreak: 1, lastCompletedDate: null });
    setCompletedTodayRecord({ date: todayDateKey, ids: [] });
    setSelectedVibe('today');
    setCurrentIndex(0);
    setShowStreakModal(false);
  };

  return (
    <main className="min-h-[100dvh] w-full bg-[#f4f0e8] flex items-center justify-center p-3 sm:p-6 font-sans text-stone-900 selection:bg-stone-900 selection:text-white">
      {!preferences.isOnboarded ? (
        /* --- FIRST TIME LAUNCH: ONBOARDING FLOW --- */
        <OnboardingFlow
          initialPrefs={preferences}
          onComplete={(newPrefs) => {
            setPreferences(newPrefs);
            setSelectedVibe('today');
            setCurrentIndex(0);
          }}
        />
      ) : (
        /* --- MAIN APP INTERFACE (Matches uploaded reference video) --- */
        <div
          id="darely-app-container"
          className="w-full max-w-[390px] min-h-[720px] bg-[#fbf9f5] rounded-[44px] shadow-2xl p-6 flex flex-col justify-between relative border border-stone-200/60 overflow-hidden"
        >
          {/* Top Section */}
          <div className="space-y-4">
            {/* Header Row */}
            <div className="flex items-center justify-between pt-1">
              <div>
                <h1 className="text-2xl font-black text-stone-900 tracking-tight">
                  DareLy
                </h1>
                <p className="text-[11px] text-stone-400 font-medium -mt-0.5">
                  {preferences.userName && preferences.spouseName
                    ? `${preferences.userName} & ${preferences.spouseName}`
                    : '3 Daily Sparks for Spouses'}
                </p>
              </div>

              {/* Notification / Profile Button with line icon */}
              <button
                onClick={() => setShowStreakModal(true)}
                className="relative p-2 rounded-full hover:bg-stone-100 transition-colors"
                title="Settings & Spouse Profile"
              >
                <div className="w-8 h-8 rounded-full bg-stone-900 text-white flex items-center justify-center shadow-sm">
                  <Bell className="w-4 h-4 stroke-[2]" />
                </div>
                <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-rose-500 border-2 border-[#fbf9f5]" />
              </button>
            </div>

            {/* Filter Pills Row with "Today's 3" */}
            <FilterPills
              selectedVibe={selectedVibe}
              onSelectVibe={(vibe) => {
                setSelectedVibe(vibe);
                setCurrentIndex(0);
              }}
              counts={categoryCounts}
              dailyCompletedCount={dailyCompletedCount}
            />
          </div>

          {/* Center Card Carousel */}
          <div className="my-auto py-2">
            <MinimalCardCarousel
              dares={activeDaresList}
              currentIndex={currentIndex}
              onIndexChange={setCurrentIndex}
              onComplete={handleComplete}
              completedDareIdsToday={completedDareIdsToday}
              spouseName={preferences.spouseName}
              isTodayMode={selectedVibe === 'today'}
              timeRemainingStr={timeRemainingStr}
            />
          </div>

          {/* Bottom Dock Navigation */}
          <div className="pt-2">
            <BottomNavBar
              activeTab={activeTab}
              onTabChange={handleTabChange}
              streakCount={streakData.currentStreak}
              memoryCount={memories.length}
            />
          </div>
        </div>
      )}

      {/* Sparks Journal Modal */}
      <JournalModal
        isOpen={showJournalModal}
        onClose={() => {
          setShowJournalModal(false);
          setActiveTab('cards');
        }}
        memories={memories}
        onDeleteMemory={(id) => setMemories((prev) => prev.filter((m) => m.id !== id))}
        streakCount={streakData.currentStreak}
      />

      {/* AI Generator Modal */}
      <AiGeneratorModal
        isOpen={showAiModal}
        onClose={() => {
          setShowAiModal(false);
          setActiveTab('cards');
        }}
        spouseName={preferences.spouseName}
        onGenerated={handleAddAiDare}
      />

      {/* Streak & Spouse Profile Modal */}
      <StreakProfileModal
        isOpen={showStreakModal}
        onClose={() => {
          setShowStreakModal(false);
          setActiveTab('cards');
        }}
        streakCount={streakData.currentStreak}
        bestStreak={streakData.bestStreak}
        preferences={preferences}
        onUpdatePreferences={(updated) => setPreferences((p) => ({ ...p, ...updated }))}
        onResetApp={handleResetApp}
      />
    </main>
  );
}
