/** @format */


export enum Interval {
  TestIntervalOneMin = 0,
  TestIntervalFiveMins = 1,
  OneDay = 2,
  TwoDays = 3,
  OneWeek = 4,
  TwoWeeks = 5,
  OneMonth = 6,
}

export interface IntervalOption {
  value: Interval;
  label: string;
  description: string;
}

const intervalOptions: IntervalOption[] = [
  {
    value: Interval.TestIntervalOneMin,
    label: "[DEV] Every Minute",
    description: "Test interval - Execute every minute",
  },
  {
    value: Interval.TestIntervalFiveMins,
    label: "[DEV] Every 5 Minutes",
    description: "Test interval - Execute every five minutes",
  },
  {
    value: Interval.OneDay,
    label: "Daily",
    description: "Execute once every day",
  },
  {
    value: Interval.TwoDays,
    label: "Every 2 Days",
    description: "Execute once every two days",
  },
  {
    value: Interval.OneWeek,
    label: "Weekly",
    description: "Execute once every week",
  },
  {
    value: Interval.TwoWeeks,
    label: "Bi-weekly",
    description: "Execute once every two weeks",
  },
  {
    value: Interval.OneMonth,
    label: "Monthly",
    description: "Execute once every month",
  },
];

export { intervalOptions };
