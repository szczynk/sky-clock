import React from "react";

function padTime(time) {
    return time.toString().padStart(2, "0");
}

export default function render({ hour, minute, second = null }) {
    const formattedTime = `${padTime(hour)}:${padTime(minute)}${second !== null ? `:${padTime(second)}` : ''}`;
    return <span className="time">{formattedTime}</span>;
}
