import { useState, useEffect, useMemo, useCallback } from 'react';
import { fetchDoctors } from '../../api/doctorApi';
export default function useDoctors(initialDoctors = []) {
  const [items, setItems] = useState(initialDoctors),
    [search, setSearch] = useState(''),
    [specialty, setSpecialty] = useState('All');
  const [maxFee, setMaxFee] = useState(''),
    [minRating, setMinRating] = useState('0'),
    [availability, setAvailability] = useState('All');
  const [selectedDoctor, setSelectedDoctor] = useState(null),
    [loading, setLoading] = useState(true),
    [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    const timer = setTimeout(() => {
      fetchDoctors(search || specialty !== 'All' ? {
        search,
        specialty
      } : {}).then(data => {
        if (active) setItems(data);
      }).catch(e => {
        if (active) setError(e.response?.data?.message || e.message);
      }).finally(() => {
        if (active) setLoading(false);
      });
    }, 250);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [search, specialty]);
  const doctors = useMemo(() => items.filter(d => (maxFee === '' || d.fee <= Number(maxFee)) && d.rating >= Number(minRating) && (availability === 'All' || d.availability === availability)), [items, maxFee, minRating, availability]);
  const specialties = useMemo(() => [...new Set(initialDoctors.map(d => d.specialty))], [initialDoctors]);
  const selectDoctor = useCallback(doctor => setSelectedDoctor(doctor), []);
  const clearFilters = useCallback(() => {
    setSearch('');
    setSpecialty('All');
    setMaxFee('');
    setMinRating('0');
    setAvailability('All');
  }, []);
  return {
    doctors,
    specialties,
    search,
    setSearch,
    specialty,
    setSpecialty,
    maxFee,
    setMaxFee,
    minRating,
    setMinRating,
    availability,
    setAvailability,
    selectedDoctor,
    selectDoctor,
    clearFilters,
    loading,
    error
  };
}
