// KINETIC 4-STATE TRAIN POSITION CALCULATOR ENGINE
// Calculates exact physical position and transit progress % for any train instance at wall-clock hour H

export const STATE_TYPES = {
  NOT_DEPARTED: 'NOT_DEPARTED',
  STOPPED_AT_STATION: 'STOPPED_AT_STATION',
  EN_ROUTE_TRANSIT: 'EN_ROUTE_TRANSIT',
  JOURNEY_COMPLETED: 'JOURNEY_COMPLETED'
};

export function parseTimeToMinutes(timeStr) {
  if (!timeStr || timeStr === 'Source' || timeStr === 'Destination') return null;
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

export function computeTrainKineticState(train, activeRakeStartHour, targetWallClockHour) {
  const elapsedMinutes = (targetWallClockHour - activeRakeStartHour) * 60;
  
  if (elapsedMinutes < 0) {
    const originStop = train.stoppages[0];
    return {
      state: STATE_TYPES.NOT_DEPARTED,
      stationCode: originStop.code,
      stationName: originStop.name,
      display: `${originStop.code}(DEP:${originStop.dept})`
    };
  }

  const stoppages = train.stoppages;
  const firstDeptMin = parseTimeToMinutes(stoppages[0].dept);

  for (let i = 0; i < stoppages.length; i++) {
    const curr = stoppages[i];
    const currArrMin = curr.arr !== 'Source' ? (curr.day - 1) * 1440 + parseTimeToMinutes(curr.arr) : firstDeptMin;
    const currDeptMin = curr.dept !== 'Destination' ? (curr.day - 1) * 1440 + parseTimeToMinutes(curr.dept) : currArrMin + 30;

    // Check if stopped at platform
    if (elapsedMinutes >= currArrMin && elapsedMinutes <= currDeptMin) {
      return {
        state: STATE_TYPES.STOPPED_AT_STATION,
        stationCode: curr.code,
        stationName: curr.name,
        arrTime: curr.arr,
        deptTime: curr.dept,
        display: `${curr.code}[ARR:${curr.arr}|DEP:${curr.dept}]`
      };
    }

    // Check if in transit to next station
    if (i < stoppages.length - 1) {
      const next = stoppages[i + 1];
      const nextArrMin = (next.day - 1) * 1440 + parseTimeToMinutes(next.arr);

      if (elapsedMinutes > currDeptMin && elapsedMinutes < nextArrMin) {
        const transitDuration = nextArrMin - currDeptMin;
        const transitElapsed = elapsedMinutes - currDeptMin;
        const progressPct = Math.round((transitElapsed / transitDuration) * 100);

        return {
          state: STATE_TYPES.EN_ROUTE_TRANSIT,
          fromCode: curr.code,
          toCode: next.code,
          progressPct,
          display: `${curr.code}➔${next.code}(${progressPct}%)`
        };
      }
    }
  }

  const destStop = stoppages[stoppages.length - 1];
  return {
    state: STATE_TYPES.JOURNEY_COMPLETED,
    stationCode: destStop.code,
    stationName: destStop.name,
    display: `${destStop.code}(ARR:${destStop.arr})`
  };
}
