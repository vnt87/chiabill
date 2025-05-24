import { format, parseISO, isValid } from 'date-fns';

export function formatDate(dateStr: string, formatStr: string): string {
  try {
    // First try parsing as ISO date string
    const date = parseISO(dateStr);
    if (!isValid(date)) {
      return 'Invalid date';
    }
    return format(date, formatStr);
  } catch (error) {
    console.error(`Error formatting date: ${dateStr}`, error);
    return 'Invalid date';
  }
}

export function formatDuration(minutes: number): string {
  if (minutes < 0) return 'Invalid duration';
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (hours === 0) {
    return `${remainingMinutes}m`;
  } else if (remainingMinutes === 0) {
    return `${hours}h`;
  } else {
    return `${hours}h ${remainingMinutes}m`;
  }
}

export function formatTime(timeStr: string): string {
  try {
    // For time strings like "13:45", we need to create a full date
    const today = new Date();
    const [hours, minutes] = timeStr.split(':').map(Number);
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate(), hours, minutes);
    
    if (!isValid(date)) {
      return 'Invalid time';
    }
    
    return format(date, 'HH:mm');
  } catch (error) {
    console.error(`Error formatting time: ${timeStr}`, error);
    return 'Invalid time';
  }
}
