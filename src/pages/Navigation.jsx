import { useAuth } from '../Components/context/AuthContext';
import { NavLink } from "react-router-dom";
export default function Header() {
  const {
    logout
  } = useAuth();
  return <header className="router-header">
      <h2>CareVista Hospital</h2>
      <nav>
        <NavLink to="/">Home</NavLink>
        <NavLink to="/doctors">Doctors</NavLink>
        <NavLink to="/appointments">Appointments</NavLink>
        <NavLink to="/patient">Patient Dashboard</NavLink>
        <button className="router-button secondary" onClick={logout}>Logout</button>
      </nav>
    </header>;
}
