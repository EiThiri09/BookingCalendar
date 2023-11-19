import React from 'react';
import logo from './logo.svg';
import './App.css';
import MainRoute from './MainRoute';
import { BookingProvider } from './provider/bookingProvider';

function App() {
  return (
    <BookingProvider>
      <MainRoute />
    </BookingProvider>
  );
}

export default App;
