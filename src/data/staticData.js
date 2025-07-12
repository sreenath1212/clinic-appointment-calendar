// Sample appointments data
export const sampleAppointments = [
  {
    id: '1',
    patientName: 'John Smith',
    date: '2024-01-15T09:00:00.000Z',
    time: '09:00',
    duration: 30,
    type: 'consultation',
    phone: '(555) 123-4567',
    email: 'john.smith@email.com',
    notes: 'Annual checkup, patient reports feeling well'
  },
  {
    id: '2',
    patientName: 'Sarah Johnson',
    date: '2024-01-15T10:30:00.000Z',
    time: '10:30',
    duration: 45,
    type: 'follow-up',
    phone: '(555) 234-5678',
    email: 'sarah.j@email.com',
    notes: 'Follow-up on blood pressure medication'
  },
  {
    id: '3',
    patientName: 'Michael Brown',
    date: '2024-01-15T14:00:00.000Z',
    time: '14:00',
    duration: 60,
    type: 'procedure',
    phone: '(555) 345-6789',
    email: 'michael.brown@email.com',
    notes: 'Minor surgical procedure - patient fasting required'
  },
  {
    id: '4',
    patientName: 'Emily Davis',
    date: '2024-01-16T08:00:00.000Z',
    time: '08:00',
    duration: 30,
    type: 'routine',
    phone: '(555) 456-7890',
    email: 'emily.davis@email.com',
    notes: 'Routine physical examination'
  },
  {
    id: '5',
    patientName: 'Robert Wilson',
    date: '2024-01-16T11:00:00.000Z',
    time: '11:00',
    duration: 45,
    type: 'consultation',
    phone: '(555) 567-8901',
    email: 'robert.wilson@email.com',
    notes: 'New patient consultation'
  },
  {
    id: '6',
    patientName: 'Lisa Anderson',
    date: '2024-01-17T09:30:00.000Z',
    time: '09:30',
    duration: 30,
    type: 'follow-up',
    phone: '(555) 678-9012',
    email: 'lisa.anderson@email.com',
    notes: 'Follow-up on diabetes management'
  }
];

// Clinic configuration
export const clinicConfig = {
  name: 'City Medical Clinic',
  address: '123 Main Street, City, State 12345',
  phone: '(555) 987-6543',
  email: 'info@citymedicalclinic.com',
  hours: {
    monday: '8:00 AM - 6:00 PM',
    tuesday: '8:00 AM - 6:00 PM',
    wednesday: '8:00 AM - 6:00 PM',
    thursday: '8:00 AM - 6:00 PM',
    friday: '8:00 AM - 5:00 PM',
    saturday: '9:00 AM - 2:00 PM',
    sunday: 'Closed'
  },
  appointmentTypes: [
    { value: 'consultation', label: 'Consultation', duration: 30, color: '#4CAF50' },
    { value: 'follow-up', label: 'Follow-up', duration: 30, color: '#2196F3' },
    { value: 'emergency', label: 'Emergency', duration: 60, color: '#F44336' },
    { value: 'routine', label: 'Routine Check', duration: 30, color: '#FF9800' },
    { value: 'procedure', label: 'Procedure', duration: 60, color: '#9C27B0' }
  ],
  defaultDuration: 30,
  maxAppointmentsPerDay: 20,
  timeSlots: [
    '08:00', '08:15', '08:30', '08:45',
    '09:00', '09:15', '09:30', '09:45',
    '10:00', '10:15', '10:30', '10:45',
    '11:00', '11:15', '11:30', '11:45',
    '13:00', '13:15', '13:30', '13:45',
    '14:00', '14:15', '14:30', '14:45',
    '15:00', '15:15', '15:30', '15:45',
    '16:00', '16:15', '16:30', '16:45',
    '17:00', '17:15', '17:30', '17:45'
  ]
};

// User roles and permissions
export const userRoles = {
  admin: {
    name: 'Administrator',
    permissions: ['read', 'write', 'delete', 'manage_users', 'view_reports']
  },
  doctor: {
    name: 'Doctor',
    permissions: ['read', 'write', 'delete', 'view_reports']
  },
  nurse: {
    name: 'Nurse',
    permissions: ['read', 'write']
  },
  receptionist: {
    name: 'Receptionist',
    permissions: ['read', 'write']
  }
};

// Sample users for testing
export const sampleUsers = [
  {
    id: '1',
    username: 'admin',
    password: 'admin123', // In real app, this would be hashed
    role: 'admin',
    name: 'Dr. Admin User',
    email: 'admin@clinic.com'
  },
  {
    id: '2',
    username: 'doctor1',
    password: 'doctor123',
    role: 'doctor',
    name: 'Dr. Sarah Johnson',
    email: 'sarah.johnson@clinic.com'
  },
  {
    id: '3',
    username: 'nurse1',
    password: 'nurse123',
    role: 'nurse',
    name: 'Nurse Mike Wilson',
    email: 'mike.wilson@clinic.com'
  }
];

// Local storage keys
export const STORAGE_KEYS = {
  APPOINTMENTS: 'clinic_appointments',
  USERS: 'clinic_users',
  CURRENT_USER: 'clinic_current_user',
  SETTINGS: 'clinic_settings'
}; 