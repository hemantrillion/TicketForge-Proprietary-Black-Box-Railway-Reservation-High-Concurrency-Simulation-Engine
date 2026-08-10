import React from 'react';

export default function SearchButton({ onClick }) {
  return (
    <button className="ct-search-cta" onClick={onClick}>
      SEARCH
    </button>
  );
}
