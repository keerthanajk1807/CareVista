function Dashboard({
  doctors,
  appointments
}) {
  const availableDoctors = doctors.filter(doctor => doctor.availability === "Available").length;
  return <section className="dashboard">
      <div className="dashboard-card">
        <span className="dashboard-icon">👨‍⚕️</span>
        <div>
          <h3>{doctors.length}</h3>
          <p>Total Doctors</p>
        </div>
      </div>

      <div className="dashboard-card">
        <span className="dashboard-icon">🟢</span>
        <div>
          <h3>{availableDoctors}</h3>
          <p>Available Doctors</p>
        </div>
      </div>

      <div className="dashboard-card">
        <span className="dashboard-icon">📅</span>
        <div>
          <h3>{appointments.length}</h3>
          <p>Appointments</p>
        </div>
      </div>
    </section>;
}
export default Dashboard;
