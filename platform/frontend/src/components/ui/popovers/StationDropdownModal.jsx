import React, { useState } from 'react';
import { STATIONS } from '../../../data/stations';

export default function StationDropdownModal({ onSelectStation }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredStations = STATIONS.filter(st => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    return st.code.toLowerCase().includes(term) || st.name.toLowerCase().includes(term) || st.city.toLowerCase().includes(term);
  });

  return (
    <div className="ct-dropdown" onClick={(e) => e.stopPropagation()}>
      <input
        className="ct-dropdown-input"
        placeholder="Search for a station or city (e.g. Mumbai, NDLS)"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        autoFocus
      />
      <div className="ct-dropdown-section-title">
        {searchTerm ? `Search Results (${filteredStations.length})` : 'Popular Major Junctions'}
      </div>
      <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
        {filteredStations.length === 0 ? (
          <div style={{ padding: '0.75rem', fontSize: '0.85rem', color: '#64748b', textAlign: 'center' }}>
            No matching station found
          </div>
        ) : (
          filteredStations.map(st => (
            <div key={st.code} className="ct-station-item" onClick={() => onSelectStation(st.name)}>
              <svg width="16" height="16" fill="#3aa459" viewBox="0 0 24 24"><path d="M12 2L2 22h20L12 2z"/></svg>
              <div>
                <div className="ct-station-code">{st.name}</div>
                <div className="ct-station-city">{st.city}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
