import useAppointmentContext from "../Components/context/useAppointmentContext.js";
export default function PatientUpcoming() {
  const {
    upcomingAppointments: upcoming = []
  } = useAppointmentContext();
  return <div>
      <h2>Upcoming Appointments</h2>
      {upcoming.length ? upcoming.map(item => <p key={item.id}>{item.doctorName} — {item.date} — {item.time}</p>) : <p>No upcoming appointments.</p>}
    </div>;
}
