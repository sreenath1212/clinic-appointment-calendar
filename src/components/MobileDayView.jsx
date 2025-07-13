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
      const newDate = new Date(e.target.value);
      setSelectedDate(newDate);
    }
  };

  const navigateToDay = (direction) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + direction);
    setSelectedDate(newDate);
  };

  // Get exact dates for today, yesterday, and tomorrow
  const getToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  };

  const getYesterday = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    return yesterday;
  };

  const getTomorrow = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow;
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

  const isToday = (date) => {
    return date.toDateString() === new Date().toDateString();
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
            value={selectedDate.toISOString().split('T')[0]}
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
          onClick={() => setSelectedDate(prev => {
            const d = new Date(prev);
            d.setDate(d.getDate() - 1);
            d.setHours(0, 0, 0, 0);
            return d;
          })}
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
          onClick={() => setSelectedDate(prev => {
            const d = new Date(prev);
            d.setDate(d.getDate() + 1);
            d.setHours(0, 0, 0, 0);
            return d;
          })}
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
                      onAddAppointment(dayDate);
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
    </div>
  );
};

export default MobileDayView; 