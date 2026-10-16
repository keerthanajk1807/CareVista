import { memo } from 'react';
export default memo(function DoctorAvatar({
  doctor
}) {
  return doctor.photoUrl ? <img src={doctor.photoUrl} alt={doctor.name} width="64" height="64" loading="lazy" decoding="async" /> : <span aria-hidden="true">{doctor.image || '👨‍⚕️'}</span>;
});
