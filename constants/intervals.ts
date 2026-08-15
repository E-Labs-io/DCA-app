/** @format */

// MUST match the V0.9 contract enum exactly (IDCADataStructures.Interval)
// and library/Intervals.sol lengths (ONEMONTH = 4 weeks). The previous
// V0.8 enum here had no ThreeDays, shifting keys 4-6 — selecting
// "Monthly" would have created an on-chain TwoWeeks strategy.
export enum Interval {
  TestIntervalOneMin = 0,
  TestIntervalFiveMins = 1,
  OneDay = 2,
  TwoDays = 3,
  ThreeDays = 4,
  OneWeek = 5,
  TwoWeeks = 6,
  OneMonth = 7,
}

export interface IntervalSeconds {
  0: 60;
  1: 300;
  2: 86400;
  3: 172800;
  4: 259200;
  5: 604800;
  6: 1209600;
  7: 2419200;
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
    value: Interval.ThreeDays,
    label: "Every 3 Days",
    description: "Execute once every three days",
    seconds: 259200,
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
    description: "Execute once every four weeks",
    seconds: 2419200,
  },
];

export { intervalOptions };
