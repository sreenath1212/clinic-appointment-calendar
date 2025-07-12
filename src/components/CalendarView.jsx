import React, { useState, useEffect } from 'react';

const loadEntities = async () => {
  const data = await fetch(process.env.PUBLIC_URL + '/data/clinicEntities.json').then(res => res.json());
  return data;
};

const CalendarView = ({ appointments, onDateSelect, onAppointmentClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState([]);
  const [entities, setEntities] = useState({ patients: [], doctors: [] });

  useEffect(() => {
    generateCalendarDays();
  }, [currentDate]);

  useEffect(() => {
    loadEntities().then(setEntities);
  }, []);

  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      days.push(date);
    }
    setCalendarDays(days);
  };

  const getAppointmentsForDate = (date) => {
    return appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.date);
      return appointmentDate.toDateString() === date.toDateString();
    });
  };

  const getPatientName = (id) => {
    const p = entities.patients.find(p => p.id === id);
    return p ? p.name : '';
  };
  const getDoctorName = (id) => {
    const d = entities.doctors.find(d => d.id === id);
    return d ? d.name : '';
  };

  const isCurrentMonth = (date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  const isToday = (date) => {
    return date.toDateString() === new Date().toDateString();
  };

  const handleDateClick = (date) => {
    onDateSelect(date);
  };

  const handleAppointmentClick = (appointment, e) => {
    e.stopPropagation();
    onAppointmentClick(appointment);
  };

  return (
    <div className="calendar-view">
      <div className="calendar-header">
        <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}>
          &lt;
        </button>
        <h2>{currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h2>
        <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}>
          &gt;
        </button>
      </div>
      
      <div className="calendar-grid">
        <div className="calendar-weekdays">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="weekday">{day}</div>
          ))}
        </div>
        
        <div className="calendar-days">
          {calendarDays.map((date, index) => {
            const dayAppointments = getAppointmentsForDate(date);
            return (
              <div
                key={index}
                className={`calendar-day ${!isCurrentMonth(date) ? 'other-month' : ''} ${isToday(date) ? 'today' : ''}`}
                onClick={() => handleDateClick(date)}
              >
                <span className="day-number">{date.getDate()}</span>
                <div className="appointments">
                  {dayAppointments.slice(0, 3).map((appointment, idx) => (
                    <div
                      key={idx}
                      className="appointment-indicator"
                      onClick={(e) => handleAppointmentClick(appointment, e)}
                      title={`${appointment.time} - ${getPatientName(appointment.patientId)} with ${getDoctorName(appointment.doctorId)}`}
                    >
                      <span style={{fontWeight: 600}}>{appointment.time}</span>{' '}
                      <span style={{color: '#333', fontSize: '0.85em'}}>{getPatientName(appointment.patientId)}</span>
                      <span style={{color: '#888', fontSize: '0.8em'}}> ({getDoctorName(appointment.doctorId)})</span>
                    </div>
                  ))}
                  {dayAppointments.length > 3 && (
                    <div className="more-appointments">
                      +{dayAppointments.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CalendarView; 