import { memo } from 'react';
import { Link } from 'react-router-dom';
import DoctorAvatar from './DoctorAvatar';
export default memo(function DoctorCard({
  doctor,
  onViewProfile,
  route = false
}) {
  return <article className={route ? 'router-card' : 'doctor-card'}>
  <h2><DoctorAvatar doctor={doctor} /> {doctor.name}</h2>
  <p>Specialty: {doctor.specialty}</p><p>{doctor.experience} years experience</p>
  <p>⭐ {doctor.rating} | Consultation Fee: ₹{doctor.fee}</p>
  <p>{doctor.availability || (doctor.available ? 'Available' : 'Unavailable')}</p>
  {route ? <Link className="router-button" to={'/doctor/' + doctor.id} onClick={() => onViewProfile?.(doctor)}>View Profile</Link> : <button onClick={() => onViewProfile?.(doctor)}>View Profile</button>}
 </article>;
});
