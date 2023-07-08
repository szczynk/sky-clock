import { useMemo, useEffect } from 'react';
import "./Shard.css"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell } from '@fortawesome/free-solid-svg-icons';
import { getNowInSkyTime } from "../../date-tools/regional-time";
import useLocalStorage from "../../hooks/localstorage";
import { notify } from '../../services/notification-service';
const dateFns = require('date-fns');

const duration = { hours: 3, minutes: 51, seconds: 20 };
const earlySkyOffset = { minutes: 40, seconds: 50 };
const gateShardOffset = { minutes: 8, seconds: 40 };

function getShardData(getNowInSky, daysToAdd = 0) {
    const now = getNowInSky;
    const today = dateFns.startOfDay(dateFns.addDays((now), daysToAdd));
    const dayOfMth = today.getDate();
    const dayOfWk = today.getDay();
    const isRed = dayOfMth % 2 === 1;
    const minsIndex = isRed ? ((dayOfMth - 1) / 2) % 3 : ((dayOfMth / 2) % 2) + 3;
    const haveShard = ![[1, 2], [2, 3], [3, 4], [6, 0], [0, 1]][minsIndex].includes(dayOfWk);

    if (!haveShard) {
        return { noShard: true, ...getShardData(daysToAdd + 1) };
    }

    const minsFromResets = [468, 148, 218, 118, 138][minsIndex];
    const hourRepeat = isRed ? 6 : 8;

    const nextByParts = Array.from({ length: 3 }, (_, nth) => {
        const shardStart = dateFns.add(today, { hours: nth * hourRepeat, minutes: minsFromResets, seconds: 40 });
        const shardEnd = dateFns.add(shardStart, duration);
        const shardEarlySky = dateFns.sub(shardStart, earlySkyOffset);
        const shardAtGate = dateFns.sub(shardStart, gateShardOffset);
        return { shardEarlySky, shardAtGate, shardStart, shardEnd };
    }).reduceRight((acc, { shardStart, shardEnd, shardEarlySky, shardAtGate }, idx) => idx >= 3 ? acc : {
        shardStart: (dateFns.isAfter(now, shardStart) ? acc.shardStart : shardStart),
        shardEnd: (dateFns.isAfter(now, shardEnd) ? acc.shardEnd : shardEnd),
        shardEarlySky: (dateFns.isAfter(now, shardEarlySky) ? acc.shardEarlySky : shardEarlySky),
        shardAtGate: (dateFns.isAfter(now, shardAtGate) ? acc.shardAtGate : shardAtGate),
    }, { shardStart: null, shardEnd: null, shardEarlySky: null, shardAtGate: null });

    const sortedDates = Object.entries(nextByParts).filter(([, d]) => d).sort(([, a], [, b]) => dateFns.compareAsc(a, b));

    if (sortedDates.length === 0) {
        return { noMore: true, ...getShardData(daysToAdd + 1) };
    }

    const realmIdx = (dayOfMth - 1) % 5;
    const realm = ['Daylight Prairie', 'Hidden Forest', 'Valley Of Triumph', 'Golden Wasteland', 'Vault Of Knowledge'][realmIdx];
    const map = [
        ["Cave", "Bird Nest", "Sanctuary Island", "Butterfly Field", "Village Islands / Koi Pond"],
        ["Forest End / Garden", "Treehouse", "Elevated Clearing", "Forest Brook", "Boneyard"],
        ["Village of Dreams", "Village of Dreams", "Hermit valley", "Ice Rink", "Ice Rink"],
        ["Graveyard", "Crabfield", "Forgotten Ark", "Broken Temple", "Battlefield"],
        ["Jellyfish Cove", "Jellyfish Cove", "Jellyfish Cove", "Starlight Desert", "Starlight Desert"],
    ][realmIdx][minsIndex];

    const rewards = !isRed ? `200 wax` :
        (({
        'Forest End / Garden': '2.5',
        'Treehouse': '3.5',
        'Village of Dreams': '2.5',
        'Jellyfish Cove': '3.5',
        })[map] ?? ['2.0', '2.5', '3.0'][minsIndex]) + ' Ascended Candles';

    return { isRed, realm, map, rewards, sortedDates, daysAdded: daysToAdd };
}

function buildNotification(eventName, minutesToNextEvent) {
    const notification = {
        title: 'Sky Clock',
        body: `Event ${eventName} is about to begin!`,
    };

    notification.body = notification.body?.replace('{t}', minutesToNextEvent);

    return notification;
}

function ShardRows({ getNowInSky, partsKey, date }) {
    const skyNow = getNowInSky;
    const duration = dateFns.intervalToDuration({ start: skyNow, end: date });
    const localDate = dateFns.add(new Date(), { ...duration, seconds: duration.seconds + 1 });
    const { days, hours, minutes, seconds } = duration;

    const localStr = dateFns.format(localDate, days ? `do, H:mm` : `HH:mm:ss`);
    const relStr = [days && `${days}d`, hours && `${hours}h`, minutes && `${minutes}m`, !days && `${seconds}s`].filter(Boolean).join(' ');

    const name = ({
        shardStart: "Shard Lands",
        shardEnd: "Shard Ends",
        shardEarlySky: "Early Shard Sky",
        shardAtGate: "Gate Shard",
    })[partsKey]

    const notificationKey = `${partsKey}-lastNotification`;
    const subscriptionKey = `${partsKey}-isSubscribed`;

    const [lastNotification, setLastNotification] = useLocalStorage(notificationKey, new Date().getTime());
    const [isSubscribed, setSubscription] = useLocalStorage(subscriptionKey, false);

    useEffect(() => {
        function showNotification() {
            const minutesToNextEvent = hours * 60 + minutes;
            const notificationWindow = 5;

            const shouldNotify = isSubscribed
                && minutesToNextEvent <= notificationWindow
                && lastNotification < skyNow.getTime()
                && lastNotification < (date.getTime() - (notificationWindow + 1) * 60000);

            if (shouldNotify) {
                const notification = buildNotification(name, minutesToNextEvent);
                notify(notification);

                setLastNotification(skyNow.getTime());
            }
        }

        showNotification();
    }, [date, isSubscribed, lastNotification, name, setLastNotification, setSubscription, skyNow, hours, minutes]);

    const toggleNotificationSubscription = () => {
        if (typeof Notification === "function" && Notification.permission !== "granted") {
            Notification.requestPermission().then((permission) => {
                if (permission === "granted") {
                setSubscription(!isSubscribed);
                }
            });
        } else {
            setSubscription(!isSubscribed);
        }
        setLastNotification(skyNow.getTime());
    };

    return (
        <tr className="event">
            <td className="notification">
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <FontAwesomeIcon className="bell" data-active={isSubscribed} icon={faBell} onClick={toggleNotificationSubscription} />
                </div>
            </td>
            <td>{name}</td>
            <td>{localStr}</td>
            <td>{relStr}</td>
        </tr>
    );
}

export default function Shard({ currentDate }) {
    const getNowInSky = useMemo(() => getNowInSkyTime(currentDate), [currentDate]);

    const { noShard, noMore, isRed, realm, map, rewards, sortedDates, daysAdded } = useMemo(() => getShardData(getNowInSky), [getNowInSky]);

    const skippedDays = useMemo(() => new Array(daysAdded).fill(0).map((_, days) => dateFns.format(dateFns.addDays(getNowInSky, days), "do")), [daysAdded, getNowInSky]);

    return (
        <>
            <tr className='heading'><td colSpan='4'>Shard Eruptions</td></tr>
            {
                noMore && <tr className='shard-status'>
                <td colSpan='4'>All shard eruptions on the {skippedDays.shift()} has ended</td>
                </tr>
            }
            {
                noShard && <tr className='shard-status'>
                <td colSpan='4'>No Shard on the {skippedDays.join(', ')}. (╯°□°)╯︵ ┻━┻ </td>
                </tr>
            }
            {
                daysAdded > 0 && <tr className='heading'>
                <td colSpan='4'> Shard eruptions for {dateFns.format(dateFns.addDays(getNowInSky, daysAdded), "do 'of' MMM")} </td>
                </tr>
            }
            <tr className='shard-detail'>
                <td colSpan='2'><strong>Realm: </strong>{realm}</td>
                <td colSpan='2'><strong>Color: </strong>{isRed ? 'Red' : 'Black'}</td>
            </tr>
            <tr className='shard-detail'>
                <td colSpan='2'><strong>Map: </strong>{map}</td>
                <td colSpan='2'><strong>Rewards: </strong>{rewards}</td>
            </tr>
            {sortedDates.map(([partsKey, date]) => <ShardRows getNowInSky={getNowInSky} key={partsKey} partsKey={partsKey} date={date} daysAdded={daysAdded} />)}
        </>
    );
}
