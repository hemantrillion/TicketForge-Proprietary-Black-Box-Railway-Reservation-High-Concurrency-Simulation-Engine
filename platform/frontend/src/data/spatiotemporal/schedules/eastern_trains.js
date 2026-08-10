// EASTERN & KOLKATA/PATNA/GUWAHATI REAL TRAIN TIMETABLES
// Authentic stoppage sequences, arrival/departure, distance, day index & running days frequency

export const EASTERN_TRAINS = [
  {
    number: '12301',
    name: 'HOWRAH RAJDHANI EXPRESS',
    category: 'PREMIUM RAJDHANI',
    runsOn: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'],
    origin: 'HWH',
    destination: 'NDLS',
    deptTime: '16:50',
    arrTime: '10:05',
    stoppages: [
      { seq: 1, code: 'HWH', name: 'Howrah Junction', arr: 'Source', dept: '16:50', day: 1, distKm: 0 },
      { seq: 2, code: 'PNBE', name: 'Patna Junction', arr: '22:30', dept: '22:40', day: 1, distKm: 532 },
      { seq: 3, code: 'CNB', name: 'Kanpur Central', arr: '04:45', dept: '04:50', day: 2, distKm: 1017 },
      { seq: 4, code: 'NDLS', name: 'New Delhi', arr: '10:05', dept: 'Destination', day: 2, distKm: 1451 }
    ]
  },
  {
    number: '12313',
    name: 'SEALDAH RAJDHANI EXPRESS',
    category: 'PREMIUM RAJDHANI',
    runsOn: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'],
    origin: 'SDAH',
    destination: 'NDLS',
    deptTime: '16:50',
    arrTime: '10:50',
    stoppages: [
      { seq: 1, code: 'SDAH', name: 'Sealdah', arr: 'Source', dept: '16:50', day: 1, distKm: 0 },
      { seq: 2, code: 'CNB', name: 'Kanpur Central', arr: '05:20', dept: '05:25', day: 2, distKm: 1019 },
      { seq: 3, code: 'NDLS', name: 'New Delhi', arr: '10:50', dept: 'Destination', day: 2, distKm: 1453 }
    ]
  },
  {
    number: '12303',
    name: 'POORVA EXPRESS',
    category: 'SUPERFAST',
    runsOn: ['MON', 'TUE', 'FRI', 'SAT'],
    origin: 'HWH',
    destination: 'NDLS',
    deptTime: '08:00',
    arrTime: '06:00',
    stoppages: [
      { seq: 1, code: 'HWH', name: 'Howrah Junction', arr: 'Source', dept: '08:00', day: 1, distKm: 0 },
      { seq: 2, code: 'PNBE', name: 'Patna Junction', arr: '16:00', dept: '16:10', day: 1, distKm: 532 },
      { seq: 3, code: 'BSB', name: 'Varanasi Junction', arr: '21:40', dept: '21:50', day: 1, distKm: 743 },
      { seq: 4, code: 'CNB', name: 'Kanpur Central', arr: '01:50', dept: '01:55', day: 2, distKm: 1045 },
      { seq: 5, code: 'NDLS', name: 'New Delhi', arr: '06:00', dept: 'Destination', day: 2, distKm: 1480 }
    ]
  },
  {
    number: '12345',
    name: 'SARAIGHAT EXPRESS',
    category: 'SUPERFAST',
    runsOn: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'],
    origin: 'HWH',
    destination: 'GHY',
    deptTime: '15:50',
    arrTime: '10:05',
    stoppages: [
      { seq: 1, code: 'HWH', name: 'Howrah Junction', arr: 'Source', dept: '15:50', day: 1, distKm: 0 },
      { seq: 2, code: 'GHY', name: 'Guwahati', arr: '10:05', dept: 'Destination', day: 2, distKm: 998 }
    ]
  }
];
