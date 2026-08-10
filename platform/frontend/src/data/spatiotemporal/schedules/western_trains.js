// WESTERN & MUMBAI-CENTRIC REAL TRAIN TIMETABLES
// Authentic stoppage sequences, arrival/departure, distance, day index & running days frequency

export const WESTERN_TRAINS = [
  {
    number: '12953',
    name: 'AUGUST KRANTI RAJDHANI',
    category: 'PREMIUM RAJDHANI',
    runsOn: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'],
    origin: 'MMCT',
    destination: 'NZM',
    deptTime: '17:10',
    arrTime: '09:43',
    stoppages: [
      { seq: 1, code: 'MMCT', name: 'Mumbai Central', arr: 'Source', dept: '17:10', day: 1, distKm: 0 },
      { seq: 2, code: 'ST', name: 'Surat', arr: '19:53', dept: '19:58', day: 1, distKm: 263 },
      { seq: 3, code: 'BRC', name: 'Vadodara Junction', arr: '21:34', dept: '21:44', day: 1, distKm: 393 },
      { seq: 4, code: 'KOTA', name: 'Kota Junction', arr: '04:05', dept: '04:15', day: 2, distKm: 920 },
      { seq: 5, code: 'NZM', name: 'Hazrat Nizamuddin', arr: '09:43', dept: 'Destination', day: 2, distKm: 1377 }
    ]
  },
  {
    number: '22209',
    name: 'MUMBAI DURONTO EXPRESS',
    category: 'DURONTO',
    runsOn: ['MON', 'WED', 'SAT'],
    origin: 'MMCT',
    destination: 'NDLS',
    deptTime: '23:10',
    arrTime: '15:55',
    stoppages: [
      { seq: 1, code: 'MMCT', name: 'Mumbai Central', arr: 'Source', dept: '23:10', day: 1, distKm: 0 },
      { seq: 2, code: 'BRC', name: 'Vadodara Junction', arr: '03:24', dept: '03:34', day: 2, distKm: 393 },
      { seq: 3, code: 'KOTA', name: 'Kota Junction', arr: '10:00', dept: '10:05', day: 2, distKm: 920 },
      { seq: 4, code: 'NDLS', name: 'New Delhi', arr: '15:55', dept: 'Destination', day: 2, distKm: 1384 }
    ]
  },
  {
    number: '12933',
    name: 'KARNAVATI EXPRESS',
    category: 'SUPERFAST',
    runsOn: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'],
    origin: 'MMCT',
    destination: 'ADI',
    deptTime: '14:05',
    arrTime: '21:25',
    stoppages: [
      { seq: 1, code: 'MMCT', name: 'Mumbai Central', arr: 'Source', dept: '14:05', day: 1, distKm: 0 },
      { seq: 2, code: 'ST', name: 'Surat', arr: '17:17', dept: '17:22', day: 1, distKm: 263 },
      { seq: 3, code: 'BRC', name: 'Vadodara Junction', arr: '18:57', dept: '19:02', day: 1, distKm: 393 },
      { seq: 4, code: 'ADI', name: 'Ahmedabad Junction', arr: '21:25', dept: 'Destination', day: 1, distKm: 493 }
    ]
  },
  {
    number: '12009',
    name: 'SHATABDI EXPRESS',
    category: 'SHATABDI',
    runsOn: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'],
    origin: 'MMCT',
    destination: 'ADI',
    deptTime: '06:10',
    arrTime: '12:40',
    stoppages: [
      { seq: 1, code: 'MMCT', name: 'Mumbai Central', arr: 'Source', dept: '06:10', day: 1, distKm: 0 },
      { seq: 2, code: 'ST', name: 'Surat', arr: '09:00', dept: '09:03', day: 1, distKm: 263 },
      { seq: 3, code: 'BRC', name: 'Vadodara Junction', arr: '10:35', dept: '10:40', day: 1, distKm: 393 },
      { seq: 4, code: 'ADI', name: 'Ahmedabad Junction', arr: '12:40', dept: 'Destination', day: 1, distKm: 493 }
    ]
  }
];
