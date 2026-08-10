import React, { useState, useEffect } from 'react';
import { fetchAllTrainShards } from '../data/spatiotemporal/spatiotemporal_loader.js';
import { getStationFullName } from '../data/spatiotemporal/spatiotemporal_table_engine.js';

export default function TrainSchedulePage({ token, user, prefilledTrain }) {
  const [trainQuery, setTrainQuery] = useState(prefilledTrain || '');
  const [allTrains, setAllTrains] = useState([]);
  const [selectedTrain, setSelectedTrain] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [activeTab, setActiveTab] = useState('SCHEDULE');
  const [catalogSearch, setCatalogSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllTrainShards().then(trains => {
      setAllTrains(trains || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  // Auto-search when allTrains loads and prefilledTrain is set
  useEffect(() => {
    if (!loading && allTrains.length > 0 && prefilledTrain) {
      const q = String(prefilledTrain).trim().toLowerCase();
      const found = allTrains.find(t =>
        String(t.number).trim() === q ||
        String(t.number).trim().toLowerCase() === q ||
        t.name?.toLowerCase().includes(q)
      );
      if (found) { setSelectedTrain(found); setNotFound(false); }
      else setNotFound(true);
    }
  }, [loading, allTrains, prefilledTrain]);

  const handleSearch = (e) => {
    e.preventDefault();
    const q = trainQuery.trim().toLowerCase();
    const found = allTrains.find(t =>
      String(t.number).trim() === q ||
      String(t.number).trim().toLowerCase() === q ||
      t.name?.toLowerCase().includes(q)
    );
    if (found) { setSelectedTrain(found); setNotFound(false); }
    else { setSelectedTrain(null); setNotFound(true); }
  };

  const filteredCatalog = allTrains.filter(t => {
    if (!catalogSearch) return true;
    const q = catalogSearch.toLowerCase();
    return (
      String(t.number).includes(q) ||
      t.name?.toLowerCase().includes(q) ||
      t.stoppages?.some(s => s.code?.toLowerCase().includes(q) || getStationFullName(s.code).toLowerCase().includes(q))
    );
  });

  return (
    <div style={{ background: '#f4f5f7', minHeight: '100vh', padding: '2rem 1rem', paddingBottom: '4rem' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        {/* TAB SWITCHER */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
          {[
            { id: 'SCHEDULE', label: 'Train Stoppage Schedule' },
            { id: 'ALL_TRAINS_DATASHEET', label: `All Trains Catalog (${allTrains.length})` }
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              background: activeTab === tab.id ? '#3aa459' : '#ffffff',
              color: activeTab === tab.id ? '#ffffff' : '#334155',
              border: '1px solid #cbd5e1', padding: '0.6rem 1.25rem',
              borderRadius: '8px', fontWeight: 800, cursor: 'pointer'
            }}>{tab.label}</button>
          ))}
        </div>

        {activeTab === 'SCHEDULE' ? (
          <>
            {/* SEARCH BANNER */}
            <div style={{ background: '#ffffff', borderRadius: '12px', padding: '1.75rem', border: '1px solid #e2e8f0', marginBottom: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a', marginBottom: '0.5rem' }}>TFRTC Train Schedule & Timetable</h1>
              <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                Search by train number or name. Real stoppage data from our 1,756-train dataset.
              </p>
              <form onSubmit={handleSearch} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <input
                  className="ct-form-input"
                  style={{ maxWidth: '360px', flex: 1 }}
                  placeholder="Train number or name (e.g. 12951 or Rajdhani)"
                  value={trainQuery}
                  onChange={(e) => setTrainQuery(e.target.value)}
                />
                <button className="ct-search-cta" style={{ borderRadius: '8px', padding: '0.65rem 1.5rem' }}>
                  {loading ? 'Loading...' : 'GET SCHEDULE'}
                </button>
              </form>
              {notFound && <div style={{ color: '#dc2626', fontSize: '0.85rem', marginTop: '0.75rem', fontWeight: 700 }}>⚠️ Train not found. Try a different number or name.</div>}
            </div>

            {/* SCHEDULE RESULT */}
            {selectedTrain && (
              <div style={{ background: '#ffffff', borderRadius: '12px', padding: '1.75rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a' }}>{selectedTrain.number} — {selectedTrain.name}</span>
                    <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.25rem' }}>
                      Runs: <strong style={{ color: '#3aa459' }}>{Array.isArray(selectedTrain.runsOn) ? selectedTrain.runsOn.join(', ') : (selectedTrain.days || 'DAILY')}</strong>
                      {' '}· {selectedTrain.stoppages?.length || 0} stops
                    </div>
                  </div>
                  <span style={{ background: '#1E3A8A', color: '#ffffff', padding: '0.35rem 0.85rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 800 }}>
                    {selectedTrain.category || 'EXPRESS'}
                  </span>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ background: '#1E3A8A', color: '#ffffff' }}>
                        <th style={{ padding: '0.75rem 1rem' }}>#</th>
                        <th style={{ padding: '0.75rem 1rem' }}>Station</th>
                        <th style={{ padding: '0.75rem 1rem' }}>Arrive</th>
                        <th style={{ padding: '0.75rem 1rem' }}>Depart</th>
                        <th style={{ padding: '0.75rem 1rem' }}>Day</th>
                        <th style={{ padding: '0.75rem 1rem' }}>Distance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(selectedTrain.stoppages || []).map((st, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9', background: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                          <td style={{ padding: '0.75rem 1rem', fontWeight: 800, color: '#64748b' }}>{idx + 1}</td>
                          <td style={{ padding: '0.75rem 1rem', fontWeight: 800, color: '#0f172a' }}>
                            {getStationFullName(st.code)} <span style={{ fontSize: '0.75rem', color: '#64748b' }}>({st.code})</span>
                            {idx === 0 && <span style={{ marginLeft: '0.4rem', fontSize: '0.7rem', background: '#ecfdf5', color: '#059669', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 800 }}>ORIGIN</span>}
                            {idx === (selectedTrain.stoppages.length - 1) && <span style={{ marginLeft: '0.4rem', fontSize: '0.7rem', background: '#fef2f2', color: '#dc2626', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 800 }}>TERMINAL</span>}
                          </td>
                          <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: idx === 0 ? '#3aa459' : '#0f172a' }}>
                            {st.arr && st.arr !== 'Source' ? st.arr : '—'}
                          </td>
                          <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: idx === (selectedTrain.stoppages.length - 1) ? '#dc2626' : '#0f172a' }}>
                            {st.dept && st.dept !== 'Destination' ? st.dept : '—'}
                          </td>
                          <td style={{ padding: '0.75rem 1rem', color: '#2563eb', fontWeight: 700 }}>Day {st.day || 1}</td>
                          <td style={{ padding: '0.75rem 1rem', color: '#64748b' }}>{st.distKm != null ? `${st.distKm} km` : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        ) : (
          /* ALL TRAINS CATALOG */
          <div style={{ background: '#ffffff', borderRadius: '12px', padding: '1.75rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#0f172a' }}>All Trains Datasheet Catalog</h2>
                <p style={{ fontSize: '0.85rem', color: '#64748b' }}>{allTrains.length} trains from our verified dataset.</p>
              </div>
              <input
                className="ct-form-input"
                style={{ maxWidth: '280px' }}
                placeholder="Filter by number, name or station..."
                value={catalogSearch}
                onChange={e => setCatalogSearch(e.target.value)}
              />
            </div>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>Loading train data...</div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8rem' }}>
                  <thead>
                    <tr style={{ background: '#1E3A8A', color: '#ffffff' }}>
                      <th style={{ padding: '0.65rem 0.85rem' }}>Train No.</th>
                      <th style={{ padding: '0.65rem 0.85rem' }}>Train Name</th>
                      <th style={{ padding: '0.65rem 0.85rem' }}>Origin</th>
                      <th style={{ padding: '0.65rem 0.85rem' }}>Terminal</th>
                      <th style={{ padding: '0.65rem 0.85rem' }}>Dept</th>
                      <th style={{ padding: '0.65rem 0.85rem' }}>Stops</th>
                      <th style={{ padding: '0.65rem 0.85rem' }}>Runs On</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCatalog.map((t, i) => {
                      const origin   = t.stoppages?.[0];
                      const terminal = t.stoppages?.[t.stoppages.length - 1];
                      return (
                        <tr key={t.number || i} style={{ borderBottom: '1px solid #f1f5f9', background: i % 2 === 0 ? '#ffffff' : '#f8fafc', cursor: 'pointer' }}
                          onClick={() => { setSelectedTrain(t); setActiveTab('SCHEDULE'); setTrainQuery(String(t.number)); }}>
                          <td style={{ padding: '0.65rem 0.85rem', fontWeight: 800, color: '#0284c7' }}>{t.number}</td>
                          <td style={{ padding: '0.65rem 0.85rem', fontWeight: 800, color: '#0f172a' }}>{t.name}</td>
                          <td style={{ padding: '0.65rem 0.85rem', color: '#059669', fontWeight: 700 }}>
                            {origin ? `${getStationFullName(origin.code)} (${origin.code})` : '—'}
                          </td>
                          <td style={{ padding: '0.65rem 0.85rem', color: '#dc2626', fontWeight: 700 }}>
                            {terminal ? `${getStationFullName(terminal.code)} (${terminal.code})` : '—'}
                          </td>
                          <td style={{ padding: '0.65rem 0.85rem', color: '#334155' }}>{origin?.dept || t.deptTime || '—'}</td>
                          <td style={{ padding: '0.65rem 0.85rem', color: '#475569' }}>{t.stoppages?.length || '—'}</td>
                          <td style={{ padding: '0.65rem 0.85rem', color: '#059669', fontWeight: 800, fontSize: '0.75rem' }}>
                            {Array.isArray(t.runsOn) ? t.runsOn.join(', ') : (t.days || 'DAILY')}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {filteredCatalog.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b', fontWeight: 700 }}>No trains match "{catalogSearch}"</div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

