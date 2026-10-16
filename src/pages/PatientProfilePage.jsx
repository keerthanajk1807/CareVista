import { useAuth } from '../Components/context/AuthContext';
import useAppointmentContext from "../Components/context/useAppointmentContext.js";
export default function PatientProfilePage() {
  const {
    user
  } = useAuth();
  const {
    appointments = []
  } = useAppointmentContext();
  const latest = appointments[appointments.length - 1];
  return <div className="router-card">
      <h2>Patient Profile</h2>{user && <><p><strong>Patient ID:</strong> PAT-{user.id}</p><p><strong>Email:</strong> {user.email}</p></>}
      {latest ? <>
          <p><strong>Name:</strong> {latest.patientName}</p>
          <p><strong>Phone:</strong> {latest.phone}</p>
        </> : <p>Book an appointment to add patient details.</p>}
    </div>;
}
