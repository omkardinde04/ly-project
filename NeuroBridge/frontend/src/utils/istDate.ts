// All "day" logic (streaks, weekly activity, daily challenge) uses Indian Standard Time.
const IST = 'Asia/Kolkata';

/** YYYY-MM-DD for the given moment in IST */
export const istDayKey = (d: Date | string | number = new Date()): string =>
  new Date(d).toLocaleDateString('en-CA', { timeZone: IST });

/** The 7 YYYY-MM-DD keys (Mon..Sun) of the current IST week */
export const istWeekKeys = (): string[] => {
  const today = new Date(`${istDayKey()}T00:00:00Z`);
  const sinceMonday = (today.getUTCDay() + 6) % 7; // Mon=0 ... Sun=6
  return Array.from({ length: 7 }, (_, i) =>
    new Date(today.getTime() + (i - sinceMonday) * 86400000).toISOString().slice(0, 10)
  );
};