// NORTHERN & DELHI-CENTRIC REAL TRAIN TIMETABLES
// Authentic stoppage sequences, arrival/departure, distance, day index & running days frequency

export const NORTHERN_TRAINS = [
  {
    number: '12951',
    name: 'MUMBAI RAJDHANI EXPRESS',
    category: 'PREMIUM RAJDHANI',
    runsOn: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'],
    origin: 'NDLS',
    destination: 'MMCT',
    deptTime: '16:55',
    arrTime: '08:35',
    stoppages: [
      { seq: 1, code: 'NDLS', name: 'New Delhi', arr: 'Source', dept: '16:55', day: 1, distKm: 0 },
      { seq: 2, code: 'KOTA', name: 'Kota Junction', arr: '21:40', dept: '21:50', day: 1, distKm: 465 },
      { seq: 3, code: 'BRC', name: 'Vadodara Junction', arr: '04:10', dept: '04:20', day: 2, distKm: 992 },
      { seq: 4, code: 'ST', name: 'Surat', arr: '05:55', dept: '06:00', day: 2, distKm: 1122 },
      { seq: 5, code: 'MMCT', name: 'Mumbai Central', arr: '08:35', dept: 'Destination', day: 2, distKm: 1384 }
    ]
  },
  {
    number: '22436',
    name: 'VANDE BHARAT EXPRESS',
    category: 'PREMIUM SEMI-HIGH SPEED',
    runsOn: ['MON', 'TUE', 'WED', 'FRI', 'SAT', 'SUN'],
    origin: 'NDLS',
    destination: 'BSB',
    deptTime: '06:00',
    arrTime: '14:00',
    stoppages: [
      { seq: 1, code: 'NDLS', name: 'New Delhi', arr: 'Source', dept: '06:00', day: 1, distKm: 0 },
      { seq: 2, code: 'CNB', name: 'Kanpur Central', arr: '10:08', dept: '10:10', day: 1, distKm: 440 },
      { seq: 3, code: 'PRYJ', name: 'Prayagraj Junction', arr: '12:08', dept: '12:10', day: 1, distKm: 635 },
      { seq: 4, code: 'BSB', name: 'Varanasi Junction', arr: '14:00', dept: 'Destination', day: 1, distKm: 759 }
    ]
  },
  {
    number: '12425',
    name: 'JAMMU RAJDHANI EXPRESS',
    category: 'PREMIUM RAJDHANI',
    runsOn: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'],
    origin: 'NDLS',
    destination: 'JAT',
    deptTime: '20:40',
    arrTime: '05:00',
    stoppages: [
      { seq: 1, code: 'NDLS', name: 'New Delhi', arr: 'Source', dept: '20:40', day: 1, distKm: 0 },
      { seq: 2, code: 'CDG', name: 'Chandigarh', arr: '23:55', dept: '00:05', day: 1, distKm: 266 },
      { seq: 3, code: 'JAT', name: 'Jammu Tawi', arr: '05:00', dept: 'Destination', day: 2, distKm: 577 }
    ]
  },
  {
    number: '22439',
    name: 'KATRA VANDE BHARAT EXPRESS',
    category: 'PREMIUM SEMI-HIGH SPEED',
    runsOn: ['MON', 'TUE', 'THU', 'FRI', 'SAT', 'SUN'],
    origin: 'NDLS',
    destination: 'SVDK',
    deptTime: '06:00',
    arrTime: '14:00',
    stoppages: [
      { seq: 1, code: 'NDLS', name: 'New Delhi', arr: 'Source', dept: '06:00', day: 1, distKm: 0 },
      { seq: 2, code: 'CDG', name: 'Chandigarh', arr: '08:40', dept: '08:42', day: 1, distKm: 266 },
      { seq: 3, code: 'JAT', name: 'Jammu Tawi', arr: '12:38', dept: '12:40', day: 1, distKm: 577 },
      { seq: 4, code: 'SVDK', name: 'SMVD Katra', arr: '14:00', dept: 'Destination', day: 1, distKm: 655 }
    ]
  },
  {
    number: '12002',
    name: 'BHOPAL SHATABDI EXPRESS',
    category: 'SHATABDI',
    runsOn: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'],
    origin: 'NDLS',
    destination: 'BPL',
    deptTime: '06:00',
    arrTime: '14:05',
    stoppages: [
      { seq: 1, code: 'NDLS', name: 'New Delhi', arr: 'Source', dept: '06:00', day: 1, distKm: 0 },
      { seq: 2, code: 'GWL', name: 'Gwalior Junction', arr: '09:23', dept: '09:28', day: 1, distKm: 313 },
      { seq: 3, code: 'VGLJ', name: 'VGL Jhansi Junction', arr: '10:45', dept: '10:50', day: 1, distKm: 411 },
      { seq: 4, code: 'BPL', name: 'Bhopal Junction', arr: '14:05', dept: 'Destination', day: 1, distKm: 703 }
    ]
  }
];
