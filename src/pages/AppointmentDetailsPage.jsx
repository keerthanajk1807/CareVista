import { Link, useParams } from "react-router-dom";
import useAppointmentContext from "../Components/context/useAppointmentContext.js";
export default function AppointmentDetailsPage() {
  const {
    id
  } = useParams();
  const {
    appointments = []
  } = useAppointmentContext();
  const appointment = appointments.find(item => String(item.id) === id);
  if (!appointment) {
    return <section className="router-page">
        <h2>Appointment not found</h2>
        <Link to="/appointments">Back to Appointments</Link>
      </section>;
  }
  return <section className="router-page">
      <h1>Appointment Details</h1>
      <p><strong>Appointment ID:</strong> {appointment.id}</p>
      <p><strong>Doctor:</strong> {appointment.doctorName}</p>
      <p><strong>Patient:</strong> {appointment.patientName}</p>
      <p><strong>Phone:</strong> {appointment.phone}</p>
      <p><strong>Date:</strong> {appointment.date}</p>
      <p><strong>Time:</strong> {appointment.time}</p>
      <Link className="router-button" to="/patient/appointments">
        Patient Appointments
      </Link>
    </section>;
}
