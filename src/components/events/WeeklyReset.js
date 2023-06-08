import { add, format } from "date-fns";

import "./WeeklyReset.css";

import { getMinutesToNextEvent } from "../../date-tools/event-time-offset";
import { getFormattedSkyTime } from "../../date-tools/regional-time";
import { weeklyReset } from "../../event-data/event-data";

function calculateTimeRemaining(daysUntilReset, minutesToMidnight) {
    // Convert days and minutes to total minutes
    const totalMinutes = daysUntilReset * 24 * 60 + minutesToMidnight;

    // Calculate the time components
    const days = Math.floor(totalMinutes / (24 * 60));
    const hours = Math.floor((totalMinutes % (24 * 60)) / 60);
    const minutes = totalMinutes % 60;

    return { days, hours, minutes };
}

export default function render({ currentDate }) {
    const currentDay = parseInt(getFormattedSkyTime(currentDate, 'i'));

    const eventData = weeklyReset;
    const minutesToMidnight = getMinutesToNextEvent(currentDate, eventData);
    const daysUntilReset = minutesToMidnight === 0 ? 7 - currentDay : 6 - currentDay;

    const nextEventDate = add(currentDate, { days: daysUntilReset, minutes: minutesToMidnight });
    const { days, hours, minutes } = calculateTimeRemaining(daysUntilReset, minutesToMidnight);
    return (
        <div id="weekly-reset">
            {`Next weekly reset on ${format(nextEventDate, 'EEEE')} at ${format(nextEventDate, 'HH:mm')}`}
            <div>{`Time to Next: ${days}d ${hours}h ${minutes}m`}</div>
        </div>
    );
}