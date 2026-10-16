import { Link } from "react-router-dom";
export default function NotFoundPage() {
  return <section className="router-page">
      <h1>404 - Page Not Found</h1>
      <Link to="/">Return Home</Link>
    </section>;
}
