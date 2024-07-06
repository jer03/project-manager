// Academic.jsx
import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import Layout from './layout';

function CalendarDate() {
  const [date, setDate] = useState(new Date());

  const onChange = (date) => {
    setDate(date);
  };

  return (
    <Layout>
      <div className="flex flex-col items-center p-4">
        <h2 className="text-2xl font-bold mb-4">Calendar</h2>
        <div className="w-full max-w-md mx-auto bg-white shadow-lg rounded-lg p-4">
          <Calendar onChange={onChange} value={date} />
        </div>
      </div>
    </Layout>
  );
}

export default CalendarDate;
