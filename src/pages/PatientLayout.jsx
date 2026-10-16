import { NavLink, Outlet } from "react-router-dom";
export default function PatientLayout() {
  return <section className="router-page">
      <h1>Patient Dashboard</h1>
      <nav className="patient-nav">
        <NavLink to="/patient" end>Dashboard</NavLink>
        <NavLink to="/patient/appointments">Appointments</NavLink>
        <NavLink to="/patient/upcoming">Upcoming</NavLink>
        <NavLink to="/patient/history">History</NavLink>
        <NavLink to="/patient/profile">Profile</NavLink>
      </nav>
      <Outlet />
    </section>;
}
