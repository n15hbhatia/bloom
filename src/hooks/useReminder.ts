import { useEffect } from 'react';
import { useBloom, getState } from '../state/store';
import { dateKey } from '../utils/dates';

const LAST_KEY = 'bloom.reminder.last';

/**
 * A gentle, once-a-day nudge. Static sites can't send push notifications when
 * closed, so this only fires while BLOOM is open in a tab.
 */
export function useReminder() {
  const { reminders, reminderTime } = useBloom((s) => s.preferences);
  useEffect(() => {
    if (!reminders || typeof Notification === 'undefined') return;
    const check = () => {
      if (Notification.permission !== 'granted') return;
      const now = new Date();
      const [h, m] = reminderTime.split(':').map(Number);
      const due = now.getHours() > h || (now.getHours() === h && now.getMinutes() >= m);
      let last: string | null = null;
      try {
        last = localStorage.getItem(LAST_KEY);
      } catch {
        /* ignore */
      }
      if (!due || last === dateKey()) return;
      const name = getState().profile.name;
      try {
        new Notification('BLOOM', {
          body: `${name ? name + ', w' : 'W'}hen you have a moment, your garden is here for you. No rush.`,
          icon: './favicon.svg',
          tag: 'bloom-daily',
        });
        localStorage.setItem(LAST_KEY, dateKey());
      } catch {
        /* ignore */
      }
    };
    check();
    const id = window.setInterval(check, 60_000);
    return () => window.clearInterval(id);
  }, [reminders, reminderTime]);
}
