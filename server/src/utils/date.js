import { startOfMonth, endOfMonth, format } from 'date-fns';

export function getCurrentMonth() {
  return format(new Date(), 'yyyy-MM');
}

export function getMonthRange(month) { // Month has format 'YYYY-MM'
  const start = startOfMonth(new Date(`${month}-01`));
  const end = endOfMonth(start);
  return { start, end };
}
