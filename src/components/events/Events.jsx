import Event from "./Event";
import Shard from "./Shard";
import "./Events.css";
import {
  eventNames,
  eventDefinitions,
  eventTypeNames,
  eventTypes,
} from "../../event-data/event-data";
import { getEventOffset } from "../../date-tools/event-time-offset";

// million-ignore 
function GroupHeader({ group }) {
  return (
    <tr className="heading" key={group}>
      <td colSpan="4">{group}</td>
    </tr>
  );
}

function getEventData(currentDate) {
  const eventRecords = Object.keys(eventNames).map((eventKeyName) => {
    const eventData = eventDefinitions[eventNames[eventKeyName]];
    eventData.offsetData = getEventOffset(eventData, currentDate);
    eventData.currentDate = currentDate;
    return eventData;
  });

  eventRecords.sort((eventRecord1, eventRecord2) => {
    if (eventRecord1.type > eventRecord2.type) {
      return 1;
    } else if (
      eventRecord1.type === eventRecord2.type &&
      eventRecord1.offsetData.minutesToNextEvent >
        eventRecord2.offsetData.minutesToNextEvent
    ) {
      return 1;
    } else if (eventRecord1.type === eventRecord2) {
      return 0;
    } else {
      return -1;
    }
  });

  let lastType = -1;
  const finalEventRecordset = [];
  let eventDataDailyReset;

  eventRecords.forEach((eventRecord) => {
    if (eventRecord.type !== lastType) {
      finalEventRecordset.push({ group: eventTypeNames[eventRecord.type] });
    }

    finalEventRecordset.push(eventRecord);
    lastType = eventRecord.type;

    if (eventRecord.type === eventTypes.RESET) {
      eventDataDailyReset = eventRecord;
    }
  });

  return { finalEventRecordset, eventDataDailyReset };
}

function Events({ currentDate }) {
  function isGroupRecord(eventRecord) {
    return eventRecord.group !== undefined;
  }

  const { finalEventRecordset, eventDataDailyReset } =
    getEventData(currentDate);

  return (
    <div className="events-table">
      <table id="events">
        <thead>
          <tr>
            <th className="notification"></th>
            <th>Event Name</th>
            <th>Next Event</th>
            <th>Time to Next</th>
          </tr>
        </thead>
        <tbody>
          {finalEventRecordset.map((eventData) =>
            isGroupRecord(eventData) ? (
              <GroupHeader key={eventData.group} group={eventData.group} />
            ) : (
              <Event
                eventData={eventData}
                eventDataDailyReset={eventDataDailyReset}
                key={eventData.key}
              />
            )
          )}
          {/* <tr className="heading"><td colSpan="4">Shard Events: Randomized</td></tr> */}
          <Shard />
        </tbody>
      </table>
    </div>
  );
}

export default Events;
