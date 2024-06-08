import { useState, useEffect } from "react";

function setLocalStorageItem(key, value) {
  const valueString = JSON.stringify(value);
  localStorage.setItem(key, valueString);
}

export default function useLocalStorage(key, initialValue = null) {
  if (typeof key !== "string") {
    throw new Error("LocalStorage key must be a string");
  }

  const [value, setValue] = useState(() => {
    const storedValue = localStorage.getItem(key);
    return storedValue ? JSON.parse(storedValue) : initialValue;
  });

  useEffect(() => {
    setLocalStorageItem(key, value);
  }, [key, value]);

  function updateValue(newValue) {
    if (typeof newValue !== "undefined") {
      setLocalStorageItem(key, newValue);
      setValue(newValue);
    }
  }

  return [value, updateValue];
}
