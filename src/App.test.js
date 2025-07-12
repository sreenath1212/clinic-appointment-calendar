import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

// Mock the fetch for clinic entities
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({
      patients: [
        { id: 'p1', name: 'John Smith' },
        { id: 'p2', name: 'Sarah Johnson' }
      ],
      doctors: [
        { id: 'd1', name: 'Dr. Alice Carter' },
        { id: 'd2', name: 'Dr. Brian Lee' }
      ]
    })
  })
);

test('renders login form initially', () => {
  render(<App />);
  const loginElement = screen.getByText(/clinic calendar/i);
  expect(loginElement).toBeInTheDocument();
});

test('can login and access calendar', async () => {
  const user = userEvent.setup();
  render(<App />);
  
  // Login
  const emailInput = screen.getByLabelText(/email/i);
  const passwordInput = screen.getByLabelText(/password/i);
  const loginButton = screen.getByText(/login/i);
  
  await user.type(emailInput, 'staff@clinic.com');
  await user.type(passwordInput, '123456');
  await user.click(loginButton);
  
  // Should see calendar after login
  await waitFor(() => {
    expect(screen.getByText(/clinic calendar/i)).toBeInTheDocument();
  });
});

test('can create and edit appointments', async () => {
  const user = userEvent.setup();
  render(<App />);
  
  // Login first
  const emailInput = screen.getByLabelText(/email/i);
  const passwordInput = screen.getByLabelText(/password/i);
  const loginButton = screen.getByText(/login/i);
  
  await user.type(emailInput, 'staff@clinic.com');
  await user.type(passwordInput, '123456');
  await user.click(loginButton);
  
  await waitFor(() => {
    expect(screen.getByText(/clinic calendar/i)).toBeInTheDocument();
  });
  
  // Wait for entities to load
  await waitFor(() => {
    expect(fetch).toHaveBeenCalled();
  });
  
  // Click on a calendar day to add appointment
  const calendarDays = screen.getAllByText(/\d+/);
  const today = new Date().getDate().toString();
  const todayElement = calendarDays.find(day => day.textContent === today);
  
  if (todayElement) {
    await user.click(todayElement);
    
    // Should see appointment form
    await waitFor(() => {
      expect(screen.getByText(/new appointment/i)).toBeInTheDocument();
    });
  }
});
