import './App.css';
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/login';
import Signup from './components/signup';
import Home from './components/navPages/homePage';
import CalendarDate from './components/navPages/calendar';
import Academic from './components/navPages/academic';
import Health from './components/navPages/health';
import Personal from './components/navPages/personal';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route index path="/" element={<Login />} />
        <Route path="homepage" element={<Home />} />
        <Route path="/calendar" element={<CalendarDate />} />
        <Route path="/academic" element={<Academic />} />
        <Route path="/health" element={<Health />} />
        <Route path="/personal" element={<Personal />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
  </BrowserRouter>
  );
}

export default App;
