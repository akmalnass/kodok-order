// NotificationSoundManager.js
// Handles unlocking and playing notification sounds across all platforms (including iOS)

import notificationSound from '../../assets/notification.mp3';

class NotificationSoundManager {
  constructor() {
    this.audio = null;
    this.isUnlocked = false;
  }

  unlock() {
    if (this.isUnlocked) return;
    this.audio = new Audio(notificationSound);
    this.audio.preload = 'auto';
    this.audio.volume = 0;
    // Try to play and immediately pause to unlock
    this.audio.play().then(() => {
      this.audio.pause();
      this.audio.currentTime = 0;
      this.audio.volume = 1;
      this.isUnlocked = true;
    }).catch(() => {
      // Ignore errors, will retry on next interaction
    });
  }

  play() {
    if (!this.isUnlocked) return;
    if (!this.audio) return;
    this.audio.currentTime = 0;
    this.audio.play().catch((err) => {
      // If play fails, try to unlock again on next interaction
      this.isUnlocked = false;
    });
  }
}

const notificationSoundManager = new NotificationSoundManager();
export default notificationSoundManager;
