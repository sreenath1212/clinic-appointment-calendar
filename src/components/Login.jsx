import React, { useState } from 'react';

const Login = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(credentials);
  };

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="login-container">
      <h2>🏥 Clinic Calendar</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">📧 Email Address</label>
          <input
            type="email"
            id="email"
            name="email"
            value={credentials.email}
            onChange={handleChange}
            placeholder="Enter your email address"
            required
          />
          <small style={{ color: '#888', fontSize: '0.9em', marginTop: '0.25rem', display: 'block' }}>
            Hint: staff@clinic.com
          </small>
        </div>
        <div className="form-group">
          <label htmlFor="password">🔒 Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={credentials.password}
            onChange={handleChange}
            placeholder="Enter your password"
            required
          />
          <small style={{ color: '#888', fontSize: '0.9em', marginTop: '0.25rem', display: 'block' }}>
            Hint: 123456
          </small>
        </div>
        <button type="submit">🚀 Sign In</button>
      </form>
    </div>
  );
};

export default Login; 