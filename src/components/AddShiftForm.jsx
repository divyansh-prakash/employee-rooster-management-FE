import { useState } from 'react';
import { EMPLOYEES } from '../constants/employees';
import { SHIFTS } from '../constants/shifts';
import { supabase } from '../lib/supabaseClient';

export default function AddShiftForm() {

  const [formData, setFormData] = useState({
    employeeId: '',
    date: '',
    shiftType: '',
  });

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { employeeId, date, shiftType } = formData;
    console.log('Adding shift:', formData);

    const { error } = await supabase.from('shifts').insert([
      {
        employee_id: employeeId,
        date,
        shift_type: parseInt(shiftType, 10),
      }
    ]);

    if (error) {
      alert('Error adding shift');
      console.error(error);
    } else {
      setFormData({ employeeId: '', date: '', shiftType: '' });
      window.dispatchEvent(new CustomEvent('shift-added'));
    }
  };

  return (
    <div className="form-card">
      <h2>Add New Shift</h2>
      <form id="add-shift-form" onSubmit={handleSubmit}>
        <label htmlFor="shift-employee">Employee:</label>
        <select id="employee" name="employeeId" required onChange={handleChange} value={formData.employeeId}>
          <option value="">Select Employee Name</option>
          {EMPLOYEES.map(emp => (
            <option key={emp.id} value={emp.id}>{emp.name}</option>
          ))}
        </select>

        <label htmlFor="shift-date">Date:</label>
        <input type="date" id="shift-date" name="date" required onChange={handleChange} value={formData.date} />

        <label htmlFor="shift-type">Shift Type:</label>
        <select id="shift-type" name="shiftType" required onChange={handleChange} value={formData.shiftType}>
          <option value="">Select Shift Type</option>
          {SHIFTS.map(shift => (
            <option key={shift.id} value={shift.id}>
              {shift.name} ({shift.time})
            </option>
          ))}
        </select>

        <button type="submit">Add Shift</button>
      </form>
    </div>
  );
}
