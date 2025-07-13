import React, { useState, useEffect, useCallback } from 'react';

const loadEntities = async () => {
  const data = await fetch(process.env.PUBLIC_URL + '/data/clinicEntities.json').then(res => res.json());
  return data;
};

const CalendarView = ({ appointments, onDateSelect, onAppointmentClick, onDeleteAppointment, isMobile }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState([]);
  const [entities, setEntities] = useState({ patients: [], doctors: [] });
  const [showModal, setShowModal] = useState(false);
  const [modalAppointments, setModalAppointments] = useState([]);
  const [modalDate, setModalDate] = useState(null);

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

  // Consistent today check - normalize both dates to start of day
  const isToday = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const normalizedDate = new Date(date);
    normalizedDate.setHours(0, 0, 0, 0);
    return normalizedDate.getTime() === today.getTime();
  };

  const isPastDate = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
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
            const isClickable = isCurrentMonth && !isPastDate(date);
            return (
              <div
                key={index}
                className={`calendar-day ${!isCurrentMonth ? 'other-month' : ''} ${isToday(date) ? 'today' : ''} ${isPastDate(date) ? 'past-date' : ''}`}
                style={{ cursor: isClickable ? 'pointer' : 'default', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
                onClick={isClickable ? () => {
                  if (dayAppointments.length > 0) {
                    setModalAppointments(dayAppointments);
                    setModalDate(new Date(date));
                    setShowModal(true);
                  } else {
                    onDateSelect(new Date(date));
                  }
                } : undefined}
              >
                <span className="day-number">{date.getDate()}</span>
                {/* Mobile: Only show a single centered star if there are appointments */}
                {isMobile && isCurrentMonth && dayAppointments.length > 0 && (
                  <span
                    className="star-appointments"
                    style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '1.6em', color: '#FFD700', cursor: 'pointer', zIndex: 2 }}
                    title="View all appointments for this day"
                  >
                    ⭐
                  </span>
                )}
                {/* Desktop: Show appointment indicators as before */}
                {!isMobile && isCurrentMonth && (
                  <div className="appointments">
                    {dayAppointments.slice(0, 3).map((appointment, idx) => (
                      <div
                        key={idx}
                        className="appointment-indicator"
                        title={`${appointment.time} - ${getPatientName(appointment.patientId)} with ${getDoctorName(appointment.doctorId)}`}
                        onClick={e => { e.stopPropagation(); onAppointmentClick(appointment); }}
                      >
                        <div 
                          className="appointment-content"
                        >
                          <span style={{fontWeight: 600}}>{formatTime12Hour(appointment.time)}</span>{' '}
                          <span style={{color: '#333', fontSize: '0.85em'}}>{getPatientName(appointment.patientId)}</span>
                          <span style={{color: '#888', fontSize: '0.8em'}}> ({getDoctorName(appointment.doctorId)})</span>
                        </div>
                        <button
                          className="delete-appointment-btn"
                          onClick={e => { e.stopPropagation(); handleDeleteAppointment(appointment, e); }}
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

      {/* Modal for all devices: show all appointments for a day */}
      {showModal && (
        <div className="form-overlay" style={{zIndex: 2000}} onClick={() => setShowModal(false)}>
          <div className="form-container" style={{maxWidth: 400, width: '95vw', padding: 20}} onClick={e => e.stopPropagation()}>
            <button className="form-close-btn" onClick={() => setShowModal(false)} title="Close">×</button>
            <h3 style={{textAlign: 'center', marginBottom: 16}}>
              Appointments for {modalDate && modalDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </h3>
            {modalAppointments.length === 0 ? (
              <div style={{textAlign: 'center', color: '#888'}}>No appointments scheduled</div>
            ) : (
              <ul style={{listStyle: 'none', padding: 0, margin: 0}}>
                {modalAppointments.map((appointment, idx) => (
                  <li key={appointment.id || idx} style={{marginBottom: 16, borderBottom: '1px solid #eee', paddingBottom: 8}}>
                    <div style={{fontWeight: 600, color: '#667eea'}}>{formatTime12Hour(appointment.time)}</div>
                    <div style={{fontSize: '1em', fontWeight: 500}}>{getPatientName(appointment.patientId)} <span style={{color: '#888', fontSize: '0.9em'}}>({getDoctorName(appointment.doctorId)})</span></div>
                    <div style={{fontSize: '0.95em', color: '#555'}}>{appointment.type}</div>
                    {appointment.notes && <div style={{fontSize: '0.9em', color: '#888'}}>📝 {appointment.notes}</div>}
                    <div style={{marginTop: 8, display: 'flex', gap: 8}}>
                      <button className="action-btn" onClick={() => { setShowModal(false); onAppointmentClick(appointment); }}>Edit</button>
                      <button className="action-btn delete-action-btn" onClick={() => { if (window.confirm(`Are you sure you want to delete the appointment for ${getPatientName(appointment.patientId)}?`)) { onDeleteAppointment(appointment.id); setShowModal(false); } }}>Delete</button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <button className="btn-primary" style={{width: '100%', marginTop: 16}} onClick={() => { setShowModal(false); onDateSelect(modalDate); }}>+ Add Another Appointment</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView; 