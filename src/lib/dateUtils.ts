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

export function formatTime(timeStr: string): string {
  try {
    // For time strings like "13:45", we need to create a full date
    const today = new Date();
    const [hours, minutes] = timeStr.split(':').map(Number);
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate(), hours, minutes);
    
    if (!isValid(date)) {
      return 'Invalid time';
    }
    
    return format(date, 'h:mm a');
  } catch (error) {
    console.error(`Error formatting time: ${timeStr}`, error);
    return 'Invalid time';
  }
}
