import React, { useState, useEffect } from 'react';
import { useSimulationClock } from '../context/SimulationClockContext';
import { fetchAllTrainShards } from '../data/spatiotemporal/spatiotemporal_loader.js';
import { getStationFullName, parseTimeMins } from '../data/spatiotemporal/spatiotemporal_table_engine.js';

export default function LiveRunningStatusPage({ token, user, prefilledTrain }) {
  const { simDate } = useSimulationClock();
  const [trainQuery, setTrainQuery] = useState(prefilledTrain || '');
  const [allTrains, setAllTrains] = useState([]);
  const [selectedTrain, setSelectedTrain] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllTrainShards().then(trains => {
      setAllTrains(trains || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  // Auto-search when allTrains loads and prefilledTrain is set
  useEffect(() => {
    if (!loading && allTrains.length > 0 && prefilledTrain) {
      const q = String(prefilledTrain).trim().toLowerCase();
      const found = allTrains.find(t =>
        String(t.number).trim() === q ||
        String(t.number).trim().toLowerCase() === q ||
        t.name?.toLowerCase().includes(q)
      );
      if (found) { setSelectedTrain(found); setNotFound(false); }
      else setNotFound(true);
    }
  }, [loading, allTrains, prefilledTrain]);

  const handleSearch = (e) => {
    e.preventDefault();
    const q = trainQuery.trim().toLowerCase();
    const found = allTrains.find(t =>
      String(t.number).trim() === q ||
      String(t.number).trim().toLowerCase() === q ||
      t.name?.toLowerCase().includes(q)
    );
    if (found) { setSelectedTrain(found); setNotFound(false); }
    else { setSelectedTrain(null); setNotFound(true); }
  };

  // Compute live position from sim clock using actual stoppage times
  const getLiveStatus = (train) => {
    if (!train || !train.stoppages || train.stoppages.length === 0) {
      return { statusText: 'Status Unknown', activeIdx: 0, isRunning: false };
    }

    const stoppages = train.stoppages;
    const simMins = simDate.getHours() * 60 + simDate.getMinutes();

    // Walk through stoppages and find where the train is right now
    for (let i = 0; i < stoppages.length; i++) {
      const st = stoppages[i];
      const dayOffset = ((st.day || 1) - 1) * 1440;
      const arrM  = parseTimeMins(st.arr  || st.arrival_time);
      const deptM = parseTimeMins(st.dept || st.departure_time);

      // Use today's absolute minute count normalised to day 1
      const todayMins = simMins; // simplified: compare within day 1

      if (i === 0) {
        // Before origin departure
        if (deptM !== null && todayMins < deptM) {
          return { statusText: `Yet to depart from ${getStationFullName(st.code)} (${st.code})`, activeIdx: 0, isRunning: false };
        }
      }

      if (i === stoppages.length - 1) {
        // After terminal arrival
        if (arrM !== null && todayMins >= arrM) {
          return { statusText: `Arrived at ${getStationFullName(st.code)} (${st.code}) — Journey Complete`, activeIdx: i, isRunning: false };
        }
      }

      // Between departure of current stop and arrival of next stop → in transit
      const myDept = parseTimeMins(st.dept || st.arr || st.departure_time || st.arrival_time);
      if (i < stoppages.length - 1) {
        const nextSt = stoppages[i + 1];
        const nextArr = parseTimeMins(nextSt.arr || nextSt.arrival_time || nextSt.dept);
        if (myDept !== null && nextArr !== null) {
          if (todayMins >= myDept && todayMins < nextArr) {
            return {
              statusText: `En Route: ${getStationFullName(st.code)} → ${getStationFullName(nextSt.code)} (Next: ${nextSt.arr || nextSt.dept})`,
              activeIdx: i,
              isRunning: true
            };
          }
        }
      }

      // Halted at this station
      if (arrM !== null && deptM !== null && todayMins >= arrM && todayMins < deptM) {
        return {
          statusText: `Halted at ${getStationFullName(st.code)} (Platform — Dept: ${st.dept})`,
          activeIdx: i,
          isRunning: false
        };
      }
    }

    // Fallback: show last known
    const last = stoppages[stoppages.length - 1];
    return {
      statusText: `Last known: ${getStationFullName(last.code)} (${last.code})`,
      activeIdx: stoppages.length - 1,
      isRunning: false
    };
  };

  const liveStatus = selectedTrain ? getLiveStatus(selectedTrain) : null;

  return (
    <div style={{ background: '#f4f5f7', minHeight: '100vh', padding: '2rem 1rem', paddingBottom: '4rem' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {/* SEARCH BANNER */}
        <div style={{ background: '#ffffff', borderRadius: '12px', padding: '1.75rem', border: '1px solid #e2e8f0', marginBottom: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a', marginBottom: '0.5rem' }}>Live Train Running Status</h1>
          <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
            Real-time location tracker from our 1,756-train dataset, driven by the Simulation Clock.
          </p>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <input
              className="ct-form-input"
              style={{ maxWidth: '360px', flex: 1 }}
              placeholder="Train number or name (e.g. 12951 or Rajdhani)"
              value={trainQuery}
              onChange={(e) => setTrainQuery(e.target.value)}
            />
            <button className="ct-search-cta" style={{ borderRadius: '8px', padding: '0.65rem 1.5rem' }}>
              {loading ? 'Loading...' : 'CHECK STATUS'}
            </button>
          </form>
          {notFound && <div style={{ color: '#dc2626', fontSize: '0.85rem', marginTop: '0.75rem', fontWeight: 700 }}>Train not found. Try another number or name.</div>}
        </div>

        {/* LIVE STATUS */}
        {selectedTrain && liveStatus && (
          <div style={{ background: '#ffffff', borderRadius: '12px', padding: '1.75rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            {/* Status Banner */}
            <div style={{ background: liveStatus.isRunning ? '#ecfdf5' : '#eff6ff', border: `1px solid ${liveStatus.isRunning ? '#a7f3d0' : '#bfdbfe'}`, padding: '1rem 1.25rem', borderRadius: '10px', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#475569', fontWeight: 800 }}>
                  LIVE POSITION (SIM CLOCK: {simDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 900, color: liveStatus.isRunning ? '#065f46' : '#1d4ed8', marginTop: '0.2rem' }}>
                  {liveStatus.statusText}
                </div>
              </div>
              <span style={{
                background: liveStatus.isRunning ? '#3aa459' : '#2563eb',
                color: '#ffffff', padding: '0.4rem 0.85rem', borderRadius: '20px', fontWeight: 800, fontSize: '0.8rem'
              }}>
                {liveStatus.isRunning ? 'IN MOTION' : 'HALTED / ARRIVED'}
              </span>
            </div>

            <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0f172a', marginBottom: '1rem' }}>
              {selectedTrain.number} - {selectedTrain.name}
              <span style={{ marginLeft: '0.75rem', fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                {selectedTrain.stoppages?.length || 0} stops
              </span>
            </div>

            {/* STATION TIMELINE */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative', paddingLeft: '1.5rem' }}>
              <div style={{ position: 'absolute', left: '7px', top: '10px', bottom: '10px', width: '3px', background: '#cbd5e1' }} />
              {(selectedTrain.stoppages || []).map((st, idx) => {
                const isPassed  = idx < liveStatus.activeIdx;
                const isCurrent = idx === liveStatus.activeIdx;

                return (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{
                      position: 'absolute', left: '-1.5rem',
                      width: '15px', height: '15px', borderRadius: '50%',
                      background: isCurrent ? '#ea580c' : (isPassed ? '#3aa459' : '#cbd5e1'),
                      border: '2px solid #ffffff'
                    }} />
                    <div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 800, color: isCurrent ? '#ea580c' : '#0f172a' }}>
                        {getStationFullName(st.code)} <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>({st.code})</span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        Day {st.day || 1}
                        {st.distKm != null ? ` · ${st.distKm} km` : ''}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      {st.arr && st.arr !== 'Source' && (
                        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155' }}>Arr: {st.arr}</div>
                      )}
                      {st.dept && st.dept !== 'Destination' && (
                        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155' }}>Dept: {st.dept}</div>
                      )}
                      <div style={{ fontSize: '0.7rem', color: isPassed ? '#3aa459' : (isCurrent ? '#ea580c' : '#94a3b8'), fontWeight: 700 }}>
                        {isCurrent ? 'CURRENT' : (isPassed ? 'Passed' : 'Upcoming')}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
