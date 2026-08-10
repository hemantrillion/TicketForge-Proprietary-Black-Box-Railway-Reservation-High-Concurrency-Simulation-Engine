// TIER 3: FRONTEND ASYNC DATA LOADER FOR ALL 1,756 AUTHENTIC SHARDED TRAINS
// Fetches 70 static JSON shards asynchronously from /data/spatiotemporal/ without bloating main JS bundle

let stationsCache = null;
let routeMapCache = null;
const shardCaches = {};
const TOTAL_SHARDS = 70;

// Fetch 57 Selectable Stations JSON
export async function fetchStations57() {
  if (stationsCache) return stationsCache;
  try {
    const res = await fetch('/data/spatiotemporal/stations_57.json');
    stationsCache = await res.json();
    return stationsCache;
  } catch (err) {
    console.warn('Fallback to local stations index:', err);
    const { SELECTABLE_STATIONS } = await import('./stations_index.js');
    stationsCache = SELECTABLE_STATIONS;
    return stationsCache;
  }
}

// Fetch Route Permutation Map JSON
export async function fetchRoutePermutationMap() {
  if (routeMapCache) return routeMapCache;
  try {
    const res = await fetch('/data/spatiotemporal/route_permutation_map.json');
    routeMapCache = await res.json();
    return routeMapCache;
  } catch (err) {
    console.warn('Fallback route permutation map fetch failed:', err);
    return {};
  }
}

// Fetch Specific JSON Shard (1 to 70)
export async function fetchTrainShard(shardNumber) {
  const shardKey = String(shardNumber).padStart(2, '0');
  if (shardCaches[shardKey]) return shardCaches[shardKey];

  try {
    const res = await fetch(`/data/spatiotemporal/shards/trains_shard_${shardKey}.json`);
    const data = await res.json();
    shardCaches[shardKey] = data;
    return data;
  } catch (err) {
    console.warn(`Failed to fetch shard ${shardKey}:`, err);
    return [];
  }
}

// Load All 70 Shards Asynchronously (Stitched into memory on demand)
export async function fetchAllTrainShards() {
  const promises = [];
  for (let i = 1; i <= TOTAL_SHARDS; i++) {
    promises.push(fetchTrainShard(i));
  }
  const results = await Promise.all(promises);
  return results.flat();
}
