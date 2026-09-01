import { useState, useEffect } from 'react';

const STORAGE_KEY = 'search_history';
const MAX_HISTORY = 10;

export function useSearchHistory() {
    const [history, setHistory] = useState(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    const addToHistory = (term) => {
        if (!term?.trim()) return;

        setHistory((prev) => {
            const filtered = prev.filter((item) => item.toLowerCase() !== term.toLowerCase());
            const updated = [term, ...filtered].slice(0, MAX_HISTORY);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            return updated;
        });
    };

    const clearHistory = () => {
        setHistory([]);
        localStorage.removeItem(STORAGE_KEY);
    };

    const removeItem = (term) => {
        setHistory((prev) => {
            const updated = prev.filter((item) => item !== term);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            return updated;
        });
    };

    return { history, addToHistory, clearHistory, removeItem };
}