import { Link } from "react-router-dom";
import useAppointmentContext from "../Components/context/useAppointmentContext.js";
export default function PatientHome() {
  const {
    appointments = [],
    reminder
  } = useAppointmentContext();
  return <div className="router-card">
      <h2>Welcome, Patient!</h2>
      {reminder && <p role="status">{reminder}</p>}<p>Total appointments: {appointments.length}</p>
      <Link to="/patient/appointments">View your appointments</Link>
    </div>;
}
