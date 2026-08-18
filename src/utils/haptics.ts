// Haptics utility for mobile and one-hand interactions

export function triggerHaptic(type: 'light' | 'medium' | 'success' | 'warning' = 'light') {
  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
    try {
      if (type === 'light') {
        navigator.vibrate(12);
      } else if (type === 'medium') {
        navigator.vibrate(28);
      } else if (type === 'success') {
        navigator.vibrate([20, 50, 30]);
      } else if (type === 'warning') {
        navigator.vibrate([40, 40, 40]);
      }
    } catch {
      // Ignored if device doesn't support or permission blocked
    }
  }
}
