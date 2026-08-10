import React, { useState, useEffect } from 'react';
import { useSimulationClock } from '../context/SimulationClockContext';
import { REAL_INDIAN_RAILWAYS_TRAINS } from '../data/real_trains';
import { predictDynamicDemandAndSurge } from '../data/demand-analytics-model';
import { doesTrainCoverRoute } from '../data/spatiotemporal/position_index_engine.js';
import { fetchAllTrainShards } from '../data/spatiotemporal/spatiotemporal_loader.js';
import { groupTrainsByServiceName, compute168HourCellStatus, getStatusForCell } from '../data/spatiotemporal/spatiotemporal_table_engine.js';

export default function SearchResultsPage({ fromStation, toStation, selectedDate, onSelectClassForBooking, onBackToHome }) {
  const { simDate } = useSimulationClock();
  const [selectedQuota, setSelectedQuota] = useState('GENERAL');
  const [filterAcOnly, setFilterAcOnly] = useState(false);
  const [filterAvailableOnly, setFilterAvailableOnly] = useState(false);
  const [filterTimeSlot, setFilterTimeSlot] = useState('ALL');
  const [allTrains, setAllTrains] = useState(REAL_INDIAN_RAILWAYS_TRAINS);

  // ASYNC SHARD LOADER: Fetch all 1,756 trains dynamically across 70 JSON shards
  useEffect(() => {
    let isMounted = true;
    fetchAllTrainShards().then(shards => {
      if (isMounted && shards && shards.length > 0) {
        setAllTrains(shards);
      }
    }).catch(err => console.warn('Shard load fallback to base trains:', err));
    return () => { isMounted = false; };
  }, []);

  // JOURNEY DATE (B0) & SYSTEM TIME (A0) SEPARATION LOGIC
  const [journeyDate, setJourneyDate] = useState(selectedDate || new Date(2026, 7, 15));

  // DYNAMIC ROLLOVER RULE (A0 >= B0):
  useEffect(() => {
    if (!journeyDate) return;
    const simTimeMs = simDate.getTime();
    const journeyTimeMs = new Date(journeyDate.getFullYear(), journeyDate.getMonth(), journeyDate.getDate(), 23, 59, 59).getTime();

    if (simTimeMs > journeyTimeMs) {
      setJourneyDate(new Date(simDate.getFullYear(), simDate.getMonth(), simDate.getDate()));
    }
  }, [simDate, journeyDate]);

  const simDayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const simMonthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const activeJourneyDateStr = `${simDayNames[journeyDate.getDay()]}, ${journeyDate.getDate().toString().padStart(2, '0')} ${simMonthNames[journeyDate.getMonth()]}`;

  // CHECK IF TRAIN RUNS ON THE JOURNEY DATE (B0) DAY OF WEEK
  const doesTrainRunToday = (train) => {
    if (!train) return true;
    const dayNames = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    const targetDay = dayNames[journeyDate.getDay()];

    if (Array.isArray(train.runsOn) && train.runsOn.length > 0) {
      if (train.runsOn.includes('DAILY')) return true;
      return train.runsOn.includes(targetDay);
    }

    const trainDaysStr = train.days;
    if (!trainDaysStr) return true;
    const dayOfWeek = journeyDate.getDay();
    const dayIndexMap = [6, 0, 1, 2, 3, 4, 5];
    const targetIdx = dayIndexMap[dayOfWeek];

    const dayTokens = String(trainDaysStr).split(/\s+/);
    if (dayTokens.length >= 7) {
      return dayTokens[targetIdx] !== '-';
    }
    return true;
  };

  // CHECK IF TRAIN HAS DEPARTED RELATIVE TO SYSTEM TIME (A0) TODAY
  const isTrainDeparted = (train) => {
    const isSameDay = simDate.getFullYear() === journeyDate.getFullYear() &&
                      simDate.getMonth() === journeyDate.getMonth() &&
                      simDate.getDate() === journeyDate.getDate();

    if (!isSameDay) return false;

    const simTimeMs = simDate.getTime();
    const trainDeptMs = new Date(simDate.getFullYear(), simDate.getMonth(), simDate.getDate(), train.deptHour || 12, train.deptMin || 0, 0).getTime();
    return simTimeMs > trainDeptMs;
  };

  // ML-POWERED DYNAMIC SEAT BOOKING, TATKAL TIME-GATE & FLEXI-FARE SURGE CALCULATOR
  const getDynamicSeatStatus = (train, cls) => {
    if (isTrainDeparted(train)) {
      return { status: 'DEPARTED - BOOKING CLOSED', cnf: 'Departure Passed', color: '#dc2626', avail: false, departed: true, price: cls.price || 500, surge: 1.0 };
    }

    const journeyTimeMs = new Date(journeyDate.getFullYear(), journeyDate.getMonth(), journeyDate.getDate()).getTime();
    const simTimeMs = new Date(simDate.getFullYear(), simDate.getMonth(), simDate.getDate()).getTime();
    const daysToDeparture = Math.max(0, Math.floor((journeyTimeMs - simTimeMs) / (1000 * 60 * 60 * 24)));

    const mlResult = predictDynamicDemandAndSurge({
      trainCategory: train.category ? train.category.toUpperCase() : 'SUPERFAST',
      classCode: cls.code,
      totalCapacity: cls.totalSeats || 500,
      daysToDeparture,
      journeyDateObj: journeyDate,
      basePrice: cls.price || 500,
      corridorDensity: train.corridorDensity || 2.5,
      quota: selectedQuota,
      simDate
    });

    return {
      status: mlResult.status,
      cnf: mlResult.cnfChance,
      color: mlResult.color || '#3aa459',
      avail: mlResult.availableSeats > 0,
      departed: false,
      price: mlResult.surgedPrice,
      surgeMultiplier: mlResult.surgeMultiplier,
      festInfo: mlResult.festivalInfo
    };
  };

  // STRICT ROUTE FILTERING ONLY - NO DUMP FALLBACK EVER!
  const matchedTrains = allTrains.filter(train => doesTrainCoverRoute(train, fromStation, toStation));

  // APPLY FILTERS PERFECTLY
  const processedTrains = matchedTrains.map(train => {
    const runsToday = doesTrainRunToday(train);

    const safeClasses = train.classes && train.classes.length > 0 ? train.classes : [
      { code: '3A', price: 1200 },
      { code: '2A', price: 1800 },
      { code: 'SL', price: 450 }
    ];

    // FILTER SEAT CLASSES ACCORDING TO USER FILTER CHECKBOXES
    const matchingClasses = safeClasses.filter(c => {
      // 1. AC Classes Only Filter
      if (filterAcOnly && !['3A', '2A', '1A', 'CC', 'EC'].includes(c.code)) {
        return false;
      }
      
      // 2. Available Seats Only Filter
      if (filterAvailableOnly) {
        const dynamicStat = getDynamicSeatStatus(train, c);
        if (!dynamicStat.avail || dynamicStat.departed) {
          return false;
        }
      }

      return true;
    });

    return {
      ...train,
      runsToday,
      visibleClasses: matchingClasses
    };
  }).filter(train => {
    // Hide train if no visible classes match the active class filters
    if (!train || train.visibleClasses.length === 0) return false;

    // 3. Departure Time Slot Filter
    // Parse actual departure hour from deptTime string ("19:10") or first stoppage dept
    let deptH = null;
    const rawDeptTime = train.deptTime
      || (train.stoppages && train.stoppages[0] && (train.stoppages[0].dept || train.stoppages[0].arr))
      || null;

    if (rawDeptTime && typeof rawDeptTime === 'string' && rawDeptTime.includes(':')) {
      deptH = parseInt(rawDeptTime.split(':')[0], 10);
    } else if (typeof train.deptHour === 'number') {
      deptH = train.deptHour;
    }

    if (filterTimeSlot !== 'ALL' && deptH === null) return true; // unknown time → always show

    if (filterTimeSlot === 'EARLY'     && !(deptH >= 0  && deptH < 6))  return false;
    if (filterTimeSlot === 'MORNING'   && !(deptH >= 6  && deptH < 12)) return false;
    if (filterTimeSlot === 'AFTERNOON' && !(deptH >= 12 && deptH < 18)) return false;
    if (filterTimeSlot === 'NIGHT'     && !(deptH >= 18 && deptH < 24)) return false;

    return true;
  });

  return (
    <div style={{ background: '#f4f5f7', minHeight: '100vh', paddingBottom: '3rem' }}>
      {/* SEARCH TOP HEADER BAR */}
      <div style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <button onClick={onBackToHome} style={{ background: 'none', border: '1px solid #cbd5e1', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700 }}>
            ← Back to Search
          </button>
          <div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
              {fromStation || 'All Stations'} ➔ {toStation || 'All Stations'}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
              Departure Date: <strong style={{ color: '#0284c7' }}>{activeJourneyDateStr}</strong> • {processedTrains.length} Direct Trains Found
            </div>
          </div>
        </div>

        {/* QUOTA SELECTOR */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569' }}>Quota:</span>
          {[
            { id: 'GENERAL', label: 'GENERAL' },
            { id: 'TATKAL', label: 'TATKAL' },
            { id: 'LADIES', label: 'LADIES' }
          ].map(q => (
            <button
              key={q.id}
              onClick={() => setSelectedQuota(q.id)}
              style={{
                background: selectedQuota === q.id ? (q.id === 'TATKAL' ? '#ea580c' : (q.id === 'LADIES' ? '#db2777' : '#3aa459')) : '#f1f5f9',
                color: selectedQuota === q.id ? '#ffffff' : '#334155',
                border: 'none',
                padding: '0.45rem 1rem',
                borderRadius: '20px',
                fontWeight: 800,
                fontSize: '0.8rem',
                cursor: 'pointer',
                boxShadow: selectedQuota === q.id ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              {q.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '1.5rem auto', display: 'grid', gridTemplateColumns: '260px 1fr', gap: '1.5rem', padding: '0 1rem' }}>
        {/* LEFT FILTER SIDEBAR */}
        <aside style={{ background: '#ffffff', borderRadius: '12px', padding: '1.25rem', border: '1px solid #e2e8f0', height: 'fit-content' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>Filters</h3>
            {(filterAcOnly || filterAvailableOnly || filterTimeSlot !== 'ALL') && (
              <span
                onClick={() => { setFilterAcOnly(false); setFilterAvailableOnly(false); setFilterTimeSlot('ALL'); }}
                style={{ fontSize: '0.75rem', color: '#dc2626', cursor: 'pointer', fontWeight: 700 }}
              >
                Reset All
              </span>
            )}
          </div>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>Quick Filters</div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', marginBottom: '0.5rem', cursor: 'pointer' }}>
              <input type="checkbox" checked={filterAcOnly} onChange={(e) => setFilterAcOnly(e.target.checked)} />
              AC Classes Only
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer' }}>
              <input type="checkbox" checked={filterAvailableOnly} onChange={(e) => setFilterAvailableOnly(e.target.checked)} />
              Available Seats Only
            </label>
          </div>

          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>Departure Time</div>
            {[
              { id: 'ALL', label: 'All Times' },
              { id: 'EARLY', label: 'Early Morning (00:00 - 06:00)' },
              { id: 'MORNING', label: 'Morning (06:00 - 12:00)' },
              { id: 'AFTERNOON', label: 'Afternoon (12:00 - 18:00)' },
              { id: 'NIGHT', label: 'Night (18:00 - 24:00)' }
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setFilterTimeSlot(t.id)}
                style={{
                  display: 'block',
                  width: '100%',
                  background: filterTimeSlot === t.id ? '#ecfdf5' : '#f8fafc',
                  color: filterTimeSlot === t.id ? '#065f46' : '#334155',
                  border: filterTimeSlot === t.id ? '1px solid #3aa459' : '1px solid #e2e8f0',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  marginBottom: '0.35rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontWeight: filterTimeSlot === t.id ? 800 : 500
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </aside>

        {/* RIGHT TRAIN LISTINGS */}
        <main style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {processedTrains.length === 0 ? (
            <div style={{ background: '#ffffff', borderRadius: '12px', padding: '3rem', textAlign: 'center', border: '1px solid #e2e8f0' }}>
              <h3 style={{ fontSize: '1.2rem', color: '#0f172a', fontWeight: 800 }}>No Direct Trains Found For This Route</h3>
              <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                No trains in our schedule connect <strong>{fromStation}</strong> to <strong>{toStation}</strong> on {activeJourneyDateStr}.
              </p>
              <button
                onClick={onBackToHome}
                style={{ marginTop: '1rem', background: '#3aa459', color: '#ffffff', border: 'none', padding: '0.55rem 1.25rem', borderRadius: '8px', fontWeight: 800, cursor: 'pointer' }}
              >
                Change Search Route / Date
              </button>
            </div>
          ) : (
            processedTrains.map(train => {
              const departed = isTrainDeparted(train);
              return (
                <div key={train.id} style={{ background: '#ffffff', borderRadius: '12px', padding: '1.5rem', border: departed ? '1px solid #fca5a5' : '1px solid #e2e8f0', opacity: departed ? 0.7 : 1, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                  {/* TRAIN TITLE ROW */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px dashed #e2e8f0', paddingBottom: '0.75rem' }}>
                    <div>
                      <span style={{
                        fontSize: '1.1rem',
                        fontWeight: 800,
                        color: '#0f172a',
                        textDecoration: train.isGenerated ? 'underline' : 'none',
                        textDecorationStyle: train.isGenerated ? 'wavy' : 'solid',
                        textDecorationColor: train.isGenerated ? '#2563eb' : 'transparent'
                      }}>
                        {train.number}
                      </span>
                      <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginLeft: '0.35rem' }}>
                        - {train.name}
                      </span>
                      {train.isGenerated && (
                        <span style={{ marginLeft: '0.5rem', fontSize: '0.7rem', background: '#eff6ff', color: '#1d4ed8', border: '1px solid #93c5fd', padding: '0.15rem 0.4rem', borderRadius: '4px', fontWeight: 700 }}>
                          Corridor Route
                        </span>
                      )}
                      <span style={{ marginLeft: '1rem', fontSize: '0.75rem', background: '#e2e8f0', padding: '0.2rem 0.5rem', borderRadius: '4px', color: '#475569' }}>
                        Runs: {train.days}
                      </span>
                      {!train.runsToday && (
                        <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', background: '#fef3c7', color: '#b45309', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 800 }}>
                          DOES NOT RUN ON {activeJourneyDateStr.split(',')[0].toUpperCase()}
                        </span>
                      )}
                      {selectedQuota === 'LADIES' && (
                        <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', background: '#fce7f3', color: '#db2777', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 800 }}>
                          LADIES QUOTA ACTIVE (6 BERTHS/COACH)
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      {departed ? (
                        <span style={{ fontSize: '0.75rem', color: '#dc2626', background: '#fef2f2', border: '1px solid #fca5a5', padding: '0.25rem 0.65rem', borderRadius: '4px', fontWeight: 800 }}>
                          DEPARTED - BOOKING CLOSED
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: train.categoryColor || '#2563eb', background: '#f1f5f9', padding: '0.25rem 0.65rem', borderRadius: '4px', fontWeight: 800 }}>
                          {train.category}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* ROUTE TIMELINE ROW */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px 1fr', alignItems: 'center', textAlign: 'center', marginBottom: '1.25rem' }}>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#0f172a' }}>{train.deptTime}</div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>{train.deptStation}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{train.deptCity}</div>
                    </div>

                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>{train.duration}</div>
                      <div style={{ height: '2px', background: '#cbd5e1', margin: '0.25rem 0', position: 'relative' }}>
                        <div style={{ width: '8px', height: '8px', background: '#3aa459', borderRadius: '50%', position: 'absolute', top: '-3px', left: '50%', transform: 'translateX(-50%)' }} />
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Direct</div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#0f172a' }}>{train.arrTime}</div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>{train.arrStation}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{train.arrCity}</div>
                    </div>
                  </div>

                  {/* 168-HOUR SPATIOTEMPORAL STATUS BANNER */}
                  {(() => {
                    // dayIdx: Mon=0 … Sun=6 (matches Python engine convention)
                    const jsDow   = simDate.getDay();               // 0=Sun…6=Sat
                    const dayIdx  = (jsDow + 6) % 7;               // Mon=0…Sun=6
                    const hour    = simDate.getHours();
                    const cellStat = getStatusForCell(train, dayIdx, hour, simDate, journeyDate);
                    const colorMap = {
                      DEPARTED:   { text: '#dc2626', bg: '#fef2f2' },
                      ARRIVED:    { text: '#059669', bg: '#ecfdf5' },
                      HALTED:     { text: '#d97706', bg: '#fffbeb' },
                      TRAVELLING: { text: '#2563eb', bg: '#eff6ff' },
                      RETURN:     { text: '#7c3aed', bg: '#f5f3ff' },
                    };
                    const col = colorMap[cellStat.status] || colorMap.TRAVELLING;
                    return (
                      <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0.6rem 0.85rem', marginBottom: '1rem', display: 'flex', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#475569', marginRight: '0.5rem' }}>LIVE STATUS:</span>
                        <span style={{ fontSize: '0.8rem', fontWeight: 800, color: col.text, background: col.bg, padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                          {cellStat.label}
                        </span>
                      </div>
                    );
                  })()}

                  {/* CLASS MATRIX ROW */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' }}>
                    {train.visibleClasses.map(cls => {
                      const dynStat = getDynamicSeatStatus(train, cls);

                      return (
                        <div key={cls.code} style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                              <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f172a' }}>{cls.code}</span>
                              <div style={{ textAlign: 'right' }}>
                                <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>₹{dynStat.price}</span>
                                {dynStat.surgeMultiplier > 1.0 && (
                                  <span style={{ display: 'block', fontSize: '0.65rem', color: '#ea580c', fontWeight: 800 }}>
                                    {dynStat.surgeMultiplier}x FLEXI-SURGE
                                  </span>
                                )}
                              </div>
                            </div>
                            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: dynStat.color, marginBottom: '0.25rem' }}>
                              {dynStat.status}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: dynStat.departed ? '#dc2626' : '#059669', background: dynStat.departed ? '#fef2f2' : '#ecfdf5', padding: '0.15rem 0.4rem', borderRadius: '4px', display: 'inline-block', fontWeight: 700 }}>
                              {dynStat.cnf}
                            </div>
                          </div>

                          <button
                            disabled={!dynStat.avail || dynStat.departed}
                            onClick={() => onSelectClassForBooking(train, { ...cls, price: dynStat.price })}
                            style={{
                              marginTop: '0.75rem',
                              background: (dynStat.avail && !dynStat.departed) ? (selectedQuota === 'LADIES' ? '#db2777' : '#3aa459') : '#e2e8f0',
                              color: (dynStat.avail && !dynStat.departed) ? '#ffffff' : '#64748b',
                              border: 'none',
                              padding: '0.45rem',
                              borderRadius: '6px',
                              fontWeight: 800,
                              fontSize: '0.8rem',
                              cursor: (dynStat.avail && !dynStat.departed) ? 'pointer' : 'not-allowed',
                              width: '100%'
                            }}
                          >
                            {(dynStat.avail && !dynStat.departed) ? 'BOOK' : (dynStat.departed ? 'DEPARTED' : 'NOT AVAIL')}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </main>
      </div>
    </div>
  );
}
