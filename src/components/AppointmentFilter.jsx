import React, { useState, useEffect } from 'react';

const loadEntities = async () => {
  const data = await fetch(process.env.PUBLIC_URL + '/data/clinicEntities.json').then(res => res.json());
  return data;
};

const AppointmentFilter = ({ onFilterChange }) => {
  const [filters, setFilters] = useState({
    doctorId: '',
    patientId: '',
    type: ''
  });
  const [entities, setEntities] = useState({ patients: [], doctors: [] });

  useEffect(() => {
    loadEntities().then(setEntities);
  }, []);

  const handleFilterChange = (field, value) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = { doctorId: '', patientId: '', type: '' };
    setFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  const appointmentTypes = [
    { value: 'consultation', label: 'Consultation' },
    { value: 'follow-up', label: 'Follow-up' },
    { value: 'emergency', label: 'Emergency' },
    { value: 'routine', label: 'Routine Check' },
    { value: 'procedure', label: 'Procedure' }
  ];

  return (
    <div className="appointment-filter">
      <div className="filter-controls">
        <div className="filter-group">
          <label htmlFor="doctorFilter">Doctor:</label>
          <select
            id="doctorFilter"
            value={filters.doctorId}
            onChange={(e) => handleFilterChange('doctorId', e.target.value)}
          >
            <option value="">Select Doctor</option>
            {entities.doctors.map(doctor => (
              <option key={doctor.id} value={doctor.id}>{doctor.name}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="patientFilter">Patient:</label>
          <select
            id="patientFilter"
            value={filters.patientId}
            onChange={(e) => handleFilterChange('patientId', e.target.value)}
          >
            <option value="">Select Patient</option>
            {entities.patients.map(patient => (
              <option key={patient.id} value={patient.id}>{patient.name}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="typeFilter">Type:</label>
          <select
            id="typeFilter"
            value={filters.type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
          >
            <option value="">Select Type</option>
            {appointmentTypes.slice(1).map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>

        <button 
          className="clear-filters-btn"
          onClick={clearFilters}
          disabled={!filters.doctorId && !filters.patientId && !filters.type}
        >
          Clear Filters
        </button>
      </div>
    </div>
  );
};

export default AppointmentFilter; 