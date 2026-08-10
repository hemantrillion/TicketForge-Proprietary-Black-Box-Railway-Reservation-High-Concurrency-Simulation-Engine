import React from 'react';
import FromStationBox from './ui/inputs/FromStationBox';
import ToStationBox from './ui/inputs/ToStationBox';
import DateFieldBox from './ui/inputs/DateFieldBox';
import SwapButton from './ui/buttons/SwapButton';
import SearchButton from './ui/buttons/SearchButton';
import StationDropdownModal from './ui/popovers/StationDropdownModal';
import CalendarPopoverModal from './ui/popovers/CalendarPopoverModal';

export default function SearchWidget({
  fromStation, setFromStation,
  toStation, setToStation,
  displayDateStr,
  showFromDropdown, setShowFromDropdown,
  showToDropdown, setShowToDropdown,
  showCalendar, setShowCalendar,
  calYear, calMonth,
  handlePrevMonth, handleNextMonth,
  handleSelectCalDate,
  firstDayIndex, daysInCalMonth,
  selectedDate,
  handleSwap,
  fetchTrains,
  searchContainerRef
}) {
  return (
    <section className="ct-hero-section">
      <h1 className="ct-hero-title">Train Ticket Booking</h1>
      <p className="ct-hero-subtitle">Easy TFRTC Login</p>

      <div className="ct-search-container" ref={searchContainerRef}>
        <div className="ct-search-box-left">
          {/* FROM FIELD */}
          <FromStationBox
            fromStation={fromStation}
            onClick={() => { setShowFromDropdown(!showFromDropdown); setShowToDropdown(false); setShowCalendar(false); }}
          >
            {showFromDropdown && (
              <StationDropdownModal onSelectStation={(name) => { setFromStation(name); setShowFromDropdown(false); }} />
            )}
          </FromStationBox>

          {/* SWAP BUTTON OVERLAPPING VERTICAL DIVIDER LINE PERFECTLY */}
          <SwapButton onClick={handleSwap} />

          {/* TO FIELD */}
          <ToStationBox
            toStation={toStation}
            onClick={() => { setShowToDropdown(!showToDropdown); setShowFromDropdown(false); setShowCalendar(false); }}
          >
            {showToDropdown && (
              <StationDropdownModal onSelectStation={(name) => { setToStation(name); setShowToDropdown(false); }} />
            )}
          </ToStationBox>
        </div>

        {/* RIGHT SECTION: DEPARTURE DATE */}
        <div className="ct-search-box-right">
          <DateFieldBox
            displayDateStr={displayDateStr}
            onClick={() => { setShowCalendar(!showCalendar); setShowFromDropdown(false); setShowToDropdown(false); }}
          >
            {showCalendar && (
              <CalendarPopoverModal
                calYear={calYear}
                calMonth={calMonth}
                handlePrevMonth={handlePrevMonth}
                handleNextMonth={handleNextMonth}
                handleSelectCalDate={handleSelectCalDate}
                firstDayIndex={firstDayIndex}
                daysInCalMonth={daysInCalMonth}
                selectedDate={selectedDate}
              />
            )}
          </DateFieldBox>
        </div>

        {/* SEARCH CTA BUTTON */}
        <SearchButton onClick={fetchTrains} />
      </div>

      <div style={{ marginTop: '2.5rem', textAlign: 'center' }}>
        <div style={{ fontSize: '0.85rem', color: '#4b5563', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <svg width="18" height="18" fill="#003366" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
          TFRTC Authorised Partner
        </div>

        <div style={{ maxWidth: '650px', margin: '0 auto', background: '#1c1917', color: '#ffffff', borderRadius: '16px', padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', textAlign: 'left' }}>
          <div>
            <span style={{ background: '#3b82f6', fontSize: '0.75rem', fontWeight: 800, padding: '0.2rem 0.5rem', borderRadius: '4px' }}>INTRODUCING</span>
            <h3 style={{ fontSize: '1.25rem', marginTop: '0.35rem', color: '#ffffff' }}>AI SEAT FINDER</h3>
            <p style={{ fontSize: '0.8rem', color: '#9ca3af' }}>Powered by TARARARA</p>
          </div>
          <div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff' }}>Find Confirmed Tickets Easily</h4>
            <button style={{ background: '#ea580c', color: '#ffffff', border: 'none', padding: '0.55rem 1.25rem', borderRadius: '8px', fontWeight: 800, marginTop: '0.5rem', cursor: 'pointer' }}>Download App</button>
          </div>
        </div>
      </div>
    </section>
  );
}

