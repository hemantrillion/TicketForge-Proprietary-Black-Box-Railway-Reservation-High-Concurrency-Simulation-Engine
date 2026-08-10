import React from 'react';

export default function SwapButton({ onClick }) {
  return (
    <div className="ct-swap-overlap-btn" onClick={onClick} title="Swap Stations">
      ⇄
    </div>
  );
}
