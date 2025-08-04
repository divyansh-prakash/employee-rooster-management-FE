import { HOLIDAYS } from '../constants/holidayList';

// Utility to get the weekday from MM/DD/YYYY
export function getDayOfWeekMMDD(dateString) {
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return daysOfWeek[date.getDay()];
}

// Checks if date is a weekend (Saturday or Sunday)
export function isWeekend(dateString) {
  const day = getDayOfWeekMMDD(dateString);
  return day === 'Saturday' || day === 'Sunday';
}

// Checks if date is in the holiday list
export function isHoliday(dateString) {
  return HOLIDAYS.includes(dateString);
}
