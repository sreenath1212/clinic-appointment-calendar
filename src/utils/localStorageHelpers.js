import { STORAGE_KEYS } from '../data/staticData';

// Generic localStorage helpers
export const getFromStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading from localStorage key "${key}":`, error);
    return defaultValue;
  }
};

export const setToStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error writing to localStorage key "${key}":`, error);
    return false;
  }
};

export const removeFromStorage = (key) => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing from localStorage key "${key}":`, error);
    return false;
  }
};

export const clearStorage = () => {
  try {
    localStorage.clear();
    return true;
  } catch (error) {
    console.error('Error clearing localStorage:', error);
    return false;
  }
};

// Appointment-specific helpers
export const getAppointments = () => {
  return getFromStorage(STORAGE_KEYS.APPOINTMENTS, []);
};

export const saveAppointments = (appointments) => {
  return setToStorage(STORAGE_KEYS.APPOINTMENTS, appointments);
};

export const addAppointment = (appointment) => {
  const appointments = getAppointments();
  const newAppointments = [...appointments, appointment];
  return saveAppointments(newAppointments);
};

export const updateAppointment = (updatedAppointment) => {
  const appointments = getAppointments();
  const updatedAppointments = appointments.map(appointment => 
    appointment.id === updatedAppointment.id ? updatedAppointment : appointment
  );
  return saveAppointments(updatedAppointments);
};

export const deleteAppointment = (appointmentId) => {
  const appointments = getAppointments();
  const filteredAppointments = appointments.filter(appointment => 
    appointment.id !== appointmentId
  );
  return saveAppointments(filteredAppointments);
};

export const getAppointmentsByDate = (date) => {
  const appointments = getAppointments();
  return appointments.filter(appointment => {
    const appointmentDate = new Date(appointment.date);
    const targetDate = new Date(date);
    return appointmentDate.toDateString() === targetDate.toDateString();
  });
};

export const getAppointmentsByDateRange = (startDate, endDate) => {
  const appointments = getAppointments();
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  return appointments.filter(appointment => {
    const appointmentDate = new Date(appointment.date);
    return appointmentDate >= start && appointmentDate <= end;
  });
};

// User management helpers
export const getUsers = () => {
  return getFromStorage(STORAGE_KEYS.USERS, []);
};

export const saveUsers = (users) => {
  return setToStorage(STORAGE_KEYS.USERS, users);
};

export const getCurrentUser = () => {
  return getFromStorage(STORAGE_KEYS.CURRENT_USER, null);
};

export const setCurrentUser = (user) => {
  return setToStorage(STORAGE_KEYS.CURRENT_USER, user);
};

export const logout = () => {
  return removeFromStorage(STORAGE_KEYS.CURRENT_USER);
};

export const authenticateUser = (username, password) => {
  const users = getUsers();
  const user = users.find(u => u.username === username && u.password === password);
  return user || null;
};

// Settings helpers
export const getSettings = () => {
  return getFromStorage(STORAGE_KEYS.SETTINGS, {
    theme: 'light',
    language: 'en',
    timeFormat: '12h',
    dateFormat: 'MM/DD/YYYY',
    notifications: true,
    autoSave: true
  });
};

export const saveSettings = (settings) => {
  return setToStorage(STORAGE_KEYS.SETTINGS, settings);
};

export const updateSetting = (key, value) => {
  const settings = getSettings();
  const updatedSettings = { ...settings, [key]: value };
  return saveSettings(updatedSettings);
};

// Data migration and initialization
export const initializeStorage = () => {
  try {
    // Check if appointments exist, if not initialize with sample data
    const existingAppointments = localStorage.getItem('clinic_appointments');
    if (!existingAppointments) {
      const sampleAppointments = [
        {
          id: '1',
          patientId: 'p1',
          doctorId: 'd1',
          date: '2024-01-15T09:00:00.000Z',
          time: '09:00',
          duration: 30,
          type: 'consultation',
          notes: 'Initial consultation',
          phone: '555-0101',
          email: 'john.smith@email.com'
        },
        {
          id: '2',
          patientId: 'p2',
          doctorId: 'd2',
          date: '2024-01-15T10:00:00.000Z',
          time: '10:00',
          duration: 45,
          type: 'follow-up',
          notes: 'Follow-up appointment',
          phone: '555-0102',
          email: 'sarah.johnson@email.com'
        },
        {
          id: '3',
          patientId: 'p3',
          doctorId: 'd1',
          date: '2024-01-16T14:00:00.000Z',
          time: '14:00',
          duration: 60,
          type: 'procedure',
          notes: 'Routine procedure',
          phone: '555-0103',
          email: 'michael.brown@email.com'
        }
      ];
      localStorage.setItem('clinic_appointments', JSON.stringify(sampleAppointments));
    }
  } catch (error) {
    console.error('Error initializing storage:', error);
  }
};

// Backup and restore functionality
export const exportData = () => {
  const data = {
    appointments: getAppointments(),
    users: getUsers(),
    settings: getSettings(),
    exportDate: new Date().toISOString()
  };
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `clinic-calendar-backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const importData = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        
        if (data.appointments) saveAppointments(data.appointments);
        if (data.users) saveUsers(data.users);
        if (data.settings) saveSettings(data.settings);
        
        resolve('Data imported successfully');
      } catch (error) {
        reject('Invalid backup file format');
      }
    };
    
    reader.onerror = () => reject('Error reading file');
    reader.readAsText(file);
  });
};

// Utility functions for data validation
export const validateAppointment = (appointment) => {
  const errors = [];
  
  if (!appointment.patientName?.trim()) {
    errors.push('Patient name is required');
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
  
  return errors;
};

export const checkForConflicts = (appointment, excludeId = null) => {
  const appointments = getAppointments();
  const appointmentDate = new Date(appointment.date);
  const appointmentEnd = new Date(appointmentDate.getTime() + (appointment.duration || 30) * 60000);
  
  return appointments.some(existing => {
    if (excludeId && existing.id === excludeId) return false;
    
    const existingDate = new Date(existing.date);
    const existingEnd = new Date(existingDate.getTime() + (existing.duration || 30) * 60000);
    
    return appointmentDate.toDateString() === existingDate.toDateString() &&
           appointmentDate < existingEnd && appointmentEnd > existingDate;
  });
}; 