import { AppointmentCard } from "../Components/UI";
import { useDispatch } from 'react-redux';
import { loadAppointments } from '../store/appointmentSlice';
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import useAppointmentContext from "../Components/context/useAppointmentContext.js";
import { RequestState, RescheduleForm } from "./shared.jsx";
export default function AppointmentsPage() {
  const {
    appointments = [],
    cancelAppointment,
    loading,
    error
  } = useAppointmentContext();
  const dispatch = useDispatch();
  const [editing, setEditing] = useState(null),
    [localError, setLocalError] = useState('');
  useEffect(() => {
    dispatch(loadAppointments());
  }, [dispatch]);
  return <section className="router-page"><h1>Appointments</h1><RequestState loading={loading} error={localError || error} />
 <button className="router-button secondary" disabled={loading} onClick={() => dispatch(loadAppointments())}>Refresh</button>
 {!loading && !appointments.length && <p>No appointments booked yet.</p>}
 {appointments.map(item => <AppointmentCard appointment={item} key={item.id}>
 <Link className="router-button" to={`/appointment/${item.id}`}>View Details</Link>
 {item.status !== 'Cancelled' && <><button className="router-button secondary" disabled={loading} onClick={() => setEditing(item.id)}>Reschedule</button><button className="router-button secondary" disabled={loading} onClick={async () => {
          setLocalError('');
          try {
            await cancelAppointment(item.id);
          } catch (e) {
            setLocalError(String(e));
          }
        }}>Cancel</button></>}
 {editing === item.id && item.status !== 'Cancelled' && <RescheduleForm item={item} onDone={() => setEditing(null)} />}</AppointmentCard>)}</section>;
}
