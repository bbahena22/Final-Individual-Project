import { useEffect, useRef, useState } from 'react';

function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : initialValue;
  });
  const valueRef = useRef(value);

  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  useEffect(() => {
    const onStorage = (event) => {
      if (event.key !== key) return;
      if (event.newValue == null) {
        setValue(initialValue);
        return;
      }
      setValue(JSON.parse(event.newValue));
    };

    const onLocalStorageUpdate = (event) => {
      if (!event.detail || event.detail.key !== key) return;
      setValue(event.detail.value);
    };

    window.addEventListener('storage', onStorage);
    window.addEventListener('local-storage-update', onLocalStorageUpdate);

    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('local-storage-update', onLocalStorageUpdate);
    };
  }, [key, initialValue]);

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  const setStoredValue = (nextValue) => {
    const resolvedValue = nextValue instanceof Function ? nextValue(valueRef.current) : nextValue;
    valueRef.current = resolvedValue;
    setValue(resolvedValue);
    window.dispatchEvent(
      new CustomEvent('local-storage-update', {
        detail: { key, value: resolvedValue },
      })
    );
  };

  return [value, setStoredValue];
}

export default useLocalStorage;
