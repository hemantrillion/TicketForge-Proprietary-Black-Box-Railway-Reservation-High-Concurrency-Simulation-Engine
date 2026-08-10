import React, { createContext, useState, useEffect, useContext } from 'react';

const SimulationClockContext = createContext();

export function SimulationClockProvider({ children }) {
  // Baseline Simulation Date: Current Real-World Date & Time on load
  const [simDate, setSimDate] = useState(new Date());
  const [simSpeed, setSimSpeed] = useState(1);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;

    // Tick every 1000ms (1 real second)
    const interval = setInterval(() => {
      setSimDate(prevDate => {
        // EXACT SPEED CONVERSION SCALE:
        // 1x  = 1 real minute equals 1 sim hour (60 sim seconds per real second)
        // 2x  = 1 real minute equals 2 sim hours (120 sim seconds per real second)
        // 6x  = 1 real minute equals 6 sim hours (360 sim seconds per real second)
        // 12x = 1 real minute equals 12 sim hours (720 sim seconds per real second)
        // 24x = 1 real minute equals 24 sim hours / 1 sim day (1440 sim seconds per real second)
        let simSecondsToAdd = 60; // 1x default
        if (simSpeed === 2) simSecondsToAdd = 120;
        else if (simSpeed === 6) simSecondsToAdd = 360;
        else if (simSpeed === 12) simSecondsToAdd = 720;
        else if (simSpeed === 24) simSecondsToAdd = 1440;

        return new Date(prevDate.getTime() + simSecondsToAdd * 1000);
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [simSpeed, isPaused]);

  return (
    <SimulationClockContext.Provider value={{ simDate, setSimDate, simSpeed, setSimSpeed, isPaused, setIsPaused }}>
      {children}
    </SimulationClockContext.Provider>
  );
}

export function useSimulationClock() {
  return useContext(SimulationClockContext);
}
