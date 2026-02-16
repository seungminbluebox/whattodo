export const getNextRecurringDate = (day: number): string => {
  const now = new Date();
  let year = now.getFullYear();
  let month = now.getMonth() + 1; // 1-indexed for next month

  // 만약 현재 달의 설정일이 지났거나 오늘이라면 다음 달로 설정
  if (now.getDate() >= day) {
    month += 1;
    if (month > 12) {
      month = 1;
      year += 1;
    }
  }

  // 해당 달의 마지막 날짜 확인
  const lastDayOfMonth = new Date(year, month, 0).getDate();
  const actualDay = Math.min(day, lastDayOfMonth);

  const nextDate = new Date(year, month - 1, actualDay);
  return nextDate.toISOString().split("T")[0];
};

export const formatDate = (date: Date): string => {
  return date.toISOString().split("T")[0];
};
