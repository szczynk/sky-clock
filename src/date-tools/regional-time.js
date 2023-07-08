import { format } from 'date-fns';
import { formatInTimeZone, utcToZonedTime } from 'date-fns-tz';

const US_PACIFIC_TIME_ZONE = 'America/Los_Angeles';
const TIME_PATTERN = 'HH:mm:ss';

function getTimeTokens(formattedTime) {
    const [hour, minute, second] = formattedTime.split(':');

    return {
        hour: parseInt(hour),
        minute: parseInt(minute),
        second: parseInt(second)
    };
}

export function getLocalTime(date) {
    const formattedTime = format(date, TIME_PATTERN);

    return getTimeTokens(formattedTime);
}

export function getFormattedSkyTime(date, formatString) {
    return formatInTimeZone(date, US_PACIFIC_TIME_ZONE, formatString);
}

export function getSkyTime(date) {
    const formattedTime = formatInTimeZone(date, US_PACIFIC_TIME_ZONE, TIME_PATTERN);

    return getTimeTokens(formattedTime);
}

export function getNowInSkyTime() {
    return utcToZonedTime(new Date(), US_PACIFIC_TIME_ZONE);
}
