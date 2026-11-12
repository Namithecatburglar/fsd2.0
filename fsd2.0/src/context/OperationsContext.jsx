import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

const OperationsContext = createContext();

export const OperationsProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();

  const [kpis, setKpis] = useState({
    total: 48,
    online: 42,
    maintenance: 3,
    warning: 2,
    offline: 1,
    totalPower: 318.0,
    totalCapacity: 360.0,
    capacityFactor: 88.3,
    availabilityRate: 87.5,
    avgWindSpeed: 12.4,
    avgHealth: 91,
  });

  const [weather, setWeather] = useState(null);
  const [activeAlertsCount, setActiveAlertsCount] = useState(4);
  const [maintenanceCount, setMaintenanceCount] = useState({ total: 7, overdue: 3 });
  const [inspectionsCount, setInspectionsCount] = useState({ total: 12, scheduled: 10 });
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isLiveFeedActive, setIsLiveFeedActive] = useState(true);
  const [livePulse, setLivePulse] = useState(false);

  const fetchLiveTelemetry = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      setLivePulse(true);
      const [kpiRes, weatherRes, alertRes, maintRes, inspRes] = await Promise.allSettled([
        api.getTurbineSummary(),
        api.getCurrentWeather(),
        api.getAlertSummary(),
        api.getMaintenanceSummary(),
        api.getInspectionSummary(),
      ]);

      if (kpiRes.status === 'fulfilled' && kpiRes.value.success) {
        setKpis(kpiRes.value.data);
      }
      if (weatherRes.status === 'fulfilled' && weatherRes.value.success) {
        setWeather(weatherRes.value.data);
      }
      if (alertRes.status === 'fulfilled' && alertRes.value.success) {
        setActiveAlertsCount(alertRes.value.data.active);
      }
      if (maintRes.status === 'fulfilled' && maintRes.value.success) {
        setMaintenanceCount(maintRes.value.data);
      }
      if (inspRes.status === 'fulfilled' && inspRes.value.success) {
        setInspectionsCount(inspRes.value.data);
      }

      setLastUpdated(new Date());
      setTimeout(() => setLivePulse(false), 800);
    } catch (err) {
      console.error('[Operations] Telemetry polling sync error:', err.message);
      setLivePulse(false);
    }
  }, [isAuthenticated]);

  // Initial fetch on login
  useEffect(() => {
    if (isAuthenticated) {
      fetchLiveTelemetry();
    }
  }, [isAuthenticated, fetchLiveTelemetry]);

  // 12-second live polling loop
  useEffect(() => {
    if (!isAuthenticated || !isLiveFeedActive) return;

    const intervalId = setInterval(() => {
      fetchLiveTelemetry();
    }, 12000);

    return () => clearInterval(intervalId);
  }, [isAuthenticated, isLiveFeedActive, fetchLiveTelemetry]);

  // Force trigger simulation tick on server and refresh immediately
  const triggerSimulationTick = async () => {
    try {
      await api.triggerSimulationTick();
      await fetchLiveTelemetry();
    } catch (err) {
      console.error('[Operations] Manual tick error:', err);
    }
  };

  return (
    <OperationsContext.Provider
      value={{
        kpis,
        weather,
        activeAlertsCount,
        maintenanceCount,
        inspectionsCount,
        lastUpdated,
        isLiveFeedActive,
        setIsLiveFeedActive,
        livePulse,
        refreshData: fetchLiveTelemetry,
        triggerSimulationTick,
      }}
    >
      {children}
    </OperationsContext.Provider>
  );
};

export const useOperations = () => useContext(OperationsContext);
