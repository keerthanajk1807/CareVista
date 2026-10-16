import { useState, useEffect, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from '../context/AuthContext';
import { loadAppointments, bookAppointment as book, updateAppointment, removeAppointment, setDraft, clearDraft } from '../../store/appointmentSlice';
import { invalidateAvailability } from '../../api/cache';
export default function useAppointments() {
  const dispatch = useDispatch(),
    {
      user
    } = useAuth();
  const state = useSelector(s => s.appointments);
  const [bookingStatus, setBookingStatus] = useState(''),
    [reminder, setReminder] = useState('');
  const [clock, setClock] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setClock(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    if (user) dispatch(loadAppointments());
  }, [dispatch, user]);
  const today = clock.toISOString().slice(0, 10);
  const upcomingAppointments = useMemo(() => state.items.filter(a => a.date >= today && a.status !== 'Cancelled'), [state.items, today]);
  const appointmentHistory = useMemo(() => state.items.filter(a => a.date < today || a.status === 'Cancelled' || a.status === 'Completed'), [state.items, today]);
  const appointmentCount = useMemo(() => state.items.length, [state.items]);
  useEffect(() => {
    if (!user) return;
    try {
      sessionStorage.setItem('carevistaAppointments:' + user.id, JSON.stringify(state.items));
    } catch {
      console.info('Browser appointment snapshot unavailable.');
    }
  }, [state.items, user]);
  useEffect(() => {
    const minutes = time => {
      const [clock, part] = time.split(' ');
      const [hours, mins] = clock.split(':').map(Number);
      return (hours % 12 + (part === 'PM' ? 12 : 0)) * 60 + mins;
    };
    const nearest = [...upcomingAppointments].sort((a, b) => a.date.localeCompare(b.date) || minutes(a.time) - minutes(b.time))[0];
    setReminder(nearest ? 'Next appointment: ' + nearest.doctorName + ' on ' + nearest.date + ' at ' + nearest.time : '');
  }, [upcomingAppointments]);
  const mutate = useCallback(async action => {
    const result = await dispatch(action).unwrap();
    invalidateAvailability();
    return result;
  }, [dispatch]);
  const bookAppointment = useCallback(async details => {
    const result = await mutate(book(details));
    setBookingStatus('Appointment booked successfully!');
    return result;
  }, [mutate]);
  const rescheduleAppointment = useCallback(async (id, data) => {
    const result = await mutate(updateAppointment({
      id,
      data
    }));
    setBookingStatus('Appointment rescheduled');
    return result;
  }, [mutate]);
  const cancelAppointment = useCallback(async id => {
    const result = await mutate(removeAppointment(id));
    setBookingStatus('Appointment cancelled');
    return result;
  }, [mutate]);
  const selectTimeSlot = useCallback(time => dispatch(setDraft({
    time
  })), [dispatch]);
  const setSelectedDate = useCallback(date => dispatch(setDraft({
    date,
    time: ''
  })), [dispatch]);
  const clearAppointment = useCallback(() => {
    dispatch(clearDraft());
    setBookingStatus('');
  }, [dispatch]);
  return {
    appointments: state.items,
    loading: state.loading,
    error: state.error,
    appointmentCount,
    upcomingAppointments,
    appointmentHistory,
    bookingStatus,
    reminder,
    bookAppointment,
    rescheduleAppointment,
    cancelAppointment,
    selectTimeSlot,
    clearAppointment,
    selectedDate: state.draft.date || '',
    selectedTime: state.draft.time || '',
    setSelectedDate
  };
}
