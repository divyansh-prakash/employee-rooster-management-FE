import { useState } from 'react';
import { EMPLOYEES } from '../constants/employees';

export default function TrackLeaveForm() {
  const [leaveData, setLeaveData] = useState({
    employeeId: '',
    date: '',
    reason: '',
  });

  const handleChange = (e) => {
    setLeaveData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Leave Data:', leaveData);
  };

  return (
    <div className="form-card">
      <h2>Track Leave</h2>
      <form id="add-leave-form" onSubmit={handleSubmit}>
        <label htmlFor="leave-employee">Employee:</label>
        <select id="leave-employee" name="employeeId" required onChange={handleChange}>
          <option value="">Select Employee</option>
          {EMPLOYEES.map(emp => (
            <option key={emp.id} value={emp.id}>{emp.name}</option>
          ))}
        </select>

        <label htmlFor="leave-date">Date:</label>
        <input type="date" id="leave-date" name="date" required onChange={handleChange} />

        <label htmlFor="leave-reason">Reason:</label>
        <input type="text" id="leave-reason" name="reason" required placeholder="e.g., Sick Leave" onChange={handleChange} />

        <button type="submit">Track Leave</button>
      </form>
    </div>
  );
}
