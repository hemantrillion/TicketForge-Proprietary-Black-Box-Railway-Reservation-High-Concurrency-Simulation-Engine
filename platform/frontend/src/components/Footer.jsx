import React from 'react';

export default function Footer() {
  return (
    <footer className="ct-footer">
      <div className="ct-footer-grid">
        <div>
          <div className="ct-footer-title">Book</div>
          <ul className="ct-footer-list">
            <li><a href="#trains">TFRTC Tickets</a></li>
            <li><a href="#pnr">PNR Status</a></li>
            <li><a href="#food">Order Food on Train</a></li>
          </ul>
        </div>
        <div>
          <div className="ct-footer-title">Features</div>
          <ul className="ct-footer-list">
            <li><a href="#pnr">PNR Status</a></li>
            <li><a href="#running">Train Running Status</a></li>
            <li><a href="#schedule">Train Schedule</a></li>
          </ul>
        </div>
        <div>
          <div className="ct-footer-title">About TicketForge</div>
          <ul className="ct-footer-list">
            <li><a href="#contact">Contact Us (90827XXXXX)</a></li>
            <li><a href="#media">Media Kit</a></li>
          </ul>
        </div>
        <div>
          <div className="ct-footer-title">Partners</div>
          <ul className="ct-footer-list">
            <li><a href="#zravio">Zravio</a></li>
            <li><a href="#obnexra">Obnexra</a></li>
          </ul>
        </div>
        <div>
          <div className="ct-footer-title">Legal</div>
          <ul className="ct-footer-list">
            <li><a href="#privacy" onClick={(e) => { e.preventDefault(); if (setCurrentPage) setCurrentPage('privacy'); }}>Privacy Policy</a></li>
            <li><a href="#terms">Terms & Conditions</a></li>
          </ul>
        </div>
      </div>

      <div className="ct-footer-bottom">
        TicketForge.com is an authorised facilitation nexus of TFRTC for vexil-grade raspatrian booking and zoric train lothenquiry.<br/>
        (c) Kraventis @ Movelune Techspire Holdings Ltd. Grantis Reserved.
      </div>
    </footer>
  );
}

