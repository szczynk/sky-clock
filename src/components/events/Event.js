import Time from "../time/Time";
import { notify } from '../../services/notification-service';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell } from '@fortawesome/free-solid-svg-icons';

import "./Event.css";
import useLocalstorage from "../../hooks/localstorage";
import { eventTypes } from "../../event-data/event-data";


function buildNotification(eventData, minutesToNextEvent) {
    const notification = {
        title: eventData.notification?.title ?? 'Sky Clock',
        body: eventData.notification?.body ?? `Event ${eventData.name} is about to begin!`,
        image: eventData.notification?.image
    };

    notification.body = notification.body?.replace('{t}', minutesToNextEvent);

    return notification;
}

export default function Event({ eventData, eventDataDailyReset }) {
    const notificationKey = `${eventData.key}-lastNotification`;
    const subscriptionKey = `${eventData.key}-isSubscribed`;

    const [lastNotification, setLastNotification] = useLocalstorage(notificationKey, new Date().getTime());
    const [isSubscribed, setSubscription] = useLocalstorage(subscriptionKey, false);

    const { date, hour, minute, hoursOffset, minutesOffset } = eventData.offsetData;

    const hoursOffsetDailyReset = eventDataDailyReset.offsetData.hoursOffset;
    const minutesOffsetDailyReset = eventDataDailyReset.offsetData.minutesOffset;
    
    (function showNotification() {

        const minutesToNextEvent = hoursOffset * 60 + minutesOffset;
        const notificationWindow = eventData.notification?.minutes ?? 5;

        const shouldNotify = isSubscribed
            && minutesToNextEvent <= notificationWindow
            && lastNotification < eventData.currentDate.getTime()
            && lastNotification < (date.getTime() - (notificationWindow + 1) * 60000);

        if (shouldNotify) {
            const notification = buildNotification(eventData, minutesToNextEvent);
            notify(notification);

            setLastNotification(eventData.currentDate.getTime());
        }
    })();

    const toggleNotificationSubscription = () => {
        if (typeof(Notification) === 'function' && Notification.permission !== 'granted') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    setSubscription(!isSubscribed);
                }
            });
        } else {
            setSubscription(!isSubscribed);
        }
        setLastNotification(eventData.currentDate.getTime());
    }

    const todoKey1 = `${eventData.key}-isDone1`;
    const [isDone1, setTodo1] = useLocalstorage(todoKey1, false);
    const toggleTodo1 = () => {
        setTodo1(!isDone1);
    };

    const todoKey2 = `${eventData.key}-isDone2`;
    const [isDone2, setTodo2] = useLocalstorage(todoKey2, false);
    const toggleTodo2 = () => {
        setTodo2(!isDone2);
    };

    (function resetTodo() {
        const minutesToNextDailyReset = hoursOffsetDailyReset * 60 + minutesOffsetDailyReset;
        const notificationWindow = eventData.notification?.minutes ?? 5;


        const shouldResetTodos = (isDone1 || isDone2) &&
            minutesToNextDailyReset <= notificationWindow
    
        // console.log({
        //     eventName: eventData.name,
        //     isDone1,
        //     isDone2,
        //     minutesToNextDailyReset,
        //     notificationWindow,
        //     shouldResetTodos,
        // });

        if (shouldResetTodos) {
            setTodo1(false);
            setTodo2(false);
        }
    })();

    return (
        <tr className="event">
            <td className="notification">
                <div style={{ display: 'flex', alignItems: 'center' }}>
                <FontAwesomeIcon className="bell" data-active={isSubscribed} icon={faBell} onClick={toggleNotificationSubscription} />
                {
                    eventData.type === eventTypes.WAX && <div style={{ marginLeft: 8 }}>
                        <input type="checkbox" style={{ marginRight: 8, transform: 'scale(1.75)' }} checked={isDone1} onChange={toggleTodo1} />
                        <input type="checkbox" style={{ marginLeft: 8, transform: 'scale(1.75)' }} checked={isDone2} onChange={toggleTodo2} />
                    </div>
                }
                </div>
            </td>
            <td>{eventData.name}</td>
            <td><Time hour={hour} minute={minute}></Time></td>
            <td>{`${hoursOffset}h ${minutesOffset}m`}</td>
        </tr>
    );
}
