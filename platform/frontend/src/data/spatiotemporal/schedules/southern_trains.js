// SOUTHERN & CHENNAI/BENGALURU/KERALA REAL TRAIN TIMETABLES
// Authentic stoppage sequences, arrival/departure, distance, day index & running days frequency

export const SOUTHERN_TRAINS = [
  {
    number: '12625',
    name: 'KERALA EXPRESS',
    category: 'SUPERFAST',
    runsOn: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'],
    origin: 'TVC',
    destination: 'NDLS',
    deptTime: '12:30',
    arrTime: '13:40',
    stoppages: [
      { seq: 1, code: 'TVC', name: 'Thiruvananthapuram Central', arr: 'Source', dept: '12:30', day: 1, distKm: 0 },
      { seq: 2, code: 'ERS', name: 'Ernakulam Junction', arr: '16:55', dept: '17:00', day: 1, distKm: 206 },
      { seq: 3, code: 'CBE', name: 'Coimbatore Junction', arr: '20:57', dept: '21:00', day: 1, distKm: 411 },
      { seq: 4, code: 'BZA', name: 'Vijayawada Junction', arr: '10:25', dept: '10:35', day: 2, distKm: 1205 },
      { seq: 5, code: 'NGP', name: 'Nagpur Junction', arr: '21:10', dept: '21:15', day: 2, distKm: 1870 },
      { seq: 6, code: 'BPL', name: 'Bhopal Junction', arr: '03:45', dept: '03:50', day: 3, distKm: 2260 },
      { seq: 7, code: 'VGLJ', name: 'VGL Jhansi Junction', arr: '07:20', dept: '07:28', day: 3, distKm: 2552 },
      { seq: 8, code: 'NDLS', name: 'New Delhi', arr: '13:40', dept: 'Destination', day: 3, distKm: 2963 }
    ]
  },
  {
    number: '12621',
    name: 'TAMIL NADU EXPRESS',
    category: 'SUPERFAST',
    runsOn: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'],
    origin: 'MAS',
    destination: 'NDLS',
    deptTime: '22:00',
    arrTime: '06:30',
    stoppages: [
      { seq: 1, code: 'MAS', name: 'Chennai Central', arr: 'Source', dept: '22:00', day: 1, distKm: 0 },
      { seq: 2, code: 'BZA', name: 'Vijayawada Junction', arr: '03:55', dept: '04:05', day: 2, distKm: 431 },
      { seq: 3, code: 'NGP', name: 'Nagpur Junction', arr: '13:50', dept: '13:55', day: 2, distKm: 1096 },
      { seq: 4, code: 'BPL', name: 'Bhopal Junction', arr: '20:10', dept: '20:20', day: 2, distKm: 1486 },
      { seq: 5, code: 'NDLS', name: 'New Delhi', arr: '06:30', dept: 'Destination', day: 3, distKm: 2189 }
    ]
  },
  {
    number: '12639',
    name: 'BRINDAVAN EXPRESS',
    category: 'SUPERFAST',
    runsOn: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'],
    origin: 'MAS',
    destination: 'SBC',
    deptTime: '07:40',
    arrTime: '13:40',
    stoppages: [
      { seq: 1, code: 'MAS', name: 'Chennai Central', arr: 'Source', dept: '07:40', day: 1, distKm: 0 },
      { seq: 2, code: 'SBC', name: 'KSR Bengaluru', arr: '13:40', dept: 'Destination', day: 1, distKm: 359 }
    ]
  },
  {
    number: '12431',
    name: 'TRIVANDRUM RAJDHANI',
    category: 'PREMIUM RAJDHANI',
    runsOn: ['TUE', 'THU', 'FRI'],
    origin: 'TVC',
    destination: 'NZM',
    deptTime: '19:15',
    arrTime: '12:40',
    stoppages: [
      { seq: 1, code: 'TVC', name: 'Thiruvananthapuram Central', arr: 'Source', dept: '19:15', day: 1, distKm: 0 },
      { seq: 2, code: 'ERS', name: 'Ernakulam Junction', arr: '23:20', dept: '23:25', day: 1, distKm: 206 },
      { seq: 3, code: 'MAO', name: 'Madgaon Junction', arr: '11:00', dept: '11:10', day: 2, distKm: 996 },
      { seq: 4, code: 'ST', name: 'Surat', arr: '22:15', dept: '22:18', day: 2, distKm: 1756 },
      { seq: 5, code: 'NZM', name: 'Hazrat Nizamuddin', arr: '12:40', dept: 'Destination', day: 3, distKm: 2848 }
    ]
  }
];
