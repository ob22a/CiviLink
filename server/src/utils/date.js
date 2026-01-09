import { startOfMonth, endOfMonth, format } from 'date-fns';

export function getCurrentMonth() {
  return format(new Date(), 'yyyy-MM');
}

export function getMonthRange(month) { // Month has format 'YYYY-MM'
  const start = startOfMonth(new Date(`${month}-01`));
  const end = endOfMonth(start);
  return { start, end };
}

export const formatDate = (date) => {
  return date.toISOString().split("T")[0]; // YYYY-MM-DD
};

export const isWorkingDay = (date) => {
  const day = date.getDay(); // 0 = Sunday
  return day !== 0;
};

export const getNextWorkingDay = (fromDate = new Date()) => {
  const date = new Date(fromDate);
  date.setDate(date.getDate() + 1);

  while (!isWorkingDay(date)) {
    date.setDate(date.getDate() + 1);
  }

  return date;
};
