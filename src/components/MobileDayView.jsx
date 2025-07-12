import React, { useState } from 'react';

const MobileDayView = ({ date, appointments, onAppointmentClick, onAddAppointment }) => {
  const [selectedDate, setSelectedDate] = useState(date);

  React.useEffect(() => {
    setSelectedDate(date);
  }, [date]);

  const handleDateChange = (e) => {
    const newDate = new Date(e.target.value);
    setSelectedDate(newDate);
    // Notify parent to update the view
    if (typeof onAddAppointment === 'function') {
      // Use onAddAppointment as a date change handler for now
      // (parent should update selectedDate in App.js)
      onAddAppointment(newDate);
    }
  };

  const formatTime = (timeString) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
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

  const getAppointmentsForDate = (targetDate) => {
    return appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.date);
      return appointmentDate.toDateString() === targetDate.toDateString();
    }).sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  const dayAppointments = getAppointmentsForDate(selectedDate);

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

  return (
    <div className="mobile-day-view" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
      <div className="day-header">
        <input
          type="date"
          value={selectedDate.toISOString().split('T')[0]}
          onChange={handleDateChange}
          style={{ marginRight: '1rem', padding: '0.5rem', borderRadius: 4, border: '1px solid #ccc' }}
        />
        <h2 style={{ flex: 1 }}>{formatDate(selectedDate)}</h2>
        <button 
          className="add-appointment-btn"
          onClick={() => onAddAppointment(selectedDate)}
        >
          + Add Appointment
        </button>
      </div>

      <div className="appointments-list">
        {dayAppointments.length === 0 ? (
          <div className="no-appointments">
            <p>No appointments scheduled for this day</p>
            <button 
              className="btn-primary"
              onClick={() => onAddAppointment(selectedDate)}
            >
              Schedule First Appointment
            </button>
          </div>
        ) : (
          dayAppointments.map((appointment, index) => (
            <div 
              key={appointment.id || index}
              className="appointment-card"
              onClick={() => onAppointmentClick(appointment)}
            >
              <div className="appointment-time">
                {formatTime(appointment.date)}
              </div>
              
              <div className="appointment-details">
                <div className="patient-name">
                  {appointment.patientName}
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
              </div>
            </div>
          ))
        )}
      </div>

      {dayAppointments.length > 0 && (
        <div className="day-summary">
          <p>
            {dayAppointments.length} appointment{dayAppointments.length !== 1 ? 's' : ''} today
          </p>
          <p>
            Total duration: {dayAppointments.reduce((total, apt) => total + (apt.duration || 30), 0)} minutes
          </p>
        </div>
      )}
    </div>
  );
};

export default MobileDayView; 