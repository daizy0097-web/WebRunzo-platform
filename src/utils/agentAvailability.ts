import { useState, useEffect } from 'react';
import { AdminSettings, AgentAvailabilityStatus } from '../types';

export interface AgentAvailabilityResult {
  status: AgentAvailabilityStatus;
  label: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  dotColor: string;
  dotPulse: boolean;
  statusMessage: string;
  hoursSummary: string;
  currentTimeFormatted: string;
  isOnline: boolean;
  isAway: boolean;
  isOffline: boolean;
  reason: string;
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const FULL_DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * Format minutes from midnight to 12-hour AM/PM string (e.g. 540 -> "9:00 AM")
 */
function formatTime12h(timeStr: string): string {
  if (!timeStr || !timeStr.includes(':')) return timeStr || '9:00 AM';
  const [hourStr, minStr] = timeStr.split(':');
  let h = parseInt(hourStr, 10);
  const m = parseInt(minStr, 10);
  if (isNaN(h) || isNaN(m)) return timeStr;
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  if (h === 0) h = 12;
  const formattedMin = m < 10 ? `0${m}` : `${m}`;
  return `${h}:${formattedMin} ${ampm}`;
}

/**
 * Generates a human-readable days summary (e.g. "Mon - Sat" or "Mon, Wed, Fri")
 */
function formatDaysSummary(days: number[] = [1, 2, 3, 4, 5, 6]): string {
  if (!days || days.length === 0) return 'Closed';
  if (days.length === 7) return 'Every Day (Mon - Sun)';
  if (days.length === 5 && [1, 2, 3, 4, 5].every((d) => days.includes(d))) return 'Mon - Fri';
  if (days.length === 6 && [1, 2, 3, 4, 5, 6].every((d) => days.includes(d))) return 'Mon - Sat';
  
  return days
    .sort((a, b) => a - b)
    .map((d) => DAY_NAMES[d])
    .join(', ');
}

export function getAgentAvailability(settings?: AdminSettings): AgentAvailabilityResult {
  const mode = settings?.agentAvailabilityMode || 'auto';
  const startStr = settings?.businessHoursStart || '08:00';
  const endStr = settings?.businessHoursEnd || '19:00';
  const businessDays = settings?.businessDays ?? [1, 2, 3, 4, 5, 6];
  const timeZone = settings?.businessTimeZone && settings.businessTimeZone !== 'local' 
    ? settings.businessTimeZone 
    : undefined;

  // Calculate current date/time in the specified timezone
  const now = new Date();
  let currentDay = now.getDay();
  let currentHour = now.getHours();
  let currentMinute = now.getMinutes();

  if (timeZone) {
    try {
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone,
        hour: 'numeric',
        minute: 'numeric',
        hour12: false,
        weekday: 'short',
      });
      const parts = formatter.formatToParts(now);
      const hourPart = parts.find((p) => p.type === 'hour')?.value;
      const minPart = parts.find((p) => p.type === 'minute')?.value;
      const weekdayPart = parts.find((p) => p.type === 'weekday')?.value;

      if (hourPart) currentHour = parseInt(hourPart, 10);
      if (minPart) currentMinute = parseInt(minPart, 10);
      if (weekdayPart) {
        const foundDay = DAY_NAMES.findIndex((d) => d.toLowerCase() === weekdayPart.slice(0, 3).toLowerCase());
        if (foundDay !== -1) currentDay = foundDay;
      }
    } catch {
      // Fallback to local time
    }
  }

  // Current formatted time string
  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    ...(timeZone ? { timeZone } : {}),
  };
  const currentTimeFormatted = new Intl.DateTimeFormat('en-US', timeOptions).format(now);

  const startParts = startStr.split(':').map((n) => parseInt(n, 10));
  const endParts = endStr.split(':').map((n) => parseInt(n, 10));
  const startMinutes = (startParts[0] || 8) * 60 + (startParts[1] || 0);
  const endMinutes = (endParts[0] || 19) * 60 + (endParts[1] || 0);
  const currentMinutes = currentHour * 60 + currentMinute;

  const hoursSummary = `${formatDaysSummary(businessDays)}: ${formatTime12h(startStr)} - ${formatTime12h(endStr)}`;

  let status: AgentAvailabilityStatus = 'Online';
  let reason = 'Business hours active';

  // Manual Overrides
  if (mode === 'online') {
    status = 'Online';
    reason = 'Manually forced Online in platform settings';
  } else if (mode === 'away') {
    status = 'Away';
    reason = 'Manually set to Away in platform settings';
  } else if (mode === 'offline') {
    status = 'Offline';
    reason = 'Manually set to Offline in platform settings';
  } else {
    // Dynamic Auto Calculation
    const isWorkingDay = businessDays.includes(currentDay);

    if (!isWorkingDay) {
      status = 'Offline';
      reason = `Closed on ${FULL_DAY_NAMES[currentDay]}`;
    } else if (currentMinutes < startMinutes) {
      // Before start
      if (startMinutes - currentMinutes <= 30) {
        status = 'Away';
        reason = `Opening soon at ${formatTime12h(startStr)}`;
      } else {
        status = 'Offline';
        reason = `Opens at ${formatTime12h(startStr)}`;
      }
    } else if (currentMinutes >= endMinutes) {
      // After end
      if (currentMinutes - endMinutes <= 30) {
        status = 'Away';
        reason = 'Wrapping up shift inquiries';
      } else {
        status = 'Offline';
        reason = `Closed for the day at ${formatTime12h(endStr)}`;
      }
    } else {
      // During operating hours
      status = 'Online';
      reason = 'Within active business hours';
    }
  }

  // Visual tokens per status
  if (status === 'Online') {
    return {
      status: 'Online',
      label: 'Online',
      badgeBg: 'bg-emerald-500/15',
      badgeText: 'text-emerald-400',
      badgeBorder: 'border-emerald-500/30',
      dotColor: 'bg-emerald-400',
      dotPulse: true,
      statusMessage: settings?.onlineStatusMessage || 'Active Live Advisory • Instant WhatsApp Reply',
      hoursSummary,
      currentTimeFormatted,
      isOnline: true,
      isAway: false,
      isOffline: false,
      reason,
    };
  }

  if (status === 'Away') {
    return {
      status: 'Away',
      label: 'Away',
      badgeBg: 'bg-amber-500/15',
      badgeText: 'text-amber-400',
      badgeBorder: 'border-amber-500/30',
      dotColor: 'bg-amber-400',
      dotPulse: false,
      statusMessage: settings?.awayStatusMessage || 'Team on Break / Shift Transition • Replies in ~15m',
      hoursSummary,
      currentTimeFormatted,
      isOnline: false,
      isAway: true,
      isOffline: false,
      reason,
    };
  }

  // Offline
  return {
    status: 'Offline',
    label: 'Offline',
    badgeBg: 'bg-slate-500/20',
    badgeText: 'text-slate-400',
    badgeBorder: 'border-slate-500/30',
    dotColor: 'bg-slate-400',
    dotPulse: false,
    statusMessage: settings?.offlineStatusMessage || `Outside Operating Hours • Next reply at ${formatTime12h(startStr)}`,
    hoursSummary,
    currentTimeFormatted,
    isOnline: false,
    isAway: false,
    isOffline: true,
    reason,
  };
}

export function useAgentAvailability(settings?: AdminSettings): AgentAvailabilityResult {
  const [availability, setAvailability] = useState<AgentAvailabilityResult>(() => getAgentAvailability(settings));

  useEffect(() => {
    // Initial evaluation
    setAvailability(getAgentAvailability(settings));

    // Update every 30 seconds to react to clock changes
    const timer = setInterval(() => {
      setAvailability(getAgentAvailability(settings));
    }, 30000);

    return () => clearInterval(timer);
  }, [
    settings?.agentAvailabilityMode,
    settings?.businessHoursStart,
    settings?.businessHoursEnd,
    settings?.businessTimeZone,
    settings?.onlineStatusMessage,
    settings?.awayStatusMessage,
    settings?.offlineStatusMessage,
    JSON.stringify(settings?.businessDays),
  ]);

  return availability;
}

