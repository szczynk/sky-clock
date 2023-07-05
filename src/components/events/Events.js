import Event from "./Event";
import "./Events.css";

import Shard from "./Shard";

import { eventNames, eventDefinitions, eventTypeNames, eventTypes } from "../../event-data/event-data";
import { getEventOffset } from "../../date-tools/event-time-offset";

export default function render({ currentDate }) {
    let eventDataDailyReset

    function getEventData() {
        const eventKeyNames = Object.keys(eventNames);

        const eventRecords = eventKeyNames.map((eventKeyName) => {
            const eventData = eventDefinitions[eventNames[eventKeyName]];

            eventData.offsetData = getEventOffset(eventData, currentDate);
            eventData.currentDate = currentDate;

            return eventData;
        });

        eventRecords.sort((eventRecord1, eventRecord2) => {
            if (eventRecord1.type > eventRecord2.type) {
                return 1;
            } else if (eventRecord1.type === eventRecord2.type &&
                eventRecord1.offsetData.minutesToNextEvent > eventRecord2.offsetData.minutesToNextEvent) {
                return 1;
            } else if (eventRecord1.type === eventRecord2) {
                return 0;
            } else {
                return -1;
            }
        });

        let lastType = -1;
        const finalEventRecordset = [];
        
        eventRecords.forEach((eventRecord) => {
            if (eventRecord.type !== lastType) {
                finalEventRecordset.push({ group: eventTypeNames[eventRecord.type] });
            }

            finalEventRecordset.push(eventRecord);

            lastType = eventRecord.type;

            if (eventRecord.type === eventTypes.RESET) {
                eventDataDailyReset = eventRecord
            }
        });

        return finalEventRecordset;
    }

    function getGroupHeader({ group: groupName }) {
        return (
            <tr className="heading" key={groupName}>
                <td colSpan="4">{groupName}</td>
            </tr>
        );
    }

    function getEventElement(eventRecord, eventDataDailyReset) {
        return (<Event eventData={eventRecord} eventDataDailyReset={eventDataDailyReset} key={eventRecord.key}></Event>)
    }

    function isGroupRecord(eventRecord) {
        return eventRecord.group !== undefined;
    }

    const eventList = getEventData().map((eventData) =>
        isGroupRecord(eventData) ? getGroupHeader(eventData) : getEventElement(eventData, eventDataDailyReset)
    );

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
                    {eventList}
                    {/* <tr className="heading"><td colSpan="4">Shard Events: Randomized</td></tr> */}
                    <Shard currentDate={currentDate} />
                </tbody>
            </table>
        </div>
    );
}