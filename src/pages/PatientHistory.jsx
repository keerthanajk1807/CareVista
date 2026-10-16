import { useDispatch, useSelector } from 'react-redux';
import { loadAppointmentHistory } from '../store/appointmentSlice';
import { useEffect } from "react";
import { RequestState } from "./shared.jsx";
export default function PatientHistory() {
  const dispatch = useDispatch();
  const {
    history,
    loading,
    error
  } = useSelector(s => s.appointments);
  useEffect(() => {
    dispatch(loadAppointmentHistory());
  }, [dispatch]);
  return <div>
      <h2>Appointment History</h2><RequestState loading={loading} error={error} />
      {history.length ? history.map(item => <p key={item.id}>{item.doctorName} — {item.date} — {item.time} — {item.status}</p>) : <p>No past appointments found.</p>}
    </div>;
}
