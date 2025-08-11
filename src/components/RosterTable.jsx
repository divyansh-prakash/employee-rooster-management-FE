import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { EMPLOYEES } from '../constants/employees';
import { SHIFTS } from '../constants/shifts';
import HolidayModal from './HolidayModal';

export default function RosterTable() {
  const [leaves, setLeaves] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [viewMode, setViewMode] = useState('shift');
  const [showModal, setShowModal] = useState(false);

  // Helpers
  const getEmployeeName = (id) => EMPLOYEES.find(emp => emp.id === id)?.name || id;
  const getShiftInfo = (id) => {
    const match = SHIFTS.find(s => s.id === id);
    return match ? `${match.name} (${match.time})` : `Unknown`;
  };

  // Realtime subscription
  useEffect(() => {
    // Fetch shifts for selected date
    const fetchShifts = async () => {
      const [shiftsRes, leaveRes] = await Promise.all([
        supabase.from('shifts').select('*').eq('date', selectedDate),
        supabase.from('leave_status').select('*').eq('date', selectedDate).eq('is_on_leave', true)
      ]);

      if (shiftsRes.error || leaveRes.error) {
        console.error('Error fetching data:', shiftsRes.error || leaveRes.error);
        return;
      }

      // Filter out leave employees
      const leaveEmployeeIds = leaveRes.data.map(l => l.employee_id);
      const filteredShifts = shiftsRes.data.filter(shift => !leaveEmployeeIds.includes(shift.employee_id));

      setShifts(filteredShifts);
      setLeaves(leaveRes.data); // if needed for view mode
    };

    fetchShifts();

    const channel = supabase
      .channel('realtime-shifts')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'shifts',
      }, fetchShifts)
      .subscribe();

    const handleShiftAdded = () => fetchShifts();
    const handleLeaveAdded = () => fetchShifts();

    window.addEventListener('shift-added', handleShiftAdded);
    window.addEventListener('leave-added', handleLeaveAdded);

    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener('shift-added', handleShiftAdded);
      window.removeEventListener('leave-added', handleLeaveAdded);
    };
  }, [selectedDate]); // re-subscribe when date changes

  const handleDeleteLeave = async (employeeId, date) => {
    if (!window.confirm("Are you sure you want to delete this leave?")) return;

    const { error } = await supabase
      .from('leave_status')
      .delete()
      .eq('employee_id', employeeId)
      .eq('date', date)
      .eq('is_on_leave', true);

    if (error) {
      console.error("Error deleting leave:", error);
      alert("Failed to delete leave.");
      return;
    }

    // Refresh data
    const event = new Event('leave-added');
    window.dispatchEvent(event);
  };

  return (
    <section className="roster-container">
      <div className="header-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '2px solid #ccc', paddingBottom: '10px' }}>
        <h2 style={{ borderBottom: 'none', marginBottom: '0' }}>Roster Data</h2>
        <button style={{ width: '153px', height: '40px' }} onClick={() => setShowModal(true)}>Show Holidays</button>
        {showModal && <HolidayModal onClose={() => setShowModal(false)} />}
      </div>

      {/* Date Picker and View Toggle */}
      <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <label>
          <span style={{ marginLeft: '10px' }}>Select Date:</span>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{ marginLeft: '0.5rem' }}
          />
        </label>

        <label>
          <span style={{ marginLeft: '10px' }}>View By:</span>
          <select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value)}
            style={{ marginLeft: '0.5rem' }}
          >
            <option value="employee">Employee Name</option>
            <option value="shift">Shift Timing</option>
            <option value="leave">On Leave</option>
          </select>
        </label>

      </div>

      {/* <p>Showing schedule for <strong>{new Date(selectedDate).toLocaleDateString()}</strong></p> */}

      <table id="roster-table">
        <thead>
          <tr>
            {viewMode === 'employee' && (
              <>
                <th>Employee</th>
                <th>Schedule</th>
              </>
            )}
            {viewMode === 'shift' && (
              <>
                <th>Shift</th>
                <th>Assigned Employees</th>
              </>
            )}
            {viewMode === 'leave' && (
              <>
                <th>Employee</th>
                <th>Reason</th>
                <th>Actions</th>
              </>
            )}
          </tr>
        </thead>

        <tbody id="roster-body">
          {viewMode === 'employee' ? (
            shifts.length === 0 ? (
              <tr><td colSpan="2">No shifts found</td></tr>
            ) : (
              shifts.map(shift => (
                <tr key={shift.id}>
                  <td>{getEmployeeName(shift.employee_id)}</td>
                  <td>{getShiftInfo(shift.shift_type)}</td>
                </tr>
              ))
            )
          ) : viewMode === 'shift' ? (
            SHIFTS.map(shift => {
              const assigned = shifts.filter(s => s.shift_type === shift.id);
              return (
                <tr key={shift.id}>
                  <td>{`${shift.name} (${shift.time})`}</td>
                  <td>
                    {assigned.length > 0
                      ? assigned.map(s => getEmployeeName(s.employee_id)).join(', ')
                      : 'No one assigned'}
                  </td>
                </tr>
              );
            })
          ) : (
            leaves.length === 0 ? (
              <tr><td colSpan="3">No leaves on this day</td></tr>
            ) : (
              leaves.map(leave => (
                <tr key={`${leave.employee_id}-${leave.date}`}>
                  <td>{getEmployeeName(leave.employee_id)}</td>
                  <td>{leave.reason || 'On Leave'}</td>
                  <td>
                    <span
                      onClick={() => handleDeleteLeave(leave.employee_id, leave.date)}
                      style={{
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '4px'
                      }}
                      title="Delete leave"
                    >
                      {/* Trash icon SVG */}
                      <svg xmlns="http://www.w3.org/2000/svg"
                        width="25"
                        height="25"
                        fill="red"
                        viewBox="0 0 24 24">
                        <path d="M3 6h18v2H3V6zm2 3h14v13H5V9zm5-6h4v2h-4V3z" />
                      </svg>
                    </span>
                  </td>

                </tr>
              ))
            )
          )}

        </tbody>
      </table>
    </section>
  );
}
