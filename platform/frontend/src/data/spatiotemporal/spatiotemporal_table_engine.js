// =============================================================================
// SPATIOTEMPORAL TABLE ENGINE v4
// Mirrors build_final_excel_v4.py exactly — continuous bidirectional timelines,
// 60-min window overlap status resolution, DEPARTED only on sim-clock cutoff.
// =============================================================================

// ---------------------------------------------------------------------------
// STATION NAME LOOKUP  (matches stations_57.json)
// ---------------------------------------------------------------------------
const STATION_NAME = {
  NDLS: 'New Delhi', DLI: 'Old Delhi', NZM: 'Hazrat Nizamuddin',
  ANVT: 'Anand Vihar Terminal', MMCT: 'Mumbai Central', CSMT: 'Mumbai CSMT',
  BDTS: 'Bandra Terminus', LTT: 'Lokmanya Tilak Terminus',
  HWH: 'Howrah Jn', SDAH: 'Sealdah', KGP: 'Kharagpur Jn',
  PNBE: 'Patna Jn', PPTA: 'Pataliputra Jn', MFP: 'Muzaffarpur Jn',
  CNB: 'Kanpur Central', LJN: 'Lucknow Jn', LKO: 'Lucknow Charbagh',
  ALD: 'Prayagraj Jn', MGS: 'Mughal Sarai Jn', BSB: 'Varanasi Jn',
  GZB: 'Ghaziabad Jn', AGC: 'Agra Cantt', KOTA: 'Kota Jn',
  JP: 'Jaipur Jn', JU: 'Jodhpur Jn', ADI: 'Ahmedabad Jn',
  ST: 'Surat', BRC: 'Vadodara Jn', PUNE: 'Pune Jn',
  SUR: 'Solapur Jn', SC: 'Secunderabad Jn', HYB: 'Hyderabad Deccan',
  MAS: 'Chennai Central', MS: 'Chennai Egmore', CBE: 'Coimbatore Jn',
  TVC: 'Thiruvananthapuram Central', ERS: 'Ernakulam Jn',
  SBC: 'Bengaluru City Jn', YPR: 'Yesvantpur Jn',
  BZA: 'Vijayawada Jn', VSKP: 'Visakhapatnam', GNT: 'Guntur Jn',
  BPL: 'Bhopal Jn', NGP: 'Nagpur Jn', ET: 'Itarsi Jn',
  NED: 'Nanded', AWB: 'Aurangabad', BSL: 'Bhusaval Jn',
  GHY: 'Guwahati', DBRG: 'Dibrugarh', RNY: 'Rangiya Jn',
  JTND: 'Jalpaiguri', NJP: 'New Jalpaiguri'
};

export function getStationFullName(code) {
  return STATION_NAME[code] || code;
}

// ---------------------------------------------------------------------------
// TIME PARSER
// ---------------------------------------------------------------------------
export function parseTimeMins(timeStr) {
  if (!timeStr || ['Source', 'Destination', 'unconfirmed', ''].includes(timeStr)) return null;
  try {
    const [h, m] = timeStr.split(':').map(Number);
    if (isNaN(h) || isNaN(m)) return null;
    return h * 60 + m;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// BUILD CONTINUOUS BIDIRECTIONAL 10080-MIN TIMELINE
// Trains go A→B then reverse B→A then A→B, endlessly — NO IDLE EVER.
// All labels in [brackets].
// ---------------------------------------------------------------------------
export function buildContinuousTimeline(train) {
  const stoppages = train.stoppages || [];
  if (stoppages.length === 0) return [];

  // --- Forward pass: build raw timeline segments relative to minute 0 ---
  const forwardSegments = [];  // [{start, end, label}]
  let firstDeptGlobal = null;
  let lastArrGlobal   = null;
  let lastArrDay      = 1;

  stoppages.forEach((st, idx) => {
    const dayOffset = (( st.day || 1) - 1) * 1440;
    const code = st.code || '?';
    const name = getStationFullName(code);
    const arrM  = parseTimeMins(st.arr  || st.arrival_time);
    const deptM = parseTimeMins(st.dept || st.departure_time);

    if (idx === 0) {
      // Origin
      if (deptM !== null) {
        firstDeptGlobal = dayOffset + deptM;
        forwardSegments.push({ start: firstDeptGlobal, end: firstDeptGlobal + 1, label: `[DEPARTED from ${name} – Origin]` });
      }
    } else if (idx === stoppages.length - 1) {
      // Terminal
      if (arrM !== null) {
        lastArrGlobal = dayOffset + arrM;
        lastArrDay    = st.day || 1;
        forwardSegments.push({ start: lastArrGlobal, end: lastArrGlobal + 1, label: `[ARRIVED at ${name} – Terminal]` });
      }
    } else {
      // Intermediate
      if (arrM !== null) {
        const gArr = dayOffset + arrM;
        forwardSegments.push({ start: gArr, end: gArr + 1, label: `[ARRIVED at ${name}]` });

        if (deptM !== null) {
          const gDept = dayOffset + deptM;
          if (gDept > gArr) {
            forwardSegments.push({ start: gArr, end: gDept, label: `[HALTED at ${name} (${st.arr || ''}–${st.dept || ''})]` });
          }
          forwardSegments.push({ start: gDept, end: gDept + 1, label: `[DEPARTED from ${name}]` });
        }
      }
    }

    // In-transit leg to next stop
    if (idx < stoppages.length - 1) {
      const nextSt     = stoppages[idx + 1];
      const nextDayOff = ((nextSt.day || 1) - 1) * 1440;
      const myD  = parseTimeMins(st.dept   || st.arr  || st.departure_time || st.arrival_time);
      const nxA  = parseTimeMins(nextSt.arr || nextSt.dept || nextSt.arrival_time || nextSt.departure_time);
      if (myD !== null && nxA !== null) {
        const gD  = dayOffset     + myD;
        const gNA = nextDayOff    + nxA;
        if (gNA > gD) {
          forwardSegments.push({
            start: gD, end: gNA,
            label: `[TRAVELLING ${name} → ${getStationFullName(nextSt.code || '?')}]`
          });
        }
      }
    }
  });

  if (firstDeptGlobal === null || lastArrGlobal === null) return [];

  const oneWayDuration = Math.max(lastArrGlobal - firstDeptGlobal, 60);

  // --- Reverse pass: mirror route segments (B→A) ---
  const revStoppages = [...stoppages].reverse();
  const reverseLegs  = [];   // [{duration, label}]

  revStoppages.forEach((st, idx) => {
    if (idx < revStoppages.length - 1) {
      const nextSt = revStoppages[idx + 1];
      const code    = st.code || '?';
      const nextCode = nextSt.code || '?';
      const stDayOff  = ((st.day    || 1) - 1) * 1440;
      const nxDayOff  = ((nextSt.day || 1) - 1) * 1440;
      const d_m = parseTimeMins(st.arr  || st.dept || st.arrival_time);
      const a_m = parseTimeMins(nextSt.dept || nextSt.arr || nextSt.departure_time);

      let segDur = 60; // default 1hr
      if (d_m !== null && a_m !== null) {
        const diff = Math.abs((stDayOff + d_m) - (nxDayOff + a_m));
        if (diff > 0) segDur = diff;
      }
      reverseLegs.push({ duration: segDur, label: `[TRAVELLING ${getStationFullName(code)} → ${getStationFullName(nextCode)} (Return)]` });
    }
  });

  // Combine forward + reverse into one full round-trip block
  const roundTripSegments = [...forwardSegments];

  let revCursor = lastArrGlobal;
  for (const leg of reverseLegs) {
    roundTripSegments.push({ start: revCursor, end: revCursor + leg.duration, label: leg.label });
    revCursor += leg.duration;
  }

  const roundTripDuration = Math.max(revCursor, oneWayDuration * 2);

  // --- Tile across 10080 minutes (168 hours) ---
  const fullTimeline = [];
  let baseOffset = 0;

  while (baseOffset < 10080) {
    for (const seg of roundTripSegments) {
      const absStart = seg.start + baseOffset;
      const absEnd   = seg.end   + baseOffset;
      if (absStart >= 10080) break;
      fullTimeline.push({ start: absStart, end: Math.min(absEnd, 10080), label: seg.label });
    }
    baseOffset += roundTripDuration;
  }

  fullTimeline.sort((a, b) => a.start - b.start);
  return fullTimeline;
}

// ---------------------------------------------------------------------------
// GET STATUS AT EXACT HOUR (60-minute window overlap)
// Priority: HALTED (5) > ARRIVED (4) > DEPARTED (3) > TRAVELLING (2)
// DEPARTED as a real-train-status is handled here only for timeline segments.
// The sim-clock cutoff DEPARTED is handled separately in getStatusForCell().
// ---------------------------------------------------------------------------
function getStatusFromTimeline(timeline, dayIdx, hour) {
  const winStart = dayIdx * 1440 + hour * 60;
  const winEnd   = winStart + 60;

  let best         = null;
  let bestPriority = -1;

  for (const seg of timeline) {
    // Overlap check: segment and window must share at least 1 minute
    if (seg.start <= winEnd && seg.end >= winStart) {
      let priority;
      if (seg.label.includes('HALTED'))      priority = 5;
      else if (seg.label.includes('ARRIVED')) priority = 4;
      else if (seg.label.includes('DEPARTED')) priority = 3;
      else if (seg.label.includes('TRAVELLING')) priority = 2;
      else priority = 1;

      if (priority > bestPriority) {
        best         = seg.label;
        bestPriority = priority;
      }
    }
  }

  if (best) return best;

  // No segment found in window — return next upcoming event
  for (const seg of timeline) {
    if (seg.start > winEnd) return seg.label;
  }

  return timeline.length > 0 ? timeline[timeline.length - 1].label : '[-]';
}

// ---------------------------------------------------------------------------
// TIMELINE CACHE (avoid rebuilding per render)
// ---------------------------------------------------------------------------
const _timelineCache = new Map();

function getCachedTimeline(train) {
  const key = train.number || train.id || train.name;
  if (!_timelineCache.has(key)) {
    _timelineCache.set(key, buildContinuousTimeline(train));
  }
  return _timelineCache.get(key);
}

// ---------------------------------------------------------------------------
// MAIN EXPORTED STATUS RESOLVER
// dayIdx: 0=MON … 6=SUN  (matches build_final_excel_v4.py convention)
// hour:   0–23
// simDate, journeyDate: Date objects from SimulationClockContext
//
// DEPARTED is ONLY returned when the time slot is PAST the current sim clock
// on a same-day journey. It is NOT part of the running-status vocabulary.
// ---------------------------------------------------------------------------
export function getStatusForCell(train, dayIdx, hour, simDate, journeyDate) {
  // 1. Same-day sim-clock cutoff: past hours → [DEPARTED – Booking Closed]
  const isSameDay = simDate && journeyDate &&
    simDate.getFullYear() === journeyDate.getFullYear() &&
    simDate.getMonth()    === journeyDate.getMonth()    &&
    simDate.getDate()     === journeyDate.getDate();

  if (isSameDay) {
    const simHour    = simDate.getHours();
    const simDayIdx  = ((simDate.getDay() + 6) % 7); // Mon=0 … Sun=6
    const globalSlot = dayIdx * 24 + hour;
    const globalNow  = simDayIdx * 24 + simHour;
    if (globalSlot < globalNow) {
      return { label: '[DEPARTED – Booking Closed]', status: 'DEPARTED', departed: true };
    }
  }

  // 2. Runs on this day?
  const dayNames = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
  const dayName  = dayNames[dayIdx] || 'MON';
  const runsOn   = train.runsOn || [];
  if (runsOn.length > 0 && !runsOn.includes('DAILY') && !runsOn.includes(dayName)) {
    return { label: '-', status: 'NOT_RUNNING', departed: false };
  }

  // 3. Get live running status from continuous bidirectional timeline
  const timeline = getCachedTimeline(train);
  const label    = getStatusFromTimeline(timeline, dayIdx, hour);

  let status = 'TRAVELLING';
  if (label.includes('HALTED'))       status = 'HALTED';
  else if (label.includes('ARRIVED')) status = 'ARRIVED';
  else if (label.includes('Return'))  status = 'RETURN';

  return { label, status, departed: false };
}

// ---------------------------------------------------------------------------
// GROUP TRAINS BY SERVICE NAME (for merged column headers — same as Excel)
// ---------------------------------------------------------------------------
export function groupTrainsByServiceName(trains) {
  const grouped = {};
  trains.forEach(t => {
    const name = t.name || 'EXPRESS';
    if (!grouped[name]) grouped[name] = { serviceName: name, trains: [] };
    grouped[name].trains.push(t);
  });
  return Object.values(grouped);
}

// ---------------------------------------------------------------------------
// LEGACY COMPAT: compute168HourCellStatus kept for any existing call-sites
// Delegates to getStatusForCell using journeyDate's day-of-week.
// ---------------------------------------------------------------------------
export function compute168HourCellStatus(train, _stationCode, hourOfWeek, simDate, journeyDate) {
  // Convert JS getDay() (0=Sun) to our Mon=0 convention
  const jsDow  = journeyDate ? journeyDate.getDay() : 1;
  const dayIdx = (jsDow + 6) % 7;   // Mon=0, Tue=1 … Sun=6
  const hour   = hourOfWeek % 24;

  return getStatusForCell(train, dayIdx, hour, simDate, journeyDate);
}
