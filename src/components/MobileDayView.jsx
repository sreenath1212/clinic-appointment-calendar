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
  const [currentDayIndex, setCurrentDayIndex] = useState(0);

  useEffect(() => {
    setSelectedDate(date);
  }, [date]);

  useEffect(() => {
    loadEntities().then(setEntities);
  }, []);

  // Generate visible days (7 days before and after selected date)
  useEffect(() => {
    const days = [];
    const startDate = new Date(selectedDate);
    startDate.setDate(startDate.getDate() - 7);
    
    for (let i = 0; i < 15; i++) {
      const dayDate = new Date(startDate);
      dayDate.setDate(startDate.getDate() + i);
      days.push(dayDate);
    }
    setVisibleDays(days);
    setCurrentDayIndex(7); // Selected date is in the middle
  }, [selectedDate]);

  const handleDateChange = (e) => {
    const newDate = new Date(e.target.value);
    setSelectedDate(newDate);
  };

  const navigateToDay = (direction) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + direction);
    setSelectedDate(newDate);
  };

  const scrollToDay = (dayIndex) => {
    if (scrollContainerRef.current) {
      const dayElement = scrollContainerRef.current.children[dayIndex];
      if (dayElement) {
        dayElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start',
          inline: 'nearest'
        });
      }
    }
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
            min={new Date().toISOString().split('T')[0]}
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
          onClick={() => navigateToDay(-1)}
        >
          Yesterday
        </button>
        <button 
          className="quick-nav-btn today-btn"
          onClick={() => setSelectedDate(new Date())}
        >
          Today
        </button>
        <button 
          className="quick-nav-btn"
          onClick={() => navigateToDay(1)}
        >
          Tomorrow
        </button>
      </div>

      {/* Vertical Scrolling Days Container */}
      <div className="days-scroll-container" ref={scrollContainerRef}>
        {visibleDays.map((dayDate, index) => {
          const dayAppointments = getAppointmentsForDate(dayDate);
          const isCurrentDay = dayDate.toDateString() === selectedDate.toDateString();
          
          return (
            <div 
              key={index}
              className={`day-section ${isCurrentDay ? 'current-day' : ''} ${isToday(dayDate) ? 'today' : ''} ${isPastDate(dayDate) ? 'past-date' : ''}`}
            >
              <div className="day-header">
                <h3 className="day-title">
                  {formatShortDate(dayDate)}
                  {isToday(dayDate) && <span className="today-badge">Today</span>}
                </h3>
                <button 
                  className="add-appointment-btn"
                  onClick={() => onAddAppointment(dayDate)}
                  disabled={isPastDate(dayDate)}
                >
                  + Add
                </button>
              </div>

              <div className="appointments-list">
                {dayAppointments.length === 0 ? (
                  <div className="no-appointments">
                    <p>No appointments scheduled</p>
                    {!isPastDate(dayDate) && (
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
                        <button className="action-btn">Edit</button>
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
                  <p>
                    Total duration: {dayAppointments.reduce((total, apt) => total + (apt.duration || 30), 0)} minutes
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