import { useMemo, useCallback } from 'react';
import { TimeSlot, Input } from '../Components/UI';
import { useDispatch } from 'react-redux';
import { setDraft } from '../store/appointmentSlice';
import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import useAppointmentContext from "../Components/context/useAppointmentContext.js";
import { RequestState, useAvailability } from "./shared.jsx";
export default function BookAppointmentPage() {
  const {
    doctors = [],
    bookAppointment,
    loading,
    selectTimeSlot: saveTimeSlot
  } = useAppointmentContext();
  const location = useLocation();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [patientName, setPatientName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const doctor = doctors.find(item => String(item.id) === String(location.state?.doctorId)) || doctors[0];
  const availability = useAvailability(doctor?.id, date);
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(setDraft({
      doctorId: doctor?.id,
      date,
      time,
      patientName,
      phone
    }));
  }, [dispatch, doctor?.id, date, time, patientName, phone]);
  const availableTimeSlots = useMemo(() => (availability.data?.slots || []).filter(slot => !availability.data?.bookedSlots.includes(slot)), [availability.data]);
  const appointmentSummary = useMemo(() => ({
    doctor: doctor?.name,
    patientName,
    date,
    time,
    fee: doctor?.fee,
    duration: 30
  }), [doctor, patientName, date, time]);
  const selectTimeSlot = useCallback(value => {
    setTime(value);
    saveTimeSlot?.(value);
  }, [saveTimeSlot]);
  if (!doctor) {
    return <section className="router-page">
        <p>No doctors available.</p>
        <Link to="/doctors">Browse Doctors</Link>
      </section>;
  }
  const nextStep = () => {
    setError("");
    if (step === 1 && (!date || !availability.data?.dates.includes(date))) {
      setError("Please select an appointment date.");
      return;
    }
    if (step === 2 && (!time || !availableTimeSlots.includes(time))) {
      setError("Please select a time slot.");
      return;
    }
    if (step === 3 && (!patientName.trim() || !/^[0-9]{10}$/.test(phone))) {
      setError("Enter patient name and a valid 10-digit phone number.");
      return;
    }
    setStep(step + 1);
  };
  const confirmBooking = async () => {
    setError('');
    try {
      await bookAppointment({
        doctorId: doctor.id,
        patientName: patientName.trim(),
        phone,
        date,
        time
      });
      setStep(5);
    } catch (e) {
      setError(typeof e === 'string' ? e : 'Booking failed. Please try again.');
    }
  };
  return <section className="router-page">
      <h1>Book Appointment</h1>
      <p>Doctor: <strong>{doctor.name}</strong> — ₹{doctor.fee}</p>
      <p>Step {step} of 5</p>
      <RequestState loading={availability.loading || loading} error={availability.error} />

      {step === 1 && <div className="router-card">
          <h2>1. Select Date</h2>
          <select aria-label="Appointment date" value={date} onChange={e => {
        setDate(e.target.value);
        setTime('');
      }}><option value="">Select available date</option>{(availability.data?.dates || []).map(d => <option key={d}>{d}</option>)}</select>
          <button className="router-button" onClick={nextStep}>
            Continue
          </button>
        </div>}

      {step === 2 && <div className="router-card">
          <h2>2. Select Time Slot</h2>
          <div className="router-grid">
            {(availability.data?.slots || []).map(slot => <TimeSlot key={slot} time={slot} selected={time === slot} disabled={availability.loading || availability.data?.bookedSlots.includes(slot)} onSelect={selectTimeSlot} />)}
            {!availability.loading && !availableTimeSlots.length && <p>No time slots available</p>}

          </div>
          <button className="router-button" onClick={nextStep}>Continue</button>
          <button className="router-button secondary" onClick={() => setStep(1)}>Back</button>
        </div>}

      {step === 3 && <div className="router-card">
          <h2>3. Patient Details</h2>
          <Input label="Patient Name" id="patient-name" maxLength={80} value={patientName} onChange={e => setPatientName(e.target.value)} placeholder="Enter patient name" />
          <Input label="Phone Number" id="patient-phone" type="tel" inputMode="numeric" maxLength={10} value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, ''))} placeholder="10-digit phone number" />
          <button className="router-button" onClick={nextStep}>
            Review Appointment
          </button>
          <button className="router-button secondary" onClick={() => setStep(2)}>Back</button>
        </div>}

      {step === 4 && <div className="router-card">
          <h2>4. Appointment Summary</h2>
          <p><strong>Doctor:</strong> {doctor.name}</p>
          <p><strong>Specialty:</strong> {doctor.specialty}</p>
          <p><strong>Patient:</strong> {patientName}</p>
          <p><strong>Phone:</strong> {phone}</p>
          <p><strong>Date:</strong> {date}</p>
          <p><strong>Time:</strong> {time}</p>
          <p><strong>Fee:</strong> ₹{appointmentSummary.fee}</p><p><strong>Duration:</strong> {appointmentSummary.duration} minutes</p>
          <button className="router-button" disabled={loading} onClick={confirmBooking}>
            Confirm Booking
          </button>
          <button className="router-button secondary" onClick={() => setStep(3)}>Back</button>
        </div>}

      {step === 5 && <div className="router-card">
          <h2>5. Booking Confirmation</h2>
          <p>Your appointment has been booked successfully!</p>
          <p>{doctor.name} · {date} · {time}</p>
          <button className="router-button" onClick={() => navigate("/appointments")}>
            View Appointments
          </button>
          <button className="router-button secondary" onClick={() => navigate("/patient")}>
            Patient Dashboard
          </button>
        </div>}

      {error && <p className="router-error">{error}</p>}
    </section>;
}
