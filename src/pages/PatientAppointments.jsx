import { Link } from "react-router-dom";
import useAppointmentContext from "../Components/context/useAppointmentContext.js";
export default function PatientAppointments() {
  const {
    appointments = []
  } = useAppointmentContext();
  return <div>
      <h2>All Appointments</h2>
      {appointments.length ? appointments.map(item => <p key={item.id}>
          <Link to={`/appointment/${item.id}`}>
            {item.doctorName} — {item.date} — {item.time}
          </Link>
        </p>) : <p>No appointments found.</p>}
    </div>;
}
