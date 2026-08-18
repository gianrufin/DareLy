export type SpouseVibe = 'today' | 'all' | 'romance' | 'playful' | 'deep' | 'cozy' | 'flirty';

export interface Dare {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  whyItWorks: string;
  estimatedMinutes: number;
  conversationStarter: string;
  spiceLevel: number; // 1 to 4
  category: 'Romance' | 'Playful' | 'Deep' | 'Cozy' | 'Flirty' | 'Custom';
  imageUrl: string;
  dailySlot?: 1 | 2 | 3; // 1: Playful, 2: Romance, 3: Deep
  isAiGenerated?: boolean;
}

export interface CompletedDareMemory {
  id: string;
  dareId: string;
  dareTitle: string;
  dareDescription: string;
  spouseName: string;
  completedAt: string;
  rating: number;
  reflectionNote?: string;
}

export interface UserPreferences {
  voice: 'Kore' | 'Puck' | 'Fenrir' | 'Zephyr' | 'Charon';
  spouseName: string;
}
