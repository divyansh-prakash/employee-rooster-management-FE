import AddShiftForm from './components/AddShiftForm';
import TrackLeaveForm from './components/TrackLeaveForm';
import RosterTable from './components/RosterTable';

export default function App() {
  return (
    <>
      <header>
        <h1>Workforce Roster</h1>
      </header>
      <main>
        <section className="forms-container">
          <AddShiftForm />
          <TrackLeaveForm />
        </section>
        <RosterTable />
      </main>
    </>
  );
}
