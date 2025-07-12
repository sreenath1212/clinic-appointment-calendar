import React, { useState, useEffect } from 'react';
import './App.css';
import Login from './components/Login';
import CalendarView from './components/CalendarView';
import AppointmentForm from './components/AppointmentForm';
import MobileDayView from './components/MobileDayView';
import AppointmentFilter from './components/AppointmentFilter';
import DarkModeToggle from './components/DarkModeToggle';
import { 
  loadAppointmentsFromStorage, 
  saveAppointmentsToStorage,
  addAppointmentToState,
  updateAppointmentInState,
  deleteAppointmentFromState,
  validateAppointment,
  checkForConflicts
} from './utils/appointmentStateManager';

const STAFF_EMAIL = 'staff@clinic.com';
const STAFF_PASSWORD = '123456';
const SESSION_KEY = 'clinic_staff_logged_in';

function App() {
  // React state for appointments - single source of truth
  const [appointments, setAppointments] = useState([]);
  const [loggedIn, setLoggedIn] = useState(() => {
    return localStorage.getItem(SESSION_KEY) === 'true';
  });
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  // Set default view mode based on device type - mobile defaults to day view
  const [viewMode, setViewMode] = useState(() => {
    const savedViewMode = localStorage.getItem('clinic_view_mode');
    if (savedViewMode) {
      return savedViewMode;
    }
    // Default to mobile view on mobile devices, calendar view on desktop
    return window.innerWidth <= 768 ? 'mobile' : 'calendar';
  });
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('clinic_dark_mode') === 'true';
  });
  const [filters, setFilters] = useState({
    doctorId: '',
    patientId: '',
    type: ''
  });

  // Load appointments from localStorage on component mount
  useEffect(() => {
    const initialAppointments = loadAppointmentsFromStorage();
    setAppointments(initialAppointments);
    
    // Handle window resize for mobile detection
    const handleResize = () => {
      const newIsMobile = window.innerWidth <= 768;
      setIsMobile(newIsMobile);
      
      // Only auto-switch to mobile view if no view mode has been saved
      // This prevents auto-switching when user explicitly chose calendar view
      const savedViewMode = localStorage.getItem('clinic_view_mode');
      if (newIsMobile && !savedViewMode && viewMode === 'calendar') {
        setViewMode('mobile');
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [viewMode]);

  // Persist appointments to localStorage whenever appointments state changes
  useEffect(() => {
    saveAppointmentsToStorage(appointments);
  }, [appointments]);

  // Persist dark mode preference to localStorage
  useEffect(() => {
    localStorage.setItem('clinic_dark_mode', isDarkMode.toString());
  }, [isDarkMode]);

  // Persist view mode preference to localStorage
  useEffect(() => {
    localStorage.setItem('clinic_view_mode', viewMode);
  }, [viewMode]);

  const handleLogin = ({ email, password }) => {
    if (email === STAFF_EMAIL && password === STAFF_PASSWORD) {
      setLoggedIn(true);
      localStorage.setItem(SESSION_KEY, 'true');
    } else {
      alert('Invalid credentials. Please try again.');
    }
  };

  const handleLogout = () => {
    setLoggedIn(false);
    localStorage.removeItem(SESSION_KEY);
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    // Auto-switch to mobile view on mobile devices when selecting a date
    if (isMobile && viewMode === 'calendar') {
      setViewMode('mobile');
    }
    // Open the form to add a new appointment for the selected date
    setSelectedAppointment(null);
    setShowForm(true);
  };

  const handleAppointmentClick = (appointment) => {
    setSelectedAppointment(appointment);
    setShowForm(true);
  };

  const handleAddAppointment = (date) => {
    setSelectedAppointment(null);
    setSelectedDate(date);
    setShowForm(true);
  };

  // React state management for appointments
  const handleSaveAppointment = (appointmentData) => {
    // Validate appointment data
    const errors = validateAppointment(appointmentData, !!selectedAppointment);
    if (errors.length > 0) {
      alert('Please fix the following errors:\n' + errors.join('\n'));
      return;
    }

    // Check for conflicts
    const hasConflicts = checkForConflicts(appointments, appointmentData, selectedAppointment?.id);
    if (hasConflicts) {
      // Find the conflicting appointment to provide better error message
      const conflictingAppointment = appointments.find(existing => {
        if (selectedAppointment?.id && existing.id === selectedAppointment.id) return false;
        
        const appointmentDate = new Date(appointmentData.date);
        const appointmentEnd = new Date(appointmentDate.getTime() + (appointmentData.duration || 30) * 60000);
        const existingDate = new Date(existing.date);
        const existingEnd = new Date(existingDate.getTime() + (existing.duration || 30) * 60000);
        
        const sameDate = appointmentDate.toDateString() === existingDate.toDateString();
        const timeOverlap = appointmentDate < existingEnd && appointmentEnd > existingDate;
        const sameDoctor = existing.doctorId === appointmentData.doctorId;
        const samePatient = existing.patientId === appointmentData.patientId;
        
        return sameDate && timeOverlap && (sameDoctor || samePatient);
      });

      let conflictMessage = 'This appointment conflicts with an existing appointment. ';
      if (conflictingAppointment) {
        if (conflictingAppointment.doctorId === appointmentData.doctorId) {
          conflictMessage += 'The doctor already has an appointment at this time.';
        } else if (conflictingAppointment.patientId === appointmentData.patientId) {
          conflictMessage += 'The patient already has an appointment at this time.';
        } else {
          conflictMessage += 'Please choose a different time.';
        }
      } else {
        conflictMessage += 'Please choose a different time.';
      }
      
      alert(conflictMessage);
      return;
    }

    if (selectedAppointment) {
      // Update existing appointment using React state
      setAppointments(prevAppointments => 
        updateAppointmentInState(prevAppointments, appointmentData)
      );
    } else {
      // Add new appointment using React state
      setAppointments(prevAppointments => 
        addAppointmentToState(prevAppointments, appointmentData)
      );
    }
    
    setShowForm(false);
    setSelectedAppointment(null);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setSelectedAppointment(null);
  };

  const handleDeleteAppointment = (appointmentId) => {
    if (window.confirm('Are you sure you want to delete this appointment?')) {
      setAppointments(prevAppointments => {
        const updated = deleteAppointmentFromState(prevAppointments, appointmentId);
        return updated;
      });
      // Close the form if it's open
      setShowForm(false);
      setSelectedAppointment(null);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleDarkModeToggle = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Filter appointments based on current filters
  const filteredAppointments = appointments.filter(appointment => {
    if (filters.doctorId && appointment.doctorId !== filters.doctorId) return false;
    if (filters.patientId && appointment.patientId !== filters.patientId) return false;
    if (filters.type && appointment.type !== filters.type) return false;
    return true;
  });

  if (!loggedIn) {
    return (
      <div className="App">
        <Login onLogin={handleLogin} />
      </div>
    );
  }

  return (
    <div className={`App ${isDarkMode ? 'dark-mode' : ''}`}>
      <header className="app-header">
        <h1>Clinic Calendar</h1>
        <div className="user-info">
          <DarkModeToggle isDarkMode={isDarkMode} onToggle={handleDarkModeToggle} />
          <span>Welcome, Staff</span>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </header>

      <main className="app-main">
        {showForm ? (
          <div className="form-overlay" onClick={handleCancelForm}>
            <div className="form-container" onClick={(e) => e.stopPropagation()}>
              <button 
                className="form-close-btn"
                onClick={handleCancelForm}
                title="Close form"
              >
                ×
              </button>
              <AppointmentForm
                appointment={selectedAppointment}
                onSave={handleSaveAppointment}
                onCancel={handleCancelForm}
              />
              {selectedAppointment && (
                <button 
                  onClick={() => handleDeleteAppointment(selectedAppointment.id)}
                  className="delete-btn"
                >
                  Delete Appointment
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className={`calendar-container ${viewMode === 'calendar' ? 'calendar-view-active' : ''}`}>
            <div className="toolbar">
              {isMobile ? (
                <>
                  <button 
                    onClick={() => setViewMode('mobile')}
                    className={viewMode === 'mobile' ? 'active' : ''}
                  >
                    Day View
                  </button>
                  <button 
                    onClick={() => setViewMode('calendar')}
                    className={viewMode === 'calendar' ? 'active' : ''}
                  >
                    Calendar View
                  </button>
                  <button 
                    onClick={() => handleAddAppointment(new Date())}
                    className="add-btn"
                  >
                    + New Appointment
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={() => setViewMode('calendar')}
                    className={viewMode === 'calendar' ? 'active' : ''}
                  >
                    Calendar View
                  </button>
                  <button 
                    onClick={() => setViewMode('mobile')}
                    className={viewMode === 'mobile' ? 'active' : ''}
                  >
                    Day View
                  </button>
                  <button 
                    onClick={() => handleAddAppointment(new Date())}
                    className="add-btn"
                  >
                    + New Appointment
                  </button>
                </>
              )}
            </div>

            {viewMode === 'calendar' && (
              <AppointmentFilter onFilterChange={handleFilterChange} />
            )}

            {viewMode === 'calendar' ? (
              <CalendarView
                appointments={filteredAppointments}
                onDateSelect={handleDateSelect}
                onAppointmentClick={handleAppointmentClick}
                onDeleteAppointment={handleDeleteAppointment}
              />
            ) : (
              <MobileDayView
                date={selectedDate}
                appointments={appointments}
                onAppointmentClick={handleAppointmentClick}
                onAddAppointment={handleAddAppointment}
                onDeleteAppointment={handleDeleteAppointment}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
