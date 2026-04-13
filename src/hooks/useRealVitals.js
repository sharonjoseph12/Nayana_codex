import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * useRealVitals.js
 * Scaffolds Web Bluetooth API integration for medical hardware.
 * Specifically targets the GATT standard "Heart Rate" service (0x180D).
 */
export default function useRealVitals(isSimulationEnabled = true) {
  const [isLive, setIsLive] = useState(false);
  const [device, setDevice] = useState(null);
  const [error, setError] = useState(null);
  
  const [sessionStartTime] = useState(Date.now());
  const [sessionDuration, setSessionDuration] = useState(0);

  const formatDuration = useCallback((ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return [
      hours > 0 ? String(hours).padStart(2, '0') : null,
      String(minutes).padStart(2, '0'),
      String(seconds).padStart(2, '0')
    ].filter(Boolean).join(':');
  }, []);

  const [vitals, setVitals] = useState({
    heartRate: 72,
    spo2: 98,
    resp: 16,
    temp: 36.6,
    focusScore: 100,
    fatigueRisk: 'Stable',
    sessionHealthScore: 100,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setSessionDuration(Date.now() - sessionStartTime);
    }, 1000);
    return () => clearInterval(timer);
  }, [sessionStartTime]);

  const charRef = useRef(null);

  // Simulation loop (only if not live)
  useEffect(() => {
    if (isLive) return;
    if (!isSimulationEnabled) return;

    const interval = setInterval(() => {
      setVitals(prev => ({
        ...prev,
        heartRate: Math.max(60, Math.min(100, prev.heartRate + (Math.random() - 0.5) * 2)),
        spo2: Math.max(95, Math.min(100, prev.spo2 + (Math.random() - 0.5) * 0.5)),
        resp: Math.max(12, Math.min(20, prev.resp + (Math.random() - 0.5) * 1)),
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, [isLive, isSimulationEnabled]);

  const connectBLE = useCallback(async () => {
    try {
      if (!navigator.bluetooth) {
        throw new Error('Bluetooth not supported in this browser');
      }

      const bleDevice = await navigator.bluetooth.requestDevice({
        filters: [{ services: ['heart_rate'] }],
        optionalServices: ['battery_service', 'device_information']
      });

      setDevice(bleDevice);
      const server = await bleDevice.gatt.connect();
      const service = await server.getPrimaryService('heart_rate');
      const characteristic = await service.getCharacteristic('heart_rate_measurement');

      charRef.current = characteristic;

      await characteristic.startNotifications();
      characteristic.addEventListener('characteristicvaluechanged', (event) => {
        const value = event.target.value;
        const flags = value.getUint8(0);
        const hrValue = (flags & 0x01) ? value.getUint16(1, true) : value.getUint8(1);
        
        setVitals(prev => ({ ...prev, heartRate: hrValue }));
        setIsLive(true);
      });

      bleDevice.addEventListener('gattserverdisconnected', () => {
        setIsLive(false);
        setDevice(null);
      });

    } catch (err) {
      console.error('BLE Vitals Error:', err);
      setError(err.message);
      setIsLive(false);
    }
  }, []);

  const disconnectBLE = useCallback(() => {
    if (device && device.gatt.connected) {
      device.gatt.disconnect();
    }
    setIsLive(false);
    setDevice(null);
  }, [device]);

  return {
    vitals: { ...vitals, sessionDuration, formatDuration },
    isLive,
    error,
    connectBLE,
    disconnectBLE,
    canUseBLE: !!navigator.bluetooth
  };
}
