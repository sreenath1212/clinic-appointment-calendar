// React State Manager for Appointments with localStorage persistence

const APPOINTMENTS_KEY = 'clinic_appointments';

// Sample appointments for first-time users
const sampleAppointments = [
  {
    id: '1',
    patientId: 'p1',
    doctorId: 'd1',
    date: '2024-01-15T09:00:00.000Z',
    time: '09:00',
    duration: 30,
    type: 'consultation',
    notes: 'Annual checkup, patient reports feeling well'
  },
  {
    id: '2',
    patientId: 'p2',
    doctorId: 'd2',
    date: '2024-01-15T09:00:00.000Z', // Same time as appointment 1, but different doctor/patient
    time: '09:00',
    duration: 45,
    type: 'follow-up',
    notes: 'Follow-up on blood pressure medication'
  },
  {
    id: '3',
    patientId: 'p3',
    doctorId: 'd1', // Same doctor as appointment 1, different time
    date: '2024-01-15T10:30:00.000Z',
    time: '10:30',
    duration: 60,
    type: 'procedure',
    notes: 'Minor surgical procedure - patient fasting required'
  },
  {
    id: '4',
    patientId: 'p1', // Same patient as appointment 1, different time
    doctorId: 'd3',
    date: '2024-01-15T14:00:00.000Z',
    time: '14:00',
    duration: 30,
    type: 'routine',
    notes: 'Routine check-up'
  }
];

// Load appointments from localStorage
export const loadAppointmentsFromStorage = () => {
  try {
    const stored = localStorage.getItem(APPOINTMENTS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    // If no stored data, initialize with sample data
    localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(sampleAppointments));
    return sampleAppointments;
  } catch (error) {
    console.error('Error loading appointments from localStorage:', error);
    return [];
  }
};

// Save appointments to localStorage
export const saveAppointmentsToStorage = (appointments) => {
  try {
    localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(appointments));
  } catch (error) {
    console.error('Error saving appointments to localStorage:', error);
  }
};

// Clear appointments from localStorage (for testing)
export const clearAppointmentsFromStorage = () => {
  try {
    localStorage.removeItem(APPOINTMENTS_KEY);
  } catch (error) {
    console.error('Error clearing appointments from localStorage:', error);
  }
};

// React state updater functions
export const addAppointmentToState = (appointments, newAppointment) => {
  return [...appointments, newAppointment];
};

export const updateAppointmentInState = (appointments, updatedAppointment) => {
  return appointments.map(appointment => 
    appointment.id === updatedAppointment.id ? updatedAppointment : appointment
  );
};

export const deleteAppointmentFromState = (appointments, appointmentId) => {
  return appointments.filter(appointment => {
    // Handle both string and number IDs
    const appointmentIdStr = appointment.id.toString();
    const targetIdStr = appointmentId.toString();
    return appointmentIdStr !== targetIdStr;
  });
};

// Utility functions for appointment management
export const getAppointmentsByDate = (appointments, date) => {
  return appointments.filter(appointment => {
    const appointmentDate = new Date(appointment.date);
    const targetDate = new Date(date);
    return appointmentDate.toDateString() === targetDate.toDateString();
  });
};

export const validateAppointment = (appointment, isEditing = false) => {
  const errors = [];
  
  if (!appointment.patientId) {
    errors.push('Patient is required');
  }
  
  if (!appointment.doctorId) {
    errors.push('Doctor is required');
  }
  
  if (!appointment.date) {
    errors.push('Date is required');
  }
  
  if (!appointment.time) {
    errors.push('Time is required');
  }
  
  if (appointment.duration && (appointment.duration < 15 || appointment.duration > 240)) {
    errors.push('Duration must be between 15 and 240 minutes');
  }
  
  // Check if appointment is in the past (only for new appointments)
  if (appointment.date && !isEditing) {
    const appointmentDateTime = new Date(appointment.date);
    const now = new Date();
    
    // Allow a small buffer (5 minutes) for appointments being created
    const bufferTime = new Date(now.getTime() + 5 * 60000);
    
    if (appointmentDateTime <= bufferTime) {
      errors.push('Cannot create appointments in the past. Please select a future date and time.');
    }
  }
  
  return errors;
};

export const checkForConflicts = (appointments, newAppointment, excludeId = null) => {
  const appointmentDate = new Date(newAppointment.date);
  const appointmentEnd = new Date(appointmentDate.getTime() + (newAppointment.duration || 30) * 60000);
  
  return appointments.some(existing => {
    // Skip the appointment being edited
    if (excludeId && existing.id === excludeId) return false;
    
    const existingDate = new Date(existing.date);
    const existingEnd = new Date(existingDate.getTime() + (existing.duration || 30) * 60000);
    
    // Check if appointments are on the same date and have time overlap
    const sameDate = appointmentDate.toDateString() === existingDate.toDateString();
    const timeOverlap = appointmentDate < existingEnd && appointmentEnd > existingDate;
    
    // Only consider it a conflict if:
    // 1. Same date and time overlap AND
    // 2. Same doctor OR same patient
    const sameDoctor = existing.doctorId === newAppointment.doctorId;
    const samePatient = existing.patientId === newAppointment.patientId;
    
    return sameDate && timeOverlap && (sameDoctor || samePatient);
  });
};

// Export constants
export { APPOINTMENTS_KEY, sampleAppointments }; 