export const getNextRecurringDate = (day: number): string => {
  const now = new Date();
  let year = now.getFullYear();
  let month = now.getMonth() + 1; // Start with current month in 1-based

  // If recurring day is 99, it means the last day of the month
  const isLastDay = day === 99;

  // Let's determine the target date for 'this' month first to see if it has passed
  const currentMonthLastDay = new Date(year, month, 0).getDate();
  const targetDayThisMonth = isLastDay
    ? currentMonthLastDay
    : Math.min(day, currentMonthLastDay);

  const targetDateThisMonth = new Date(year, month - 1, targetDayThisMonth);
  targetDateThisMonth.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // If the target date for this month is today or in the past, move to next month
  if (today.getTime() >= targetDateThisMonth.getTime()) {
    month += 1;
    if (month > 12) {
      month = 1;
      year += 1;
    }
  }

  const targetMonthLastDay = new Date(year, month, 0).getDate();
  const finalDay = isLastDay
    ? targetMonthLastDay
    : Math.min(day, targetMonthLastDay);

  const mm = String(month).padStart(2, "0");
  const dd = String(finalDay).padStart(2, "0");
  return `${year}-${mm}-${dd}`;
};

/**
 * 특정 연도와 월에 해당하는 반복 날짜를 계산합니다.
 */
export const getRecurringDateForMonth = (
  year: number,
  month: number, // 1-indexed (1-12)
  day: number,
): string => {
  const isLastDay = day === 99;
  const lastDayOfMonth = new Date(year, month, 0).getDate();
  const finalDay = isLastDay ? lastDayOfMonth : Math.min(day, lastDayOfMonth);

  const mm = String(month).padStart(2, "0");
  const dd = String(finalDay).padStart(2, "0");
  return `${year}-${mm}-${dd}`;
};

export const formatDate = (date: Date): string => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};
