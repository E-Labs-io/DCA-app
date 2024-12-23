/** @format */

import { Interval, intervalOptions } from "@/constants/intervals";

export function getIntervalSeconds(interval: Interval): Number {
  return intervalOptions.find((option) => option.value === interval)?.seconds!;
}
