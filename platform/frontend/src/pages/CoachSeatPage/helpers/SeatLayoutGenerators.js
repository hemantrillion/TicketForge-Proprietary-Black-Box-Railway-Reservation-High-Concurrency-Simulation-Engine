// GENERATE VANDE BHARAT CC CHAIR CAR (78 SEATS - 3x2 SEATING LAYOUT)
export const GENERATE_VANDE_BHARAT_CC = (trainId, coachId, simHoursElapsed) => {
  const seedString = `${trainId || '22436'}-${coachId || 'C1'}`;
  let seed = 0;
  for (let i = 0; i < seedString.length; i++) {
    seed = (seed << 5) - seed + seedString.charCodeAt(i);
    seed |= 0;
  }
  const pseudoRandom = (offset) => Math.abs(Math.sin(seed + offset));

  const initialOccupiedSet = new Set();
  for (let s = 1; s <= 78; s++) {
    const isWindow = (s % 5 === 1 || s % 5 === 0);
    const threshold = isWindow ? 0.35 : 0.65;
    if (pseudoRandom(s) > threshold) {
      initialOccupiedSet.add(s);
    }
  }

  const rows = [];
  for (let r = 0; r < 15; r++) {
    const start = r * 5;
    rows.push({
      rowNum: r + 1,
      leftTriple: [
        { id: start + 1, num: start + 1, type: 'Window', isOccupied: initialOccupiedSet.has(start + 1) },
        { id: start + 2, num: start + 2, type: 'Middle', isOccupied: initialOccupiedSet.has(start + 2) },
        { id: start + 3, num: start + 3, type: 'Aisle', isOccupied: initialOccupiedSet.has(start + 3) }
      ],
      rightDouble: [
        { id: start + 4, num: start + 4, type: 'Aisle', isOccupied: initialOccupiedSet.has(start + 4) },
        { id: start + 5, num: start + 5, type: 'Window', isOccupied: initialOccupiedSet.has(start + 5) }
      ]
    });
  }
  return rows;
};

// GENERATE DYNAMIC OCCUPANCY FOR 3A / SL (72 BERTHS - 9 BAYS OF 8 BERTHS) WITH LADIES QUOTA
export const GENERATE_DYNAMIC_3A_BAYS = (trainId, coachId, simHoursElapsed) => {
  const seedString = `${trainId || '12951'}-${coachId || 'B1'}`;
  let seed = 0;
  for (let i = 0; i < seedString.length; i++) {
    seed = (seed << 5) - seed + seedString.charCodeAt(i);
    seed |= 0;
  }
  const pseudoRandom = (offset) => Math.abs(Math.sin(seed + offset));

  const initialOccupiedSet = new Set();
  for (let s = 1; s <= 72; s++) {
    if (pseudoRandom(s) > 0.65) {
      initialOccupiedSet.add(s);
    }
  }

  const dynamicBookingsCount = Math.floor(simHoursElapsed * 1.5);
  for (let step = 1; step <= dynamicBookingsCount; step++) {
    const seatToOccupy = Math.floor(pseudoRandom(step * 7) * 72) + 1;
    initialOccupiedSet.add(seatToOccupy);
  }

  const bays = [];
  for (let b = 0; b < 9; b++) {
    const start = b * 8;
    const isLadiesBay = b === 0;

    bays.push({
      bayNum: b + 1,
      isLadiesBay,
      mainLeft: [
        { id: start + 1, num: start + 1, type: 'LB', isOccupied: initialOccupiedSet.has(start + 1), isLadies: isLadiesBay },
        { id: start + 2, num: start + 2, type: 'MB', isOccupied: initialOccupiedSet.has(start + 2), isLadies: isLadiesBay },
        { id: start + 3, num: start + 3, type: 'UB', isOccupied: initialOccupiedSet.has(start + 3), isLadies: isLadiesBay }
      ],
      mainRight: [
        { id: start + 4, num: start + 4, type: 'LB', isOccupied: initialOccupiedSet.has(start + 4), isLadies: isLadiesBay },
        { id: start + 5, num: start + 5, type: 'MB', isOccupied: initialOccupiedSet.has(start + 5), isLadies: isLadiesBay },
        { id: start + 6, num: start + 6, type: 'UB', isOccupied: initialOccupiedSet.has(start + 6), isLadies: isLadiesBay }
      ],
      sideCorridor: [
        { id: start + 7, num: start + 7, type: 'SL', isOccupied: initialOccupiedSet.has(start + 7), isLadies: false },
        { id: start + 8, num: start + 8, type: 'SU', isOccupied: initialOccupiedSet.has(start + 8), isLadies: false }
      ]
    });
  }
  return bays;
};

// GENERATE DYNAMIC OCCUPANCY FOR 2A (54 BERTHS - 9 BAYS OF 6 BERTHS)
export const GENERATE_DYNAMIC_2A_BAYS = (trainId, coachId, simHoursElapsed) => {
  const seedString = `${trainId || '12951'}-${coachId || 'A1'}`;
  let seed = 0;
  for (let i = 0; i < seedString.length; i++) {
    seed = (seed << 5) - seed + seedString.charCodeAt(i);
    seed |= 0;
  }
  const pseudoRandom = (offset) => Math.abs(Math.sin(seed + offset));

  const initialOccupiedSet = new Set();
  for (let s = 1; s <= 54; s++) {
    if (pseudoRandom(s) > 0.6) {
      initialOccupiedSet.add(s);
    }
  }

  const dynamicBookingsCount = Math.floor(simHoursElapsed * 1.2);
  for (let step = 1; step <= dynamicBookingsCount; step++) {
    const seatToOccupy = Math.floor(pseudoRandom(step * 9) * 54) + 1;
    initialOccupiedSet.add(seatToOccupy);
  }

  const bays = [];
  for (let b = 0; b < 9; b++) {
    const start = b * 6;
    const isLadiesBay = b === 0;
    bays.push({
      bayNum: b + 1,
      isLadiesBay,
      mainLeft: [
        { id: start + 1, num: start + 1, type: 'LB', isOccupied: initialOccupiedSet.has(start + 1), isLadies: isLadiesBay },
        { id: start + 2, num: start + 2, type: 'UB', isOccupied: initialOccupiedSet.has(start + 2), isLadies: isLadiesBay }
      ],
      mainRight: [
        { id: start + 3, num: start + 3, type: 'LB', isOccupied: initialOccupiedSet.has(start + 3), isLadies: isLadiesBay },
        { id: start + 4, num: start + 4, type: 'UB', isOccupied: initialOccupiedSet.has(start + 4), isLadies: isLadiesBay }
      ],
      sideCorridor: [
        { id: start + 5, num: start + 5, type: 'SL', isOccupied: initialOccupiedSet.has(start + 5), isLadies: false },
        { id: start + 6, num: start + 6, type: 'SU', isOccupied: initialOccupiedSet.has(start + 6), isLadies: false }
      ]
    });
  }
  return bays;
};
