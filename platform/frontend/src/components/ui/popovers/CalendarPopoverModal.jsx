import React from 'react';
import { useSimulationClock } from '../../../context/SimulationClockContext';

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export default function CalendarPopoverModal({
  calYear,
  calMonth,
  handlePrevMonth,
  handleNextMonth,
  firstDayIndex,
  daysInCalMonth,
  selectedDate,
  handleSelectCalDate
}) {
  const { simDate } = useSimulationClock();

  // Baseline dates for past-date blocking & 60-Day ARP limit
  const todayStart = new Date(simDate.getFullYear(), simDate.getMonth(), simDate.getDate());
  const arpLimitDate = new Date(todayStart.getTime() + 60 * 24 * 60 * 60 * 1000); // 60 days in future

  return (
    <div className="ct-calendar-modal" onClick={(e) => e.stopPropagation()}>
      <div className="ct-cal-header">
        <span className="ct-cal-nav" onClick={(e) => { e.stopPropagation(); e.preventDefault(); handlePrevMonth(); }}>◀</span>
        <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f172a' }}>
          {MONTH_NAMES[calMonth]} {calYear}
        </div>
        <span className="ct-cal-nav" onClick={(e) => { e.stopPropagation(); e.preventDefault(); handleNextMonth(); }}>▶</span>
      </div>

      <div className="ct-cal-days">
        <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
      </div>

      <div className="ct-cal-grid">
        {/* Blank Padding Days for Month Alignment */}
        {Array.from({ length: firstDayIndex }).map((_, i) => (
          <div key={`empty-${i}`} className="ct-cal-date empty"></div>
        ))}

        {/* Calendar Day Buttons */}
        {Array.from({ length: daysInCalMonth }).map((_, i) => {
          const dayNum = i + 1;
          const thisDate = new Date(calYear, calMonth, dayNum);

          const isSelected = selectedDate &&
            selectedDate.getDate() === dayNum &&
            selectedDate.getMonth() === calMonth &&
            selectedDate.getFullYear() === calYear;

          // PAST DATE CHECK (B0 < A0)
          const isPast = thisDate.getTime() < todayStart.getTime();

          // 60-DAY ARP LIMIT CHECK (B0 > A0 + 60 Days)
          const isBeyondARP = thisDate.getTime() > arpLimitDate.getTime();

          const isDisabled = isPast || isBeyondARP;

          return (
            <div
              key={dayNum}
              onClick={(e) => {
                e.stopPropagation();
                if (!isDisabled) handleSelectCalDate(dayNum);
              }}
              title={isBeyondARP ? "BOOKING NOT YET OPEN (60-DAY ARP LIMIT)" : (isPast ? "Past Date - Cannot Select" : "")}
              className={`ct-cal-date ${isSelected ? 'active' : ''} ${isDisabled ? 'disabled' : ''}`}
              style={{
                cursor: isDisabled ? 'not-allowed' : 'pointer',
                opacity: isPast ? 0.35 : (isBeyondARP ? 0.45 : 1),
                pointerEvents: isDisabled ? 'none' : 'auto'
              }}
            >
              {dayNum}
            </div>
          );
        })}
      </div>
    </div>
  );
}
