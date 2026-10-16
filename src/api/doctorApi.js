import { cached } from "./cache";
import api from "./api";
export const fetchDoctors = (params = {}) => cached("doctors:" + JSON.stringify(params), () => api.get("/doctors", {
  params
}).then(res => res.data));
export const fetchDoctorById = id => cached("doctor:" + id, () => api.get(`/doctors/${id}`).then(res => res.data));
export const fetchDoctorAvailability = (id, date) => cached(`availability:${id}:${date || ""}`, () => api.get(`/doctors/${id}/availability`, {
  params: date ? {
    date
  } : {}
}).then(res => res.data), 15000);
