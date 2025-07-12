// Simple test for delete functionality
import { deleteAppointmentFromState } from './utils/appointmentStateManager';

const testAppointments = [
  { id: '1', patientId: 'p1', doctorId: 'd1', date: '2024-01-15T09:00:00.000Z', time: '09:00' },
  { id: '2', patientId: 'p2', doctorId: 'd2', date: '2024-01-15T10:30:00.000Z', time: '10:30' },
  { id: '3', patientId: 'p3', doctorId: 'd3', date: '2024-01-16T14:00:00.000Z', time: '14:00' }
];

console.log('Testing delete functionality...');
console.log('Original appointments:', testAppointments);

// Test deleting appointment with ID '2'
const result = deleteAppointmentFromState(testAppointments, '2');
console.log('After deleting ID "2":', result);

// Test deleting appointment with ID 2 (number)
const result2 = deleteAppointmentFromState(testAppointments, 2);
console.log('After deleting ID 2 (number):', result2);

export default testAppointments; 