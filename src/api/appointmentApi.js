import api from "./api";
export const fetchAppointments = () => api.get("/appointments").then(res => res.data);
export const createAppointment = data => api.post("/appointments", data).then(res => res.data);
export const rescheduleAppointment = (id, data) => api.patch(`/appointments/${id}`, data).then(res => res.data);
export const cancelAppointment = id => api.delete(`/appointments/${id}`).then(res => res.data);
export const fetchAppointmentHistory = () => api.get("/appointments/history").then(res => res.data);
