// Product Growth Calculation Logic for Admin Dashboard
// This file contains the logic to calculate product percentage growth

export const calculateProductGrowth = (currentCount: number, previousCount: number) => {
  let percentageChange = 0;
  let trend: 'up' | 'down' = 'up';

  if (previousCount > 0) {
    percentageChange = ((currentCount - previousCount) / previousCount) * 100;
    trend = percentageChange >= 0 ? 'up' : 'down';
  } else if (currentCount > 0) {
    percentageChange = 100;
    trend = 'up';
  }

  const changeText = `${percentageChange >= 0 ? '+' : ''}${percentageChange.toFixed(1)}%`;

  return {
    change: changeText,
    trend,
    percentageChange,
  };
};

export const getDateRangeForStats = (timeRange: string) => {
  const now = new Date();
  const ranges: Record<string, number> = {
    '24h': 1,
    '7d': 7,
    '30d': 30,
    '90d': 90,
  };

  const days = ranges[timeRange] || 7;
  const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  const previousStartDate = new Date(startDate.getTime() - days * 24 * 60 * 60 * 1000);

  return {
    currentStart: startDate.toISOString(),
    previousStart: previousStartDate.toISOString(),
    previousEnd: startDate.toISOString(),
  };
};
