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

export interface IntervalSeconds {
  0: 60;
  1: 300;
  2: 86400;
  3: 172800;
  4: 604800;
  5: 1209600;
  6: 2629746;
}

export interface IntervalOption {
  value: Interval;
  label: string;
  description: string;
  seconds: number;
}

const intervalOptions: IntervalOption[] = [
  {
    value: Interval.TestIntervalOneMin,
    label: "[DEV] Every Minute",
    description: "Test interval - Execute every minute",
    seconds: 60,
  },
  {
    value: Interval.TestIntervalFiveMins,
    label: "[DEV] Every 5 Minutes",
    description: "Test interval - Execute every five minutes",
    seconds: 300,
  },
  {
    value: Interval.OneDay,
    label: "Daily",
    description: "Execute once every day",
    seconds: 86400,
  },
  {
    value: Interval.TwoDays,
    label: "Every 2 Days",
    description: "Execute once every two days",
    seconds: 172800,
  },
  {
    value: Interval.OneWeek,
    label: "Weekly",
    description: "Execute once every week",
    seconds: 604800,
  },
  {
    value: Interval.TwoWeeks,
    label: "Bi-weekly",
    description: "Execute once every two weeks",
    seconds: 1209600,
  },
  {
    value: Interval.OneMonth,
    label: "Monthly",
    description: "Execute once every month",
    seconds: 2629746,
  },
];

export { intervalOptions };
