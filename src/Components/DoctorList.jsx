import DoctorCard from './DoctorCard';
export default function DoctorList({
  doctors = [],
  onViewProfile
}) {
  return <div className="router-grid">{doctors.map(doctor => <DoctorCard key={doctor.id} doctor={doctor} route onViewProfile={onViewProfile} />)}</div>;
}
