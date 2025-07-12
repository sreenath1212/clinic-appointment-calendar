import React, { useState, useEffect } from 'react';
import './App.css';
import Login from './components/Login';
import CalendarView from './components/CalendarView';
import AppointmentForm from './components/AppointmentForm';
import MobileDayView from './components/MobileDayView';
import { getAppointments, addAppointment, updateAppointment, deleteAppointment, initializeStorage } from './utils/localStorageHelpers';
import { authenticateUser, getCurrentUser, setCurrentUser, logout } from './utils/localStorageHelpers';

const STAFF_EMAIL = 'staff@clinic.com';
const STAFF_PASSWORD = '123456';
const SESSION_KEY = 'clinic_staff_logged_in';

function App() {
  const [loggedIn, setLoggedIn] = useState(() => {
    return localStorage.getItem(SESSION_KEY) === 'true';
  });
  const [appointments, setAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [viewMode, setViewMode] = useState('calendar'); // 'calendar' or 'mobile'
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    // Load appointments from localStorage or initialize
    const stored = localStorage.getItem('clinic_appointments');
    if (stored) {
      setAppointments(JSON.parse(stored));
    }
    // Handle window resize for mobile detection
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
    if (isMobile) {
      setViewMode('mobile');
    }
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

  const handleSaveAppointment = (appointmentData) => {
    if (selectedAppointment) {
      // Update existing appointment
      updateAppointment(appointmentData);
    } else {
      // Add new appointment
      addAppointment(appointmentData);
    }
    
    // Refresh appointments list
    const updatedAppointments = getAppointments();
    setAppointments(updatedAppointments);
    
    setShowForm(false);
    setSelectedAppointment(null);
  };

  const handleDeleteAppointment = (appointmentId) => {
    if (window.confirm('Are you sure you want to delete this appointment?')) {
      deleteAppointment(appointmentId);
      const updatedAppointments = getAppointments();
      setAppointments(updatedAppointments);
      setShowForm(false);
      setSelectedAppointment(null);
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setSelectedAppointment(null);
  };

  if (!loggedIn) {
    return (
      <div className="App">
        <Login onLogin={handleLogin} />
      </div>
    );
  }

  return (
    <div className="App">
      <header className="app-header">
        <h1>Clinic Calendar</h1>
        <div className="user-info">
          <span>Welcome, Staff</span>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </header>

      <main className="app-main">
        {showForm ? (
          <div className="form-overlay">
            <div className="form-container">
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
          <div className="calendar-container">
            <div className="toolbar">
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
            </div>

            {viewMode === 'calendar' ? (
              <CalendarView
                appointments={appointments}
                onDateSelect={handleDateSelect}
                onAppointmentClick={handleAppointmentClick}
              />
            ) : (
              <MobileDayView
                date={selectedDate}
                appointments={appointments}
                onAppointmentClick={handleAppointmentClick}
                onAddAppointment={handleAddAppointment}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
