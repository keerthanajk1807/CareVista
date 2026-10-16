import api from "./api";
export async function loginPatient(data) {
  const result = await api.post("/auth/login", data);
  localStorage.setItem("medislotToken", result.data.token);
  localStorage.setItem("carevistaUser", JSON.stringify(result.data.user));
  return result.data;
}
export async function signUpPatient(data) {
  const result = await api.post("/auth/signup", data);
  return result.data;
}
export async function logoutPatient() {
  try {
    await api.post("/auth/logout");
  } finally {
    localStorage.removeItem("medislotToken");
    localStorage.removeItem("carevistaUser");
  }
}
