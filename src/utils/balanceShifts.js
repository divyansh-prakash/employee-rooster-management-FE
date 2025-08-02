import { supabase } from '../lib/supabaseClient.js';
import { SHIFT_PRIORITY } from '../constants/shiftPriority.js';

export async function rebalanceShifts(date, onLeaveIds = []) {
  try {
    const { data: assignments, error } = await supabase
      .from('shifts')
      .select('employee_id, shift_type')
      .eq('date', date);

    if (error) throw error;

    // Step 1: Build initial shift map excluding leave employees
    const shiftMap = {};
    for (const { employee_id, shift_type } of assignments) {
      if (!shiftMap[shift_type]) shiftMap[shift_type] = [];
      if (!onLeaveIds.includes(employee_id)) {
        shiftMap[shift_type].push(employee_id);
      }
    }

    // Step 2: Attempt to balance shifts
    // Convert priority to numeric (for sorting and comparison)
    const allShifts = SHIFT_PRIORITY;

    const getShiftCount = (shift) => shiftMap[shift]?.length || 0;

    let changed = true;
    while (changed) {
      changed = false;

      for (let i = 0; i < allShifts.length; i++) {
        const currentShift = allShifts[i];
        for (let j = allShifts.length - 1; j > i; j--) {
          const donorShift = allShifts[j];

          const currentCount = getShiftCount(currentShift);
          const donorCount = getShiftCount(donorShift);

          // If current (higher) shift has fewer people than donor (lower) shift
          if (currentCount < donorCount) {
            const donorEmployees = shiftMap[donorShift];

            // Don't empty the donor shift unless all shifts below are already empty
            if (donorEmployees.length === 1) {
              const lowerShifts = allShifts.slice(j + 1);
              const allEmpty = lowerShifts.every(s => getShiftCount(s) === 0);
              if (!allEmpty) continue;
            }

            const movedEmp = donorEmployees.shift();
            if (!shiftMap[currentShift]) shiftMap[currentShift] = [];
            shiftMap[currentShift].push(movedEmp);
            changed = true;
            break; // Re-evaluate after each change
          }
        }

        if (changed) break; // restart loop if change was made
      }
    }

    // Step 3: Delete all current assignments of on-leave and promoted employees
    const toDelete = new Set(onLeaveIds);

    const allEmpAssignments = Object.entries(shiftMap).flatMap(([shift, emps]) =>
      emps.map(emp => ({ emp, shift }))
    );

    for (const { emp, shift } of allEmpAssignments) {
      const original = assignments.find(a => a.employee_id === emp);
      if (original && original.shift_type !== shift) {
        toDelete.add(emp);
      }
    }

    for (const empId of toDelete) {
      await supabase.from('shifts').delete().match({ date, employee_id: empId });
    }

    // Step 4: Insert new assignments
    const newAssignments = [];

    for (const [shift, emps] of Object.entries(shiftMap)) {
      for (const emp of emps) {
        const original = assignments.find(a => a.employee_id === emp);
        if (!original || original.shift_type !== shift) {
          newAssignments.push({
            date,
            employee_id: emp,
            shift_type: shift,
          });
        }
      }
    }

    if (newAssignments.length > 0) {
      const { error: insertErr } = await supabase.from('shifts').insert(newAssignments);
      if (insertErr) console.error('Insert error:', insertErr);
    }

    return newAssignments;
  } catch (err) {
    console.error('rebalanceShifts error:', err);
  }
}
