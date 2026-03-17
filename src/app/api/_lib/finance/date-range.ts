export function getDateRange(searchParams: URLSearchParams) {
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  const parsedStart = startDate ? new Date(startDate) : null;
  const parsedEnd = endDate ? new Date(endDate) : null;
  const start = parsedStart && !Number.isNaN(parsedStart.getTime()) ? parsedStart : null;
  const end = parsedEnd && !Number.isNaN(parsedEnd.getTime()) ? parsedEnd : null;

  if (end) {
    end.setHours(23, 59, 59, 999);
  }

  return { start, end };
}

export function getMonthBoundaries(year?: number, month?: number) {
  const now = new Date();
  const y = year ?? now.getFullYear();
  const m = (month ?? now.getMonth() + 1) - 1;

  const start = new Date(y, m, 1, 0, 0, 0, 0);
  const end = new Date(y, m + 1, 0, 23, 59, 59, 999);

  return { start, end };
}
