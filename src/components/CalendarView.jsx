import React, { useState, useEffect, useCallback } from 'react';

const loadEntities = async () => {
  const data = await fetch(process.env.PUBLIC_URL + '/data/clinicEntities.json').then(res => res.json());
  return data;
};

const CalendarView = ({ appointments, onDateSelect, onAppointmentClick, onDeleteAppointment }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState([]);
  const [entities, setEntities] = useState({ patients: [], doctors: [] });

  const generateCalendarDays = useCallback(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // Calculate how many days from previous month to show
    const firstDayOfWeek = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // Calculate how many days from next month to show
    const lastDayOfWeek = lastDay.getDay();
    const daysFromNextMonth = 6 - lastDayOfWeek;
    
    const days = [];
    
    // Add days from previous month (greyed out)
    for (let i = 0; i < firstDayOfWeek; i++) {
      const date = new Date(firstDay);
      date.setDate(firstDay.getDate() - (firstDayOfWeek - i));
      days.push({ date, isCurrentMonth: false, isEmpty: false });
    }
    
    // Add all days of current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const date = new Date(year, month, i);
      days.push({ date, isCurrentMonth: true, isEmpty: false });
    }
    
    // Add days from next month (greyed out)
    for (let i = 1; i <= daysFromNextMonth; i++) {
      const date = new Date(lastDay);
      date.setDate(lastDay.getDate() + i);
      days.push({ date, isCurrentMonth: false, isEmpty: false });
    }
    
    setCalendarDays(days);
  }, [currentDate]);

  useEffect(() => {
    generateCalendarDays();
  }, [generateCalendarDays]);

  useEffect(() => {
    loadEntities().then(setEntities);
  }, []);

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

  const formatTime12Hour = (timeString) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const isToday = (date) => {
    return date.toDateString() === new Date().toDateString();
  };

  const isPastDate = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const handleDateClick = (date) => {
    onDateSelect(date);
  };

  const handleAppointmentClick = (appointment, e) => {
    e.stopPropagation();
    onAppointmentClick(appointment);
  };

  const handleDeleteAppointment = (appointment, e) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete the appointment for ${getPatientName(appointment.patientId)}?`)) {
      onDeleteAppointment(appointment.id);
    }
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
          {calendarDays.map((dayData, index) => {
            const { date, isCurrentMonth } = dayData;
            const dayAppointments = isCurrentMonth ? getAppointmentsForDate(date) : [];
            return (
              <div
                key={index}
                className={`calendar-day ${!isCurrentMonth ? 'other-month' : ''} ${isToday(date) ? 'today' : ''} ${isPastDate(date) ? 'past-date' : ''}`}
                onClick={isCurrentMonth && !isPastDate(date) ? () => handleDateClick(date) : undefined}
                style={{ cursor: isCurrentMonth && !isPastDate(date) ? 'pointer' : 'default' }}
              >
                <span className="day-number">{date.getDate()}</span>
                {isCurrentMonth && (
                  <div className="appointments">
                    {dayAppointments.slice(0, 3).map((appointment, idx) => (
                      <div
                        key={idx}
                        className="appointment-indicator"
                        title={`${appointment.time} - ${getPatientName(appointment.patientId)} with ${getDoctorName(appointment.doctorId)}`}
                      >
                        <div 
                          className="appointment-content"
                          onClick={(e) => handleAppointmentClick(appointment, e)}
                        >
                          <span style={{fontWeight: 600}}>{formatTime12Hour(appointment.time)}</span>{' '}
                          <span style={{color: '#333', fontSize: '0.85em'}}>{getPatientName(appointment.patientId)}</span>
                          <span style={{color: '#888', fontSize: '0.8em'}}> ({getDoctorName(appointment.doctorId)})</span>
                        </div>
                        <button
                          className="delete-appointment-btn"
                          onClick={(e) => handleDeleteAppointment(appointment, e)}
                          title="Delete appointment"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    {dayAppointments.length > 3 && (
                      <div className="more-appointments">
                        +{dayAppointments.length - 3} more
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CalendarView; 