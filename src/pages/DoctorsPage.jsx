import { useRef, useEffect } from 'react';
import useAppointmentContext from '../Components/context/useAppointmentContext';
import useDoctors from '../Components/hooks/useDoctors';
import DoctorList from '../Components/DoctorList';
import SearchBar from '../Components/SearchBar';
import FilterPanel from '../Components/FilterPanel';
import { RequestState } from './shared';
export default function DoctorsPage() {
  const {
    doctors = [],
    doctorLoading,
    doctorError
  } = useAppointmentContext();
  const filters = useDoctors(doctors),
    searchRef = useRef(null);
  useEffect(() => {
    searchRef.current?.focus();
  }, []);
  return <section className="router-page"><h1>Our Doctors</h1>
 <SearchBar ref={searchRef} value={filters.search} onChange={filters.setSearch} />
 <FilterPanel filters={filters} />
 <RequestState loading={filters.loading || doctorLoading} error={filters.error || doctorError} />
 <DoctorList doctors={filters.doctors} onViewProfile={filters.selectDoctor} />
 {!filters.loading && !filters.error && !filters.doctors.length && <p>No doctors found.</p>}
 </section>;
}
