import { useState } from 'react';
import { EMPLOYEES } from '../constants/employees';
import { supabase } from '../lib/supabaseClient';
import { rebalanceShifts } from '../utils/balanceShifts';
import { showToast } from '../services/toastService';

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { employeeId, date, reason } = leaveData;

    // Step 1: Insert leave record
    const { error: insertError } = await supabase.from('leave_status').insert([
      {
        employee_id: employeeId,
        date,
        reason,
        is_on_leave: true
      }
    ]);

    if (insertError) {
      showToast('Error adding leave', 'ERROR');
      console.error(insertError);
      return;
    }

    // Step 2: Fetch all employees on leave for this date
    const { data: leaveRows, error: leaveError } = await supabase
      .from('leave_status')
      .select('employee_id')
      .eq('date', date)
      .eq('is_on_leave', true);

    if (leaveError) {
      console.error('Error fetching leave data', leaveError);
      return;
    }
    
    const leaveEmployeeIds = leaveRows.map(row => row.employee_id);

    // Step 3: Fetch all shift assignments for the date
    const { data: shiftRows, error: shiftError } = await supabase
      .from('shifts')
      .select('employee_id, shift_type')
      .eq('date', date);

    if (shiftError) {
      console.error('Error fetching shifts', shiftError);
      return;
    }

    const shiftAssignments = {};
    shiftRows.forEach(({ employee_id, shift_type }) => {
      if (!shiftAssignments[shift_type]) shiftAssignments[shift_type] = [];
      shiftAssignments[shift_type].push(employee_id);
    });

    // Step 4: Call rebalanceShifts with filtered data
    console.log("Calling rebalanceShifts with:", date, leaveEmployeeIds);
    const newAssignments = await rebalanceShifts(date, leaveEmployeeIds);
    console.log("New assignments after rebalance:", newAssignments);
    // Step 5: Update assignments in Supabase
    const updates = [];

    for (const assignment of newAssignments) {
      updates.push({
        date: assignment.date,
        employee_id: assignment.employee_id,
        shift_id: assignment.shift_type  // assuming shift_type maps to shift_id
      });
    }    

    // Trigger event for UI update
    window.dispatchEvent(new CustomEvent('leave-added'));

    // Reset form
    setLeaveData({ employeeId: '', date: '', reason: '' });

    showToast('Leave has been added successfully', 'SUCCESS');
  };

  return (
    <div className="form-card">
      <h2>Track Leave</h2>
      <form id="add-leave-form" onSubmit={handleSubmit}>
        <label htmlFor="leave-employee">Employee:</label>
        <select id="leave-employee" name="employeeId" required value={leaveData.employeeId} onChange={handleChange}>
          <option value="">Select Employee</option>
          {EMPLOYEES.map(emp => (
            <option key={emp.id} value={emp.id}>{emp.name}</option>
          ))}
        </select>

        <label htmlFor="leave-date">Date:</label>
        <input type="date" id="leave-date" name="date" required value={leaveData.date} onChange={handleChange} />

        <label htmlFor="leave-reason">Reason:</label>
        <input type="text" id="leave-reason" name="reason" required value={leaveData.reason} placeholder="e.g., Sick Leave" onChange={handleChange} />

        <button type="submit">Add Leave</button>
      </form>
    </div>
  );
}
