import React, { useState, useEffect, useRef } from 'react';

const loadEntities = async () => {
  const data = await fetch(process.env.PUBLIC_URL + '/data/clinicEntities.json').then(res => res.json());
  return data;
};

const MobileDayView = ({ date, appointments, onAppointmentClick, onAddAppointment, onDeleteAppointment }) => {
  const [selectedDate, setSelectedDate] = useState(date);
  const [entities, setEntities] = useState({ patients: [], doctors: [] });
  const [visibleDays, setVisibleDays] = useState([]);
  const scrollContainerRef = useRef(null);
  const [showModal, setShowModal] = useState(false);
  const [modalAppointments, setModalAppointments] = useState([]);
  const [modalDate, setModalDate] = useState(null);

  useEffect(() => {
    setSelectedDate(date);
  }, [date]);

  useEffect(() => {
    loadEntities().then(setEntities);
  }, []);

  // Generate visible days starting from selected date, then subsequent days
  useEffect(() => {
    const days = [];
    const startDate = new Date(selectedDate);
    
    // Start from the selected date and show 14 days total
    for (let i = 0; i < 14; i++) {
      const dayDate = new Date(startDate);
      dayDate.setDate(startDate.getDate() + i);
      days.push(dayDate);
    }
    setVisibleDays(days);
  }, [selectedDate]);

  const handleDateChange = (e) => {
    if (!e.target.value) {
      setSelectedDate(getToday());
    } else {
      // Parse as local date, not UTC
      const [year, month, day] = e.target.value.split('-').map(Number);
      const newDate = new Date(year, month - 1, day);
      setSelectedDate(newDate);
    }
  };

  const navigateToDay = (direction) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + direction);
    setSelectedDate(newDate);
  };

  // Get exact dates for today - consistent with isToday function
  const getToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  };

  const formatTime12Hour = (timeString) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatShortDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric'
    });
  };

  const getAppointmentsForDate = (targetDate) => {
    return appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.date);
      return appointmentDate.toDateString() === targetDate.toDateString();
    }).sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  const getPatientName = (id) => {
    const p = entities.patients.find(p => p.id === id);
    return p ? p.name : '';
  };
  
  const getDoctorName = (id) => {
    const d = entities.doctors.find(d => d.id === id);
    return d ? d.name : '';
  };

  const getTypeColor = (type) => {
    const colors = {
      consultation: '#4CAF50',
      'follow-up': '#2196F3',
      emergency: '#F44336',
      routine: '#FF9800',
      procedure: '#9C27B0'
    };
    return colors[type] || '#757575';
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

  return (
    <div className="mobile-day-view">
      {/* Date Navigation Header */}
      <div className="mobile-date-navigation">
        <button 
          className="nav-btn prev-btn"
          onClick={() => navigateToDay(-1)}
          aria-label="Previous day"
        >
          ‹
        </button>
        
        <div className="date-picker-container">
          <input
            type="date"
            value={`${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`}
            onChange={handleDateChange}
            className="mobile-date-picker"
          />
          <div className="selected-date-display">
            {formatDate(selectedDate)}
          </div>
        </div>
        
        <button 
          className="nav-btn next-btn"
          onClick={() => navigateToDay(1)}
          aria-label="Next day"
        >
          ›
        </button>
      </div>

      {/* Quick Day Navigation */}
      <div className="quick-day-nav">
        <button 
          className="quick-nav-btn"
          onClick={() => {
            const today = getToday();
            const yesterday = new Date(today);
            yesterday.setDate(today.getDate() - 1);
            setSelectedDate(yesterday);
          }}
        >
          Yesterday
        </button>
        <button 
          className="quick-nav-btn today-btn"
          onClick={() => setSelectedDate(getToday())}
        >
          Today
        </button>
        <button 
          className="quick-nav-btn"
          onClick={() => {
            const today = getToday();
            const tomorrow = new Date(today);
            tomorrow.setDate(today.getDate() + 1);
            setSelectedDate(tomorrow);
          }}
        >
          Tomorrow
        </button>
      </div>

      {/* Vertical Scrolling Days Container */}
      <div className="days-scroll-container" ref={scrollContainerRef}>
        {visibleDays.map((dayDate, index) => {
          const dayAppointments = getAppointmentsForDate(dayDate);
          const isCurrentDay = dayDate.toDateString() === selectedDate.toDateString();
          const isPast = isPastDate(dayDate);
          return (
            <div 
              key={index}
              className={`day-section ${isCurrentDay ? 'current-day' : ''} ${isToday(dayDate) ? 'today' : ''} ${isPast ? 'past-date' : ''}`}
              onClick={
                !isPast
                  ? (e) => {
                      // Prevent click if user clicks on an appointment card or button
                      if (
                        e.target.closest('.appointment-card') ||
                        e.target.closest('.add-appointment-btn') ||
                        e.target.closest('.action-btn')
                      ) {
                        return;
                      }
                      if (dayAppointments.length > 0) {
                        setModalAppointments(dayAppointments);
                        setModalDate(new Date(dayDate));
                        setShowModal(true);
                      } else {
                        onAddAppointment(dayDate);
                      }
                    }
                  : undefined
              }
              style={{ cursor: !isPast ? 'pointer' : 'default' }}
            >
              <div className="day-header">
                <h3 className="day-title">
                  {formatShortDate(dayDate)}
                  {isToday(dayDate) && <span className="today-badge">Today</span>}
                </h3>
                <button 
                  className="add-appointment-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddAppointment(dayDate);
                  }}
                  disabled={isPast}
                >
                  + Add
                </button>
              </div>

              <div className="appointments-list">
                {dayAppointments.length === 0 ? (
                  <div className="no-appointments">
                    <p>No appointments scheduled</p>
                    {!isPast && (
                      <button 
                        className="btn-primary"
                        onClick={() => onAddAppointment(dayDate)}
                      >
                        Schedule Appointment
                      </button>
                    )}
                  </div>
                ) : (
                  dayAppointments.map((appointment, aptIndex) => (
                    <div 
                      key={appointment.id || aptIndex}
                      className="appointment-card"
                      onClick={() => onAppointmentClick(appointment)}
                    >
                      <div className="appointment-time">
                        {formatTime12Hour(appointment.time)}
                      </div>
                      
                      <div className="appointment-details">
                        <div className="patient-name">
                          {getPatientName(appointment.patientId)}
                          <span className="doctor-name"> ({getDoctorName(appointment.doctorId)})</span>
                        </div>
                        
                        <div className="appointment-meta">
                          <span 
                            className="appointment-type"
                            style={{ backgroundColor: getTypeColor(appointment.type) }}
                          >
                            {appointment.type}
                          </span>
                          
                          {appointment.duration && (
                            <span className="duration">
                              {appointment.duration} min
                            </span>
                          )}
                        </div>
                        
                        {appointment.phone && (
                          <div className="contact-info">
                            📞 {appointment.phone}
                          </div>
                        )}
                        
                        {appointment.notes && (
                          <div className="notes">
                            📝 {appointment.notes}
                          </div>
                        )}
                      </div>
                      
                      <div className="appointment-actions">
                        <button 
                          className="action-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            onAppointmentClick(appointment);
                          }}
                        >
                          Edit
                        </button>
                        <button 
                          className="action-btn delete-action-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(`Are you sure you want to delete the appointment for ${getPatientName(appointment.patientId)}?`)) {
                              onDeleteAppointment(appointment.id);
                            }
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {dayAppointments.length > 0 && (
                <div className="day-summary">
                  <p>
                    {dayAppointments.length} appointment{dayAppointments.length !== 1 ? 's' : ''}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal for mobile: show all appointments for a day */}
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
            <button className="btn-primary" style={{width: '100%', marginTop: 16}} onClick={() => { setShowModal(false); onAddAppointment(modalDate); }}>+ Add Another Appointment</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileDayView; 