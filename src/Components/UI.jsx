export function Button({
  secondary = false,
  className = '',
  ...props
}) {
  return <button className={'router-button ' + (secondary ? 'secondary ' : '') + className} {...props} />;
}
export function Input({
  label,
  id,
  ...props
}) {
  return <><label htmlFor={id}>{label}</label><input id={id} {...props} /></>;
}
export function TimeSlot({
  time,
  selected,
  disabled,
  onSelect
}) {
  return <Button type="button" secondary={!selected} aria-pressed={selected} disabled={disabled} onClick={() => onSelect(time)}>{time}</Button>;
}
export function AppointmentCard({
  appointment,
  children
}) {
  return <article className="router-card"><h2>{appointment.doctorName}</h2><p>{appointment.patientName} · {appointment.date} · {appointment.time}</p><p>Status: {appointment.status}</p>{children}</article>;
}
export function Loading() {
  return <p role="status">Loading…</p>;
}
