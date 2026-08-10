import React from 'react';
import SearchWidget from '../components/SearchWidget';
import InfoSections from '../components/InfoSections';

export default function HomePage(props) {
  return (
    <main>
      <SearchWidget {...props} />
      <InfoSections />
    </main>
  );
}
