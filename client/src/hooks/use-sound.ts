import { soundManager } from '@/lib/sounds';

export function useSound() {
  return {
    playWin: () => soundManager.playWin(),
    playLoss: () => soundManager.playLoss(),
    playMatchStart: () => soundManager.playMatchStart(),
    playClick: () => soundManager.playClick(),
    playMessageSent: () => soundManager.playMessageSent(),
    playTurnComplete: () => soundManager.playTurnComplete(),
    playStreak: () => soundManager.playStreak(),
    playDailyStreak: () => soundManager.playDailyStreak(),
    playPremiumCelebration: () => soundManager.playPremiumCelebration(),
    playError: () => soundManager.playError(),
    playTimeWarning: () => soundManager.playTimeWarning(),
    setEnabled: (enabled: boolean) => soundManager.setEnabled(enabled),
    isEnabled: () => soundManager.isEnabled(),
    resumeAudio: () => soundManager.resumeAudio(),
  };
}
