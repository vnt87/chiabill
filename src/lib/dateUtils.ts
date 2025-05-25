import { format, parseISO, isValid } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useLanguage } from '../contexts/LanguageContext';

export function formatDate(dateStr: string, formatStr?: string): string {
  const { t, language } = useLanguage();
  
  try {
    const date = parseISO(dateStr);
    if (!isValid(date)) {
      return t.noDate;
    }

    // If no format string is provided, use default short date format
    const dateFormat = formatStr || t.dateFormats.shortDate;
    return format(date, dateFormat, {
      locale: language === 'vi' ? vi : undefined
    });
  } catch (error) {
    console.error(`Error formatting date: ${dateStr}`, error);
    return t.noDate;
  }
}

export function formatDuration(minutes: number): string {
  const { t } = useLanguage();
  
  if (minutes < 0) return t.noTimeData;
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (hours === 0) {
    return t.dateFormats.duration.minutesOnly.replace('{minutes}', remainingMinutes.toString());
  } else if (remainingMinutes === 0) {
    return t.dateFormats.duration.hoursOnly.replace('{hours}', hours.toString());
  } else {
    return t.dateFormats.duration.hoursMinutes
      .replace('{hours}', hours.toString())
      .replace('{minutes}', remainingMinutes.toString());
  }
}

export function formatTime(timeStr: string): string {
  const { t } = useLanguage();
  
  try {
    const today = new Date();
    const [hours, minutes] = timeStr.split(':').map(Number);
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate(), hours, minutes);
    
    if (!isValid(date)) {
      return t.noTimeData;
    }
    
    return format(date, t.dateFormats.time);
  } catch (error) {
    console.error(`Error formatting time: ${timeStr}`, error);
    return t.noTimeData;
  }
}
