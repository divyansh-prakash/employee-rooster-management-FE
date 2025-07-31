export default function RosterTable() {
  return (
    <section className="roster-container">
      <h2>Weekly Roster</h2>
      <p>Showing schedule for <strong id="current-date">{new Date().toLocaleDateString()}</strong></p>
      <table id="roster-table">
        <thead>
          <tr>
            <th>Employee</th>
            <th>Schedule</th>
          </tr>
        </thead>
        <tbody id="roster-body">
          {/* Sample Static Row - Dynamic data to be added later */}
          <tr>
            <td>Ramesh</td>
            <td>Day (05:00 AM - 02:00 PM)</td>
          </tr>
        </tbody>
      </table>
    </section>
  );
}
