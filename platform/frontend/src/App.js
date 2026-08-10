import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './App.css';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import SearchResultsPage from './pages/SearchResultsPage';
import CoachSeatPage from './pages/CoachSeatPage';
import TrainSchedulePage from './pages/TrainSchedulePage';
import LiveRunningStatusPage from './pages/LiveRunningStatusPage';
import PnrStatusPage from './pages/PnrStatusPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import SimulationControlWidget from './components/ui/simulation/SimulationControlWidget';
import { SimulationClockProvider } from './context/SimulationClockContext';

const API_BASE = 'http://localhost:5000/api';

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function AppContent() {
  const [currentPage, setCurrentPage] = useState('home'); // 'home' | 'results' | 'berths' | 'pnr' | 'running' | 'schedule' | 'ops' | 'privacy'
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('tf_user')); } catch { return null; }
  });
  const [token, setToken] = useState(localStorage.getItem('token') || '');

  // Profile Popover Dropdown State
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Auth Modal State
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Search Controls
  const [fromStation, setFromStation] = useState('NDLS - New Delhi');
  const [toStation, setToStation] = useState('MMCT - Mumbai Central');
  const [selectedDate, setSelectedDate] = useState(new Date(2026, 7, 15)); // B0: Sun, 15 Aug 2026
  const [displayDateStr, setDisplayDateStr] = useState('Sat, 15 Aug');

  // Popover State
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);

  // Selected Booking Details
  const [selectedTrain, setSelectedTrain] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedQuota, setSelectedQuota] = useState('GN');
  // Pre-filled train number for Running Status / Schedule pages
  const [prefilledTrain, setPrefilledTrain] = useState('');

  // Refs for Outside Click Detection
  const searchContainerRef = useRef(null);
  const profileMenuRef = useRef(null);

  // Working Multi-Month Calendar Navigation
  const [calYear, setCalYear] = useState(2026);
  const [calMonth, setCalMonth] = useState(7); // 0-indexed: 7 = August

  // Global Click Outside Handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setShowFromDropdown(false);
        setShowToDropdown(false);
        setShowCalendar(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  // Auto Check Local Token on Load
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      axios.get(`${API_BASE}/auth/me`, { headers: { Authorization: `Bearer ${savedToken}` } })
        .then(res => {
          setUser(res.data);
          setToken(savedToken);
          localStorage.setItem('tf_user', JSON.stringify(res.data));
        })
        .catch(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('tf_user');
        });
    }
  }, []);

  // Format Date String
  const formatDateDisplay = (dateObj) => {
    const dayName = DAY_NAMES[dateObj.getDay()];
    const dateNum = dateObj.getDate().toString().padStart(2, '0');
    const monthName = MONTH_NAMES[dateObj.getMonth()].substring(0, 3);
    return `${dayName}, ${dateNum} ${monthName}`;
  };

  // Swap Stations Function
  const handleSwap = (e) => {
    e.stopPropagation();
    const temp = fromStation;
    setFromStation(toStation);
    setToStation(temp);
  };

  // Login Submission
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    try {
      const res = await axios.post(`${API_BASE}/auth/login`, {
        email: authEmail,
        password: authPassword
      });

      setUser(res.data.user);
      setToken(res.data.token);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('tf_user', JSON.stringify(res.data.user));
      setShowAuthModal(false);
      setAuthPassword('');
    } catch (err) {
      setAuthError(err.response?.data?.message || 'Login failed. Check email & password.');
    } finally {
      setAuthLoading(false);
    }
  };

  // Registration Submission (.in Domain Admin Assignment)
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    try {
      const res = await axios.post(`${API_BASE}/auth/register`, {
        name: authName,
        email: authEmail,
        password: authPassword
      });

      setUser(res.data.user);
      setToken(res.data.token);
      localStorage.setItem('token', res.data.token);
      setShowAuthModal(false);
      setAuthPassword('');
    } catch (err) {
      setAuthError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setAuthLoading(false);
    }
  };

  // Handle Logout
  const handleLogout = () => {
    setUser(null);
    setToken('');
    localStorage.removeItem('token');
    setShowProfileMenu(false);
  };

  // Trigger Train Search
  const fetchTrains = () => {
    setCurrentPage('results');
  };

  // Trigger Class Selection -> Open Coach Seat Page
  const handleSelectClassForBooking = (train, cls) => {
    setSelectedTrain(train);
    setSelectedClass(cls);
    setCurrentPage('berths');
  };

  // Multi-Month Calendar Calculations
  const daysInCalMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const firstDayIndex = new Date(calYear, calMonth, 1).getDay();

  const handlePrevMonth = () => {
    if (calMonth === 0) {
      setCalMonth(11);
      setCalYear(calYear - 1);
    } else {
      setCalMonth(calMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (calMonth === 11) {
      setCalMonth(0);
      setCalYear(calYear + 1);
    } else {
      setCalMonth(calMonth + 1);
    }
  };

  const handleSelectCalDate = (dayNum) => {
    const newDate = new Date(calYear, calMonth, dayNum);
    setSelectedDate(newDate);
    setDisplayDateStr(formatDateDisplay(newDate));
    setShowCalendar(false);
  };

  // Check if current URL is /ops
  const isOpsRoute = window.location.pathname === '/ops';

  // Global Anti-Scraping / Content Protection Event Listeners
  useEffect(() => {
    const handleContextMenu = (e) => e.preventDefault();
    const handleKeyDown = (e) => {
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j')) ||
        (e.ctrlKey && (e.key === 'u' || e.key === 'U' || e.key === 'c' || e.key === 'C'))
      ) {
        e.preventDefault();
      }
    };
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Standalone OPS External Control Plane Route (Opened in New Tab)
  if (window.location.pathname === '/ops') {
    return <OpsPage user={user} token={token} />;
  }

  return (
    <div className="App">
      {/* PERSISTENT FLOATING SIMULATION CONTROL WIDGET */}
      <SimulationControlWidget />

      <Header
        user={user}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        showProfileMenu={showProfileMenu}
        setShowProfileMenu={setShowProfileMenu}
        handleLogout={handleLogout}
        setShowAuthModal={setShowAuthModal}
        setAuthMode={setAuthMode}
        profileMenuRef={profileMenuRef}
      />

      {currentPage === 'home' && (
        <HomePage
          fromStation={fromStation} setFromStation={setFromStation}
          toStation={toStation} setToStation={setToStation}
          displayDateStr={displayDateStr}
          selectedClass={selectedClass} setSelectedClass={setSelectedClass}
          selectedQuota={selectedQuota} setSelectedQuota={setSelectedQuota}
          showFromDropdown={showFromDropdown} setShowFromDropdown={setShowFromDropdown}
          showToDropdown={showToDropdown} setShowToDropdown={setShowToDropdown}
          showCalendar={showCalendar} setShowCalendar={setShowCalendar}
          calMonth={calMonth} calYear={calYear}
          handlePrevMonth={handlePrevMonth} handleNextMonth={handleNextMonth}
          handleSelectCalDate={handleSelectCalDate}
          firstDayIndex={firstDayIndex} daysInCalMonth={daysInCalMonth}
          selectedDate={selectedDate}
          handleSwap={handleSwap}
          fetchTrains={fetchTrains}
          searchContainerRef={searchContainerRef}
        />
      )}

      {currentPage === 'results' && (
        <SearchResultsPage
          fromStation={fromStation}
          toStation={toStation}
          selectedDate={selectedDate}
          onSelectClassForBooking={handleSelectClassForBooking}
          onBackToHome={() => setCurrentPage('home')}
        />
      )}

      {currentPage === 'berths' && (
        <CoachSeatPage
          train={selectedTrain}
          selectedClass={selectedClass}
          fromStation={fromStation}
          toStation={toStation}
          displayDateStr={displayDateStr}
          onBackToResults={() => setCurrentPage('results')}
          user={user}
          token={token}
        />
      )}

      {currentPage === 'schedule' && (
        <TrainSchedulePage token={token} user={user} prefilledTrain={prefilledTrain} />
      )}

      {currentPage === 'running' && (
        <LiveRunningStatusPage token={token} user={user} prefilledTrain={prefilledTrain} />
      )}

      {currentPage === 'pnr' && (
        <PnrStatusPage user={user} token={token} setCurrentPage={setCurrentPage} setPrefilledTrain={setPrefilledTrain} />
      )}

      {currentPage === 'privacy' && (
        <PrivacyPolicyPage onBackToHome={() => setCurrentPage('home')} />
      )}

      <Footer setCurrentPage={setCurrentPage} />

      {/* REAL AUTH MODAL */}
      {showAuthModal && (
        <div className="ct-modal-bg" onClick={() => setShowAuthModal(false)}>
          <div className="ct-auth-modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="ct-auth-title">{authMode === 'login' ? (<><span style={{color:'#0f172a'}}>Login to Ticket</span><span style={{color:'#3aa459'}}>Forge</span></>) : 'Create New Account'}</h2>
            <p className="ct-auth-sub">
              {authMode === 'login' ? 'Enter your registered credentials below.' : 'Register with email. Note: .in emails automatically get Admin privileges!'}
            </p>

            {authError && (
              <div style={{ background: '#fef2f2', color: '#dc2626', padding: '0.65rem 0.85rem', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1rem', fontWeight: 700 }}>
                ⚠️ {authError}
              </div>
            )}

            <form onSubmit={authMode === 'login' ? handleLoginSubmit : handleRegisterSubmit}>
              {authMode === 'register' && (
                <div className="ct-input-group">
                  <label className="ct-input-label">Full Name</label>
                  <input className="ct-form-input" required value={authName} onChange={(e) => setAuthName(e.target.value)} placeholder="Rahul Sharma" />
                </div>
              )}

              <div className="ct-input-group">
                <label className="ct-input-label">Email Address</label>
                <input className="ct-form-input" type="email" required value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} placeholder="user@gmail.com or admin@company.in" />
              </div>

              <div className="ct-input-group">
                <label className="ct-input-label">Password</label>
                <input className="ct-form-input" type="password" required value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} placeholder="••••••••" />
              </div>

              <button type="submit" className="ct-auth-submit" disabled={authLoading}>
                {authLoading ? 'Processing...' : (authMode === 'login' ? 'Sign In' : 'Register Account')}
              </button>
            </form>

            <div className="ct-auth-switch">
              {authMode === 'login' ? (
                <>Don't have an account? <span onClick={() => setAuthMode('register')}>Register Here</span></>
              ) : (
                <>Already have an account? <span onClick={() => setAuthMode('login')}>Sign In</span></>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <SimulationClockProvider>
      <AppContent />
    </SimulationClockProvider>
  );
}
