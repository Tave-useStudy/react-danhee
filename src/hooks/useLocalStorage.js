    import { useCallback } from "react";

    export function useLocalStorage(key) {
    const loadValue = useCallback(
        (fallbackValue) => {
        try {
            const savedValue = localStorage.getItem(key);

            if (!savedValue) {
            return fallbackValue;
            }

            const parsedValue = JSON.parse(savedValue);

            if (
            parsedValue.version !== 1 || !Array.isArray(parsedValue.todos)) {
            return fallbackValue;
            }

            return parsedValue.todos;
        } catch (error) {
            console.error( "저장된 투두를 불러오지 못했습니다.", error);

            return fallbackValue;
        }
        },
        [key]
    );

    const saveValue = useCallback(
        (todos) => {
        try {
            const value = { version: 1, todos,};

            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error("투두를 저장하지 못했습니다.", error);}
        },
        [key]
    );

    return {
        loadValue,
        saveValue,
    };
    }