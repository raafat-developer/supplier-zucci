// src/utils/sound.js — Helper to play notification audio
import notifSoundUrl from '@/assets/notification.mp3';

let isAudioUnlocked = false;

// Unlock Web Audio on first user gesture anywhere on the document
if (typeof window !== 'undefined') {
  const unlockAudio = () => {
    if (isAudioUnlocked) return;
    try {
      const a = new Audio(notifSoundUrl || '/notification.mp3');
      a.volume = 0.01;
      const p = a.play();
      if (p !== undefined) {
        p.then(() => {
          a.pause();
          a.currentTime = 0;
          isAudioUnlocked = true;
        }).catch(() => { });
      }
    } catch (e) { }
  };
  window.addEventListener('click', unlockAudio, { once: true });
  window.addEventListener('keydown', unlockAudio, { once: true });
  window.addEventListener('touchstart', unlockAudio, { once: true });
}

export function playNotificationSound() {
  try {
    const audio = new Audio(notifSoundUrl || '/notification.mp3');
    audio.currentTime = 0;
    const promise = audio.play();
    if (promise !== undefined) {
      promise.catch(() => {});
    }
  } catch (err) {
    console.warn('[Notification Sound] Audio error:', err);
  }
}

export default playNotificationSound;
