/**
 * INTRICATE ML BOOKING DEMAND, ROUTE MATCHING & CITY-PAIR MATRIX ENGINE
 */

import cityPairMatrix from './city_pair_train_matrix.json';

export function getCityPairMatrixData() {
  return cityPairMatrix;
}

export function extractStationCode(stationStr) {
  if (!stationStr) return '';
  const parts = stationStr.split('-');
  return parts[0].trim().toUpperCase();
}

export function extractCityToken(stationStr) {
  if (!stationStr) return '';
  const parts = stationStr.split('-');
  if (parts.length > 1) {
    return parts[1].trim().toUpperCase();
  }
  return stationStr.trim().toUpperCase();
}

// DICTIONARY OF STATION CODES TO CITIES & ALIASES
const STATION_ALIAS_MAP = {
  'NDLS': ['NEW DELHI', 'DELHI', 'NDLS'],
  'ANVT': ['ANAND VIHAR', 'ANAND VIHAR TERMINAL', 'DELHI', 'ANVT'],
  'DEE': ['DELHI SARAI ROHILLA', 'DELHI', 'DEE'],
  'DLI': ['OLD DELHI', 'DELHI', 'DLI'],
  'PNBE': ['PATNA', 'PATNA JUNCTION', 'PNBE'],
  'PPTA': ['PATLIPUTRA', 'PATNA', 'PPTA'],
  'HWH': ['HOWRAH', 'HOWRAH JUNCTION', 'KOLKATA', 'HWH'],
  'SDAH': ['SEALDAH', 'KOLKATA', 'SDAH'],
  'MMCT': ['MUMBAI CENTRAL', 'MUMBAI', 'MMCT'],
  'CSMT': ['MUMBAI CSMT', 'CSMT', 'MUMBAI'],
  'BDTS': ['BANDRA TERMINAL', 'MUMBAI', 'BDTS'],
  'LKO': ['LUCKNOW', 'LUCKNOW CHARBAGH', 'LKO'],
  'LJN': ['LUCKNOW JUNCTION', 'LUCKNOW', 'LJN'],
  'BSB': ['VARANASI', 'VARANASI JUNCTION', 'BSB'],
  'CNB': ['KANPUR', 'KANPUR CENTRAL', 'CNB'],
  'PRYJ': ['PRAYAGRAJ', 'PRAYAGRAJ JUNCTION', 'PRYJ', 'ALLAHABAD'],
  'DDU': ['MUGHALSARAI', 'DEEN DAYAL UPADHYAYA', 'DDU'],
  'MB': ['MORADABAD', 'MB'],
  'KOTA': ['KOTA', 'KOTA JUNCTION'],
  'RTM': ['RATLAM', 'RTM'],
  'BRC': ['VADODARA', 'BRC'],
  'ST': ['SURAT', 'ST'],
  'PUNE': ['PUNE', 'PUNE JUNCTION'],
  'LNL': ['LONAVALA', 'LNL'],
  'DR': ['DADAR', 'DR'],
  'ADI': ['AHMEDABAD', 'ADI'],
  'MAS': ['CHENNAI', 'CHENNAI CENTRAL', 'MAS'],
  'SBC': ['BENGALURU', 'KSR BENGALURU', 'BANGALORE', 'SBC'],
  'HYB': ['HYDERABAD', 'DECCAN', 'HYB'],
  'SC': ['SECUNDERABAD', 'SC'],
  'BPL': ['BHOPAL', 'BPL'],
  'NGP': ['NAGPUR', 'NGP'],
  'GHY': ['GUWAHATI', 'GHY'],
  'DBRG': ['DIBRUGARH', 'DBRG'],
  'SVDK': ['KATRA', 'SHRI MATA VAISHNO DEVI KATRA', 'SVDK'],
  'JAT': ['JAMMU', 'JAMMU TAWI', 'JAT'],
  'LDH': ['LUDHIANA', 'LDH'],
  'UMB': ['AMBALA', 'AMBALA CANTT', 'UMB'],
  'AGC': ['AGRA', 'AGRA CANTT', 'AGC'],
  'VGLJ': ['JHANSI', 'V LAKSHMIBAI JHANSI', 'VGLJ'],
  'JP': ['JAIPUR', 'JP'],
  'MAO': ['GOA', 'MADGAON', 'MAO'],
  'TVC': ['TRIVANDRUM', 'TRIVANDRUM CENTRAL', 'TVC'],
  'MYS': ['MYSURU', 'MYS']
};

function normalizeStationQuery(rawStr) {
  if (!rawStr) return [];
  const clean = rawStr.toUpperCase().trim();
  const code = extractStationCode(clean);
  const city = extractCityToken(clean);

  const aliases = new Set([clean, code, city]);

  if (STATION_ALIAS_MAP[code]) {
    STATION_ALIAS_MAP[code].forEach(a => aliases.add(a));
  }

  // Reverse alias lookup
  Object.entries(STATION_ALIAS_MAP).forEach(([k, v]) => {
    if (v.some(alias => clean.includes(alias) || alias.includes(clean))) {
      aliases.add(k);
      v.forEach(a => aliases.add(a));
    }
  });

  return Array.from(aliases);
}

// 100% UNIVERSAL INTERMEDIATE STATION ROUTE MATCHING ENGINE
export function doesTrainCoverRoute(train, fromStationStr, toStationStr) {
  if (!train) return false;
  if (!fromStationStr || !toStationStr) return false;

  const fromTokens = normalizeStationQuery(fromStationStr);
  const toTokens = normalizeStationQuery(toStationStr);

  // Construct complete ordered station list for the train: [deptStation, ...routeStations, arrStation]
  const fullSequence = [
    train.deptStation,
    train.deptCity,
    ...(train.routeStations || []),
    train.arrStation,
    train.arrCity
  ].filter(Boolean).map(s => s.toUpperCase());

  // Expand fullSequence with aliases
  const expandedRoute = fullSequence.map(st => {
    const code = extractStationCode(st);
    const aliases = [st, code];
    if (STATION_ALIAS_MAP[code]) {
      aliases.push(...STATION_ALIAS_MAP[code]);
    }
    return aliases;
  });

  // Find index of origin boarding station anywhere along the route
  let boardingIdx = -1;
  for (let i = 0; i < expandedRoute.length; i++) {
    const stationAliases = expandedRoute[i];
    if (fromTokens.some(tok => stationAliases.some(alias => alias === tok || alias.includes(tok) || tok.includes(alias)))) {
      boardingIdx = i;
      break;
    }
  }

  if (boardingIdx === -1) return false;

  // Find index of destination deboarding station AFTER boardingIdx
  let deboardingIdx = -1;
  for (let j = boardingIdx + 1; j < expandedRoute.length; j++) {
    const stationAliases = expandedRoute[j];
    if (toTokens.some(tok => stationAliases.some(alias => alias === tok || alias.includes(tok) || tok.includes(alias)))) {
      deboardingIdx = j;
      break;
    }
  }

  return deboardingIdx > boardingIdx;
}

const FESTIVAL_CALENDAR_VECTORS = [
  { name: 'Diwali / Chhath Puja Peak', month: 10, startDay: 15, endDay: 30, multiplier: 8.5 },
  { name: 'Durga Puja / Navratri', month: 9, startDay: 1, endDay: 15, multiplier: 6.0 },
  { name: 'Holi Festival Rush', month: 2, startDay: 15, endDay: 28, multiplier: 5.0 },
  { name: 'Christmas & New Year Vacation', month: 11, startDay: 20, endDay: 31, multiplier: 4.5 },
  { name: 'Summer School Holidays', month: 4, startDay: 15, endDay: 31, multiplier: 2.5 }
];

export function calculateARPSCurveFactor(daysToDeparture) {
  if (daysToDeparture < 0) return 1.0;
  if (daysToDeparture > 60) return 0.05;

  const normTime = (60 - daysToDeparture) / 60;
  const k = 6.0;
  const x0 = 0.65;
  const sCurveValue = 1 / (1 + Math.exp(-k * (normTime - x0)));
  
  return parseFloat(sCurveValue.toFixed(4));
}

export function getFestivalMultiplier(journeyDateObj) {
  if (!journeyDateObj) return { active: false, name: 'Normal Traffic', multiplier: 1.0 };
  const month = journeyDateObj.getMonth();
  const day = journeyDateObj.getDate();

  for (const f of FESTIVAL_CALENDAR_VECTORS) {
    if (f.month === month && day >= f.startDay && day <= f.endDay) {
      return { active: true, name: f.name, multiplier: f.multiplier };
    }
  }

  return { active: false, name: 'Normal Traffic', multiplier: 1.0 };
}

// REAL TATKAL QUOTA TIME-GATE & CONCURRENCY ENGINE
export function evaluateTatkalQuotaStatus({ simDate, daysToDeparture, isAcClass, basePrice }) {
  if (daysToDeparture > 1) {
    return { open: false, reason: 'TATKAL OPENS 1 DAY BEFORE JOURNEY (10:00 AM)', seats: 0, price: basePrice + 350 };
  }

  const simHour = simDate.getHours();
  const simMin = simDate.getMinutes();

  const openHour = isAcClass ? 10 : 11;
  const isAfterOpening = (simHour > openHour) || (simHour === openHour && simMin >= 0);

  if (!isAfterOpening) {
    return { open: false, reason: `TATKAL OPENS AT ${openHour}:00 AM`, seats: 0, price: basePrice + 350 };
  }

  const minsElapsed = (simHour - openHour) * 60 + simMin;
  const initialTatkalQuota = 90;
  const tatkalBooked = Math.min(initialTatkalQuota, Math.floor(minsElapsed * 45));
  const tatkalAvail = initialTatkalQuota - tatkalBooked;

  const surcharge = Math.min(500, Math.max(150, Math.round(basePrice * 0.30)));

  return {
    open: true,
    reason: tatkalAvail > 0 ? `TATKAL AVAILABLE - ${tatkalAvail.toString().padStart(4, '0')}` : `TATKAL WL ${Math.abs(tatkalAvail) + 1}`,
    seats: Math.max(0, tatkalAvail),
    status: tatkalAvail > 0 ? `TATKAL AVAILABLE - ${tatkalAvail.toString().padStart(4, '0')}` : `TATKAL WL ${Math.abs(tatkalAvail) + 1}`,
    price: basePrice + surcharge,
    surcharge
  };
}

// MAIN ML DEMAND PREDICTOR INTEGRATED WITH CITY-PAIR CORRIDORS
export function predictDynamicDemandAndSurge({ trainCategory, classCode, totalCapacity, daysToDeparture, journeyDateObj, basePrice, corridorDensity, quota, simDate }) {
  if (quota === 'TATKAL') {
    const isAc = ['3A', '2A', '1A', 'CC', 'EC'].includes(classCode);
    const tatkalEval = evaluateTatkalQuotaStatus({ simDate, daysToDeparture, isAcClass: isAc, basePrice });
    
    return {
      totalCapacity: 90,
      seatsBooked: 90 - tatkalEval.seats,
      availableSeats: tatkalEval.seats,
      waitlistCount: tatkalEval.seats <= 0 ? 12 : 0,
      status: tatkalEval.reason,
      cnfChance: tatkalEval.seats > 0 ? 'CNF 100%' : 'Low Chance',
      arpFactor: 1.0,
      festivalInfo: { active: false, name: 'Tatkal Quota', multiplier: 1.0 },
      basePrice,
      surgedPrice: tatkalEval.price,
      surgeMultiplier: 1.0,
      partyDistribution: { soloPercent: 80, familyPercent: 20 }
    };
  }

  const arpFactor = calculateARPSCurveFactor(daysToDeparture);
  const festInfo = getFestivalMultiplier(journeyDateObj);
  const density = corridorDensity || 2.5;

  let categoryCoeff = 1.0;
  if (trainCategory === 'VANDE BHARAT') categoryCoeff = 1.8;
  else if (trainCategory === 'RAJDHANI' || trainCategory === 'DURONTO' || trainCategory === 'PREMIUM EXPRESS') categoryCoeff = 1.5;
  else if (trainCategory === 'SHATABDI') categoryCoeff = 1.4;
  else if (trainCategory === 'SUPERFAST') categoryCoeff = 1.2;

  let classCoeff = 1.0;
  if (classCode === '3A' || classCode === 'SL') classCoeff = 1.4;
  else if (classCode === '2A' || classCode === 'CC') classCoeff = 1.1;
  else if (classCode === '1A' || classCode === 'EC') classCoeff = 0.85;

  const rawFillFraction = arpFactor * festInfo.multiplier * categoryCoeff * classCoeff * (density / 2.5) * 0.75;
  const boundedFillFraction = Math.min(2.50, Math.max(0.05, rawFillFraction));

  const seatsBooked = Math.floor(boundedFillFraction * (totalCapacity || 500));
  const netAvail = (totalCapacity || 500) - seatsBooked;

  let statusStr = '';
  let cnfStr = '';
  let colorStr = '#3aa459';

  if (netAvail > 0) {
    statusStr = `AVAILABLE - ${netAvail.toString().padStart(4, '0')}`;
    cnfStr = 'CNF 100% High Chance';
    colorStr = '#3aa459';
  } else {
    const wlNumber = Math.abs(netAvail) + 1;
    statusStr = `WL ${wlNumber}`;
    cnfStr = wlNumber <= 30 ? 'CNF 75% Medium' : 'Low Chance (High Demand)';
    colorStr = wlNumber <= 30 ? '#d97706' : '#dc2626';
  }

  let surgeMultiplier = 1.0;
  if (trainCategory === 'RAJDHANI' || trainCategory === 'SHATABDI' || trainCategory === 'DURONTO' || trainCategory === 'PREMIUM EXPRESS') {
    const occupancyPercent = Math.min(1.0, seatsBooked / (totalCapacity || 500));
    const surgeSteps = Math.floor(occupancyPercent / 0.10);
    surgeMultiplier = 1.0 + Math.min(0.50, surgeSteps * 0.10);
  }

  const surgedPrice = Math.round(basePrice * surgeMultiplier);

  return {
    totalCapacity: totalCapacity || 500,
    seatsBooked,
    availableSeats: netAvail > 0 ? netAvail : 0,
    waitlistCount: netAvail <= 0 ? Math.abs(netAvail) + 1 : 0,
    status: statusStr,
    cnfChance: cnfStr,
    color: colorStr,
    arpFactor,
    festivalInfo: festInfo,
    basePrice,
    surgedPrice,
    surgeMultiplier: parseFloat(surgeMultiplier.toFixed(2)),
    partyDistribution: { soloPercent: 30, familyPercent: 70 }
  };
}
