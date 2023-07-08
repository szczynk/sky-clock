import { add, format, differenceInSeconds } from "date-fns";
import React from "react";

import "./WeeklyReset.css";
import { getMinutesToNextEvent } from "../../date-tools/event-time-offset";
import { getFormattedSkyTime } from "../../date-tools/regional-time";
import { weeklyReset } from "../../event-data/event-data";

export default function render({ currentDate }) {
  const currentDayISO = parseInt(getFormattedSkyTime(currentDate, "i"));
  const currentDay = (currentDayISO % 7) + 1; // Map from ISO to JavaScript

  const eventData = weeklyReset;
  const minutesToMidnight = getMinutesToNextEvent(currentDate, eventData);
  const daysUntilReset =
    currentDay === 0 && minutesToMidnight < 24 * 60 ? 7 : (7 - currentDay) % 7; // Use modulo to ensure the result is within 0-6

  const nextEventDate = add(currentDate, { days: daysUntilReset, minutes: minutesToMidnight });

  // Calculate the difference in seconds
  const diffInSeconds = differenceInSeconds(nextEventDate, currentDate);

  // Calculate the remaining days, hours, and minutes
  const remainingDays = Math.floor(diffInSeconds / (24 * 60 * 60));
  const remainingHours = Math.floor((diffInSeconds % (24 * 60 * 60)) / (60 * 60));
  const remainingMinutes = Math.floor((diffInSeconds % (60 * 60)) / 60);

  return (
    <div id="weekly-reset">
      {`Next weekly reset on ${format(nextEventDate, "EEEE")} at ${format(nextEventDate, "HH:mm")}`}
      <br />
      {`Time remaining: ${remainingDays}d ${remainingHours}h ${remainingMinutes}m`}
    </div>
  );
}
