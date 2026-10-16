import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AppointmentContext from './AppointmentContext';
import { loadDoctors } from '../../store/doctorSlice';
import useAppointments from '../hooks/useAppointments';
export function AppointmentProvider({
  children
}) {
  const dispatch = useDispatch(),
    doctorState = useSelector(s => s.doctors);
  const appointmentData = useAppointments();
  useEffect(() => {
    dispatch(loadDoctors());
  }, [dispatch]);
  const value = useMemo(() => ({
    ...appointmentData,
    doctors: doctorState.items,
    doctorLoading: doctorState.loading,
    doctorError: doctorState.error
  }), [appointmentData, doctorState]);
  return <AppointmentContext.Provider value={value}>{children}</AppointmentContext.Provider>;
}
