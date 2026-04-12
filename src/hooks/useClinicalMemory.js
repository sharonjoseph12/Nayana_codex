import { useEffect, useState, useCallback } from 'react';

/**
 * Resilient Clinical Memory Hook (Phase 21)
 * Manages persistent storage of patient session data.
 */
export function useClinicalMemory(roomId = 'icu-7') {
  const STORAGE_KEY = `nayana_session_${roomId}`;

  // Initial load from storage
  const loadMemory = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch (err) {
      console.error('Nayana: Memory Recovery Failed:', err);
    }
    return { caregiverLog: [], clinicalLog: [], lastInteractionAt: Date.now() };
  }, [STORAGE_KEY]);

  const [memory, setMemory] = useState(loadMemory());

  // Subscribe to changes in memory and update storage
  useEffect(() => {
    const backup = JSON.stringify(memory);
    localStorage.setItem(STORAGE_KEY, backup);
  }, [memory, STORAGE_KEY]);

  /** 
   * Updates a specific clinical log stream
   */
  const updateLog = useCallback((type, entry) => {
    setMemory(prev => {
      const currentLog = prev[type] || [];
      // Keep only last 100 entries to prevent storage bloat
      const newLog = [entry, ...currentLog].slice(0, 100);
      return { ...prev, [type]: newLog, lastInteractionAt: Date.now() };
    });
  }, []);

  /**
   * Resets the entire session for patient handover
   */
  const clearSession = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setMemory({ caregiverLog: [], clinicalLog: [], lastInteractionAt: Date.now() });
  }, [STORAGE_KEY]);

  return {
    caregiverLog: memory.caregiverLog,
    clinicalLog: memory.clinicalLog,
    lastInteractionAt: memory.lastInteractionAt,
    updateLog,
    clearSession,
    setMemory
  };
}
