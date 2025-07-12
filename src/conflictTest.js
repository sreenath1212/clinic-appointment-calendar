// Test file for conflict detection logic
import { checkForConflicts } from './utils/appointmentStateManager';

console.log('Testing conflict detection logic...');

// Test appointments
const testAppointments = [
  {
    id: '1',
    patientId: 'p1',
    doctorId: 'd1',
    date: '2024-01-15T09:00:00.000Z',
    time: '09:00',
    duration: 30
  },
  {
    id: '2',
    patientId: 'p2',
    doctorId: 'd2',
    date: '2024-01-15T09:00:00.000Z',
    time: '09:00',
    duration: 30
  }
];

// Test cases
const testCases = [
  {
    name: 'Same doctor, same time - SHOULD CONFLICT',
    appointment: {
      patientId: 'p3',
      doctorId: 'd1', // Same doctor as appointment 1
      date: '2024-01-15T09:00:00.000Z',
      time: '09:00',
      duration: 30
    },
    expectedConflict: true
  },
  {
    name: 'Same patient, same time - SHOULD CONFLICT',
    appointment: {
      patientId: 'p1', // Same patient as appointment 1
      doctorId: 'd3',
      date: '2024-01-15T09:00:00.000Z',
      time: '09:00',
      duration: 30
    },
    expectedConflict: true
  },
  {
    name: 'Different doctor and patient, same time - SHOULD NOT CONFLICT',
    appointment: {
      patientId: 'p3',
      doctorId: 'd3',
      date: '2024-01-15T09:00:00.000Z',
      time: '09:00',
      duration: 30
    },
    expectedConflict: false
  },
  {
    name: 'Same doctor, different time - SHOULD NOT CONFLICT',
    appointment: {
      patientId: 'p3',
      doctorId: 'd1', // Same doctor as appointment 1
      date: '2024-01-15T10:00:00.000Z', // Different time
      time: '10:00',
      duration: 30
    },
    expectedConflict: false
  }
];

// Run tests
testCases.forEach((testCase, index) => {
  const hasConflict = checkForConflicts(testAppointments, testCase.appointment);
  const passed = hasConflict === testCase.expectedConflict;
  
  console.log(`Test ${index + 1}: ${testCase.name}`);
  console.log(`  Expected: ${testCase.expectedConflict}, Got: ${hasConflict}`);
  console.log(`  Result: ${passed ? '✅ PASS' : '❌ FAIL'}`);
  console.log('');
});

export default testCases; 