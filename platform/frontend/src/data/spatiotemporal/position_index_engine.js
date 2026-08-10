// SPATIOTEMPORAL SCHEDULE INDEX ENGINE
// Combines regional train modules into one unified 168-hour master position table

import { SELECTABLE_STATIONS, SELECTABLE_STATION_CODES } from './stations_index.js';
import { NORTHERN_TRAINS } from './schedules/northern_trains.js';
import { WESTERN_TRAINS } from './schedules/western_trains.js';
import { EASTERN_TRAINS } from './schedules/eastern_trains.js';
import { SOUTHERN_TRAINS } from './schedules/southern_trains.js';
import { CENTRAL_TRAINS } from './schedules/central_trains.js';
import { computeTrainKineticState } from './kinetic_state_calculator.js';

// UNIFIED MASTER TIMETABLE IN MEMORY (Stitches modular schedule files into one seamless master array)
export const MASTER_SPATIOTEMPORAL_TABLE = [
  ...NORTHERN_TRAINS,
  ...WESTERN_TRAINS,
  ...EASTERN_TRAINS,
  ...SOUTHERN_TRAINS,
  ...CENTRAL_TRAINS
];

// FILTERING RULE: Include train ONLY if >= 2 of our 57 selectable stations appear in its stoppages
export const FILTERED_VALID_TRAINS = MASTER_SPATIOTEMPORAL_TABLE.filter(train => {
  const matchCount = train.stoppages.filter(st => SELECTABLE_STATION_CODES.includes(st.code)).length;
  return matchCount >= 2;
});

export function extractStationCode(input) {
  if (!input) return '';
  if (typeof input === 'object' && input.code) return input.code.trim().toUpperCase();
  if (typeof input === 'string') {
    const parts = input.split('-');
    if (parts.length > 1) return parts[0].trim().toUpperCase();
    return input.trim().toUpperCase();
  }
  return String(input).trim().toUpperCase();
}

// SEQUENTIAL STOPPING RULE (Fixes Bug 6): Checks if train covers Station A ➔ Station B in correct order
export function doesTrainCoverRoute(train, fromInput, toInput) {
  if (!train || !train.stoppages || !fromInput || !toInput) return false;

  const targetFrom = extractStationCode(fromInput);
  const targetTo = extractStationCode(toInput);

  let fromIndex = -1;
  let toIndex = -1;

  for (let i = 0; i < train.stoppages.length; i++) {
    const code = extractStationCode(train.stoppages[i].code);
    if (code === targetFrom && fromIndex === -1) fromIndex = i;
    if (code === targetTo && fromIndex !== -1 && i > fromIndex) {
      toIndex = i;
      break;
    }
  }

  return fromIndex !== -1 && toIndex !== -1 && fromIndex < toIndex;
}

// QUERY TRAINS FOR ROUTE: Returns all valid trains covering fromStation ➔ toStation
export function getTrainsForRoute(fromCode, toCode) {
  return FILTERED_VALID_TRAINS.filter(train => doesTrainCoverRoute(train, fromCode, toCode));
}

// 168-HOUR SPATIOTEMPORAL INDEX BUILDER (Wall-Clock Frame: 7 Days x 24 Hours = 168 Rows)
export function build168HourSpatiotemporalIndex() {
  const index = {};

  for (let hour = 1; hour <= 168; hour++) {
    index[`hour_${hour}`] = {};

    FILTERED_VALID_TRAINS.forEach(train => {
      // Create instance entries for active running days
      const daysMap = { 'MON': 0, 'TUE': 24, 'WED': 48, 'THU': 72, 'FRI': 96, 'SAT': 120, 'SUN': 144 };

      train.runsOn.forEach(dayName => {
        const startHour = daysMap[dayName];
        if (startHour !== undefined) {
          const instanceKey = `${train.number}_${dayName}`;
          index[`hour_${hour}`][instanceKey] = computeTrainKineticState(train, startHour, hour);
        }
      });
    });
  }

  return index;
}

// LAZY-LOADED 168-HOUR LOOKUP CACHE
export const SPATIOTEMPORAL_POSITION_INDEX = build168HourSpatiotemporalIndex();
