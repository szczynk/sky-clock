import { useCallback, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell } from "@fortawesome/free-solid-svg-icons";

import Time from "../time/Time";
import { notify } from "../../services/notification-service";
import useLocalStorage from "../../hooks/localstorage";
import { eventTypes } from "../../event-data/event-data";

import "./Event.css";

function buildNotification(eventNotification, eventName, minutesToNextEvent) {
  const title = eventNotification?.title ?? "Sky Clock";
  const body =
    eventNotification?.body ?? `Event ${eventName} is about to begin!`;
  const image = eventNotification?.image;

  const modifiedBody = body.replace("{t}", minutesToNextEvent);

  return {
    title,
    body: modifiedBody,
    image,
  };
}

function Checkboxes({ isDone1, isDone2, toggleTodo1, toggleTodo2 }) {
  return (
    <div style={{ display: "flex", marginLeft: 8 }}>
      <input
        type="checkbox"
        style={{
          margin: 8,
          transform: "scale(1.75)",
        }}
        checked={isDone1}
        onChange={toggleTodo1}
      />
      <input
        type="checkbox"
        style={{
          margin: 8,
          transform: "scale(1.75)",
        }}
        checked={isDone2}
        onChange={toggleTodo2}
      />
    </div>
  );
}

// million-ignore
function Event({ eventData, eventDataDailyReset }) {
  const { key, offsetData, currentDate, name, type, notification } = eventData;
  const { date, hour, minute, hoursOffset, minutesOffset } = offsetData;

  const notificationKey = `${key}-lastNotification`;
  const subscriptionKey = `${key}-isSubscribed`;

  const [lastNotification, setLastNotification] = useLocalStorage(
    notificationKey,
    new Date().getTime()
  );
  const [isSubscribed, setSubscription] = useLocalStorage(
    subscriptionKey,
    false
  );

  const {
    currentDate: currentDateDailyReset,
    offsetData: { date: dateDailyReset },
  } = eventDataDailyReset;

  (function showNotification() {
    const minutesToNextEvent = hoursOffset * 60 + minutesOffset;
    const notificationWindow = notification?.minutes ?? 5;

    const shouldNotify =
      isSubscribed &&
      minutesToNextEvent <= notificationWindow &&
      lastNotification < currentDate.getTime() &&
      lastNotification < date.getTime() - (notificationWindow + 1) * 60000;

    if (shouldNotify) {
      console.log(`${name} notification`);
      const notif = buildNotification(notification, name, minutesToNextEvent);
      notify(notif);

      setLastNotification(currentDate.getTime());
    }
  })();

  function toggleNotificationSubscription() {
    if (
      typeof Notification === "function" &&
      Notification.permission !== "granted"
    ) {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          setSubscription(!isSubscribed);
        }
      });
    } else {
      setSubscription(!isSubscribed);
    }
    setLastNotification(currentDate.getTime());
  }

  const todoKey1 = `${key}-isDone1`;
  const [todo1, setTodo1] = useLocalStorage(todoKey1, {
    isDone: false,
    date: "",
  });
  const toggleTodo1 = () => {
    setTodo1({
      isDone: !todo1.isDone,
      date: !todo1.isDone ? Date.now() : "",
    });
  };

  const todoKey2 = `${key}-isDone2`;
  const [todo2, setTodo2] = useLocalStorage(todoKey2, {
    isDone: false,
    date: "",
  });
  const toggleTodo2 = () => {
    setTodo2({
      isDone: !todo2.isDone,
      date: !todo2.isDone ? Date.now() : "",
    });
  };

  const resetTodo = useCallback(() => {
    const isResetTime =
      currentDateDailyReset.getTime() / 1_000_000 >=
      (dateDailyReset.getTime() - 1_000_000) / 1_000_000;

    const shouldResetTodos = todo1.isDone && isResetTime;

    if (shouldResetTodos) {
      console.log(`reset ${todoKey1} notification`);
      setTodo1({ isDone: false, date: "" });
    }

    const shouldResetTodos2 = todo2.isDone && isResetTime;

    if (shouldResetTodos2) {
      console.log(`reset ${todoKey2} notification`);
      setTodo2({ isDone: false, date: "" });
    }
  }, [
    currentDateDailyReset,
    dateDailyReset,
    setTodo1,
    setTodo2,
    todo1.isDone,
    todo2.isDone,
    todoKey1,
    todoKey2,
  ]);

  useEffect(() => {
    // Check and reset todos on component mount
    resetTodo();

    const interval = setInterval(() => {
      resetTodo();
    }, 1000); // Check every second (you can adjust the interval as needed)

    return () => clearInterval(interval);
  }, [resetTodo]);

  const checkboxes = type === eventTypes.WAX && (
    <Checkboxes
      isDone1={todo1.isDone}
      isDone2={todo2.isDone}
      toggleTodo1={toggleTodo1}
      toggleTodo2={toggleTodo2}
    />
  );

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
          {checkboxes}
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

export default Event;
