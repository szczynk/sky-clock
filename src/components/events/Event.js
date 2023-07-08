import React, { useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell } from "@fortawesome/free-solid-svg-icons";

import Time from "../time/Time";
import { notify } from "../../services/notification-service";
import useLocalStorage from "../../hooks/localstorage";
import { eventTypes } from "../../event-data/event-data";

import "./Event.css";

function buildNotification(eventNotification, eventName, minutesToNextEvent) {
    const title = eventNotification?.title ?? "Sky Clock";
    const body = eventNotification?.body ?? `Event ${eventName} is about to begin!`;
    const image = eventNotification?.image;

    const modifiedBody = body.replace("{t}", minutesToNextEvent);

    return {
        title,
        body: modifiedBody,
        image,
    };
}

export default function Event({ eventData: {
        key,
        offsetData,
        currentDate,
        name,
        type,
        notification
    },
    eventDataDailyReset
}) {
    const { date, hour, minute, hoursOffset, minutesOffset } = offsetData;

    const notificationKey = `${key}-lastNotification`;
    const subscriptionKey = `${key}-isSubscribed`;

    const [lastNotification, setLastNotification] = useLocalStorage(
        notificationKey,
        new Date().getTime()
    );
    const [isSubscribed, setSubscription] = useLocalStorage(subscriptionKey, false);

    const {
        currentDate: currentDateDailyReset,
        offsetData: {
            date: dateDailyReset,
            hoursOffset: hoursOffsetDailyReset,
            minutesOffset: minutesOffsetDailyReset
        }
    } = eventDataDailyReset;

    useEffect(() => {
        function showNotification() {
            const minutesToNextEvent = hoursOffset * 60 + minutesOffset;
            const notificationWindow = notification?.minutes ?? 5;

            const shouldNotify =
                isSubscribed &&
                minutesToNextEvent <= notificationWindow &&
                lastNotification < currentDate.getTime() &&
                lastNotification < date.getTime() - (notificationWindow + 1) * 60000;

            if (shouldNotify) {
                const notif = buildNotification(notification, name, minutesToNextEvent);
                notify(notif);

                setLastNotification(currentDate.getTime());
            }
        }

        showNotification();
    }, [currentDate, date, isSubscribed, hoursOffset, minutesOffset, notification, name, lastNotification, setLastNotification]);

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
        setLastNotification(currentDate.getTime());
    };

    const todoKey1 = `${key}-isDone1`;
    const [isDone1, setTodo1] = useLocalStorage(todoKey1, false);
    const toggleTodo1 = () => {
        setTodo1(!isDone1);
    };

    const todoKey2 = `${key}-isDone2`;
    const [isDone2, setTodo2] = useLocalStorage(todoKey2, false);
    const toggleTodo2 = () => {
        setTodo2(!isDone2);
    };

    useEffect(() => {
        function resetTodo() {
            const minutesToNextDailyReset = hoursOffsetDailyReset * 60 + minutesOffsetDailyReset;
            const resetNotificationWindow = notification?.minutes ?? 5;

            const shouldResetTodos =
                (isDone1 || isDone2) &&
                minutesToNextDailyReset <= resetNotificationWindow &&
                lastNotification < currentDateDailyReset.getTime() &&
                lastNotification < dateDailyReset.getTime() - (resetNotificationWindow + 1) * 60000;

            if (shouldResetTodos) {
                setTodo1(false);
                setTodo2(false);
            }
        }

        resetTodo();
    }, [isDone1, isDone2, notification, lastNotification, setTodo1, setTodo2, hoursOffsetDailyReset, minutesOffsetDailyReset, currentDateDailyReset, dateDailyReset]);

    return (
        <tr className="event">
            <td className="notification">
                <div style={{ display: "flex", alignItems: "center" }}>
                <FontAwesomeIcon
                    className="bell"
                    data-active={isSubscribed}
                    icon={faBell}
                    onClick={toggleNotificationSubscription}
                />
                {type === eventTypes.WAX && (
                    <div style={{ marginLeft: 8 }}>
                    <input
                        type="checkbox"
                        style={{ marginRight: 8, transform: "scale(1.75)" }}
                        checked={isDone1}
                        onChange={toggleTodo1}
                    />
                    <input
                        type="checkbox"
                        style={{ marginLeft: 8, transform: "scale(1.75)" }}
                        checked={isDone2}
                        onChange={toggleTodo2}
                    />
                    </div>
                )}
                </div>
            </td>
            <td>{name}</td>
            <td>
                <Time hour={hour} minute={minute} />
            </td>
            <td>{`${hoursOffset}h ${minutesOffset}m`}</td>
        </tr>
    );
}
