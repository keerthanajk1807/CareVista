import { Link } from "react-router-dom";
export default function HomePage() {
  return <section className="router-page">
      <h1>Welcome to CareVista Hospital</h1>
      <p>Book appointments with experienced doctors easily.</p>
      <Link className="router-button" to="/doctors">
        Explore Doctors
      </Link>
    </section>;
}
