// CENTRAL & MP/PUNE/HYDERABAD REAL TRAIN TIMETABLES
// Authentic stoppage sequences, arrival/departure, distance, day index & running days frequency

export const CENTRAL_TRAINS = [
  {
    number: '12123',
    name: 'DECCAN QUEEN',
    category: 'SUPERFAST',
    runsOn: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'],
    origin: 'CSMT',
    destination: 'PUNE',
    deptTime: '17:10',
    arrTime: '20:25',
    stoppages: [
      { seq: 1, code: 'CSMT', name: 'Mumbai CSMT', arr: 'Source', dept: '17:10', day: 1, distKm: 0 },
      { seq: 2, code: 'PUNE', name: 'Pune Junction', arr: '20:25', dept: 'Destination', day: 1, distKm: 192 }
    ]
  },
  {
    number: '12723',
    name: 'TELANGANA EXPRESS',
    category: 'SUPERFAST',
    runsOn: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'],
    origin: 'HYB',
    destination: 'NDLS',
    deptTime: '06:00',
    arrTime: '07:40',
    stoppages: [
      { seq: 1, code: 'HYB', name: 'Hyderabad Deccan', arr: 'Source', dept: '06:00', day: 1, distKm: 0 },
      { seq: 2, code: 'SC', name: 'Secunderabad Junction', arr: '06:20', dept: '06:25', day: 1, distKm: 10 },
      { seq: 3, code: 'NGP', name: 'Nagpur Junction', arr: '15:20', dept: '15:25', day: 1, distKm: 585 },
      { seq: 4, code: 'BPL', name: 'Bhopal Junction', arr: '21:45', dept: '21:55', day: 1, distKm: 975 },
      { seq: 5, code: 'VGLJ', name: 'VGL Jhansi Junction', arr: '01:45', dept: '01:53', day: 2, distKm: 1267 },
      { seq: 6, code: 'NDLS', name: 'New Delhi', arr: '07:40', dept: 'Destination', day: 2, distKm: 1677 }
    ]
  },
  {
    number: '12137',
    name: 'PUNJAB MAIL',
    category: 'SUPERFAST',
    runsOn: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'],
    origin: 'CSMT',
    destination: 'FZR',
    deptTime: '19:35',
    arrTime: '05:10',
    stoppages: [
      { seq: 1, code: 'CSMT', name: 'Mumbai CSMT', arr: 'Source', dept: '19:35', day: 1, distKm: 0 },
      { seq: 2, code: 'BPL', name: 'Bhopal Junction', arr: '09:50', dept: '09:55', day: 2, distKm: 837 },
      { seq: 3, code: 'VGLJ', name: 'VGL Jhansi Junction', arr: '14:00', dept: '14:08', day: 2, distKm: 1129 },
      { seq: 4, code: 'NDLS', name: 'New Delhi', arr: '21:25', dept: '21:40', day: 2, distKm: 1539 },
      { seq: 5, code: 'FZR', name: 'Firozpur Cantt', arr: '05:10', dept: 'Destination', day: 3, distKm: 1924 }
    ]
  }
];
