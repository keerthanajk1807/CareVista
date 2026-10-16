import { Loading } from "../Components/UI";
import { fetchDoctorAvailability } from '../api/doctorApi';
import { useState, useEffect } from "react";
import useAppointmentContext from "../Components/context/useAppointmentContext.js";
export function RequestState({
  loading,
  error
}) {
  return <>{loading && <Loading />}{error && <p className="router-error" role="alert">{error}</p>}</>;
}
export function useAvailability(id, date) {
  const [data, setData] = useState(null),
    [loading, setLoading] = useState(false),
    [error, setError] = useState('');
  useEffect(() => {
    if (!id) return;
    let active = true;
    setLoading(true);
    setData(null);
    setError('');
    fetchDoctorAvailability(id, date).then(value => {
      if (active) setData(value);
    }).catch(e => {
      if (active) setError(e.response?.data?.message || e.message);
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [id, date]);
  return {
    data,
    loading,
    error
  };
}
export function RescheduleForm({
  item,
  onDone
}) {
  const [date, setDate] = useState(item.date),
    [time, setTime] = useState(item.time),
    [error, setError] = useState('');
  const {
    rescheduleAppointment,
    loading
  } = useAppointmentContext();
  const availability = useAvailability(item.doctorId, date);
  async function submit(e) {
    e.preventDefault();
    setError('');
    try {
      await rescheduleAppointment(item.id, {
        date,
        time
      });
      onDone();
    } catch (e) {
      setError(String(e));
    }
  }
  return <form onSubmit={submit}><h3>Reschedule Appointment</h3><RequestState loading={availability.loading || loading} error={error || availability.error} />
 <select aria-label="New date" value={date} onChange={e => {
      setDate(e.target.value);
      setTime('');
    }}>{(availability.data?.dates || [date]).map(d => <option key={d}>{d}</option>)}</select>
 <select aria-label="New time slot" value={time} onChange={e => setTime(e.target.value)}><option value="">Select time</option>{(availability.data?.slots || []).map(t => <option key={t} disabled={availability.data.bookedSlots.includes(t) && !(date === item.date && t === item.time)}>{t}</option>)}</select>
 <button className="router-button" disabled={loading || availability.loading || !availability.data || !time}>Save Changes</button><button type="button" className="router-button secondary" onClick={onDone}>Back</button></form>;
}
