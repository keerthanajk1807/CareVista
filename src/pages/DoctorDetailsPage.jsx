import DoctorAvatar from "../Components/DoctorAvatar";
import { fetchDoctorById } from '../api/doctorApi';
import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { RequestState } from "./shared.jsx";
export default function DoctorDetailsPage() {
  const {
    id
  } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null),
    [loading, setLoading] = useState(true),
    [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    fetchDoctorById(id).then(d => {
      if (active) setDoctor(d);
    }).catch(e => {
      if (active) setError(e.response?.data?.message || e.message);
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [id]);
  if (loading || error) return <section className="router-page"><RequestState loading={loading} error={error} /></section>;
  if (!doctor) {
    return <section className="router-page">
        <h2>Doctor not found</h2>
        <Link to="/doctors">Back to Doctors</Link>
      </section>;
  }
  return <section className="router-page">
      <h1><DoctorAvatar doctor={doctor} /> {doctor.name}</h1>
      <p><strong>Specialty:</strong> {doctor.specialty}</p>
      <p><strong>Qualification:</strong> {doctor.qualification || "MBBS"}</p>
      <p><strong>Experience:</strong> {doctor.experience} years</p>
      <p><strong>Rating:</strong> ⭐ {doctor.rating}</p>
      <p><strong>Consultation Fee:</strong> ₹{doctor.fee}</p>
      <p><strong>Available Days:</strong> {(doctor.availableDays || []).join(", ")}</p>
      <p><strong>Time Slots:</strong> {(doctor.timeSlots || []).join(", ")}</p>
      <button className="router-button" onClick={() => navigate("/book-appointment", {
      state: {
        doctorId: doctor.id
      }
    })}>
        Book Appointment
      </button>
      <button className="router-button secondary" onClick={() => navigate("/doctors")}>
        Back to Doctors
      </button>
    </section>;
}
