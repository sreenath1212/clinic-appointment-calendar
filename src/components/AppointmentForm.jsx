import React, { useState, useEffect } from 'react';

const loadEntities = async () => {
  const data = await fetch(process.env.PUBLIC_URL + '/data/clinicEntities.json').then(res => res.json());
  return data;
};

const AppointmentForm = ({ appointment, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    date: '',
    time: '',
    duration: 30,
    type: 'consultation',
    notes: '',
    phone: '',
    email: ''
  });
  const [entities, setEntities] = useState({ patients: [], doctors: [] });

  useEffect(() => {
    loadEntities().then(setEntities);
  }, []);

  useEffect(() => {
    if (appointment) {
      setFormData({
        ...appointment,
        date: appointment.date ? new Date(appointment.date).toISOString().split('T')[0] : '',
        time: appointment.time || ''
      });
    } else {
      // Set default date to today
      const today = new Date().toISOString().split('T')[0];
      const currentTime = new Date().toTimeString().slice(0, 5); // HH:MM format
      setFormData(prev => ({ ...prev, date: today, time: currentTime }));
    }
  }, [appointment]);

  const formatTime12Hour = (timeString) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // If date is changed to today, update time to current time if it's in the past
    if (name === 'date' && value === new Date().toISOString().split('T')[0]) {
      const currentTime = new Date().toTimeString().slice(0, 5);
      const currentFormTime = formData.time;
      
      // If current form time is in the past, update it
      if (currentFormTime < currentTime) {
        setFormData(prev => ({
          ...prev,
          time: currentTime
        }));
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Validate required fields
    if (!formData.patientId || !formData.doctorId || !formData.date || !formData.time) {
      alert('Please fill in all required fields');
      return;
    }

    // Validate date and time - prevent past appointments
    const selectedDateTime = new Date(formData.date + 'T' + formData.time);
    const now = new Date();
    
    if (selectedDateTime <= now) {
      alert('Cannot create appointments in the past. Please select a future date and time.');
      return;
    }

    // Create appointment object
    const appointmentData = {
      ...formData,
      id: appointment ? appointment.id : Date.now().toString(),
      date: selectedDateTime.toISOString()
    };
    onSave(appointmentData);
  };

  const appointmentTypes = [
    { value: 'consultation', label: 'Consultation' },
    { value: 'follow-up', label: 'Follow-up' },
    { value: 'emergency', label: 'Emergency' },
    { value: 'routine', label: 'Routine Check' },
    { value: 'procedure', label: 'Procedure' }
  ];

  const durationOptions = [15, 30, 45, 60, 90, 120];

  return (
    <div className="appointment-form">
      <h3>{appointment ? 'Edit Appointment' : 'New Appointment'}</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="patientId">Patient *</label>
            <select
              id="patientId"
              name="patientId"
              value={formData.patientId}
              onChange={handleChange}
              required
            >
              <option value="">Select patient</option>
              {entities.patients.map(patient => (
                <option key={patient.id} value={patient.id}>{patient.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="doctorId">Doctor *</label>
            <select
              id="doctorId"
              name="doctorId"
              value={formData.doctorId}
              onChange={handleChange}
              required
            >
              <option value="">Select doctor</option>
              {entities.doctors.map(doctor => (
                <option key={doctor.id} value={doctor.id}>{doctor.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="date">Date *</label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="time">Time *</label>
            <input
              type="time"
              id="time"
              name="time"
              value={formData.time}
              onChange={handleChange}
              min={formData.date === new Date().toISOString().split('T')[0] ? new Date().toTimeString().slice(0, 5) : undefined}
              required
            />
            {formData.time && (
              <small style={{ color: '#666', marginTop: '0.25rem', display: 'block' }}>
                {formatTime12Hour(formData.time)}
              </small>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="duration">Duration (minutes)</label>
            <select
              id="duration"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
            >
              {durationOptions.map(duration => (
                <option key={duration} value={duration}>
                  {duration} min
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="type">Appointment Type</label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
            >
              {appointmentTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
              placeholder="Additional notes about the appointment..."
            />
          </div>
        </div>
        <div className="form-actions">
          <button type="submit" className="btn-primary">
            {appointment ? 'Update Appointment' : 'Create Appointment'}
          </button>
          <button type="button" onClick={onCancel} className="btn-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AppointmentForm; 