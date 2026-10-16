import ProtectedRoute from "./Components/ProtectedRoute";
import { useLocation } from "react-router-dom";
import { lazy, Suspense } from "react";
import { HashRouter } from "react-router-dom";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import Header from "./Components/Header";
import Footer from "./Components/Footer";
import HomePage from "./Components/Home";
import DoctorsPage from "./pages/DoctorsPage.jsx";
import PatientLayout from "./pages/PatientLayout.jsx";
import PatientHome from "./pages/PatientHome.jsx";
import PatientAppointments from "./pages/PatientAppointments.jsx";
import PatientUpcoming from "./pages/PatientUpcoming.jsx";
import PatientHistory from "./Components/AppointmentHistory";
import PatientProfilePage from "./Components/PatientProfile";
import NotFoundPage from "./pages/NotFoundPage.jsx";
import { AppointmentProvider } from "./Components/context/AppointmentProvider.jsx";
import { AuthProvider } from "./Components/context/AuthContext.jsx";
import AuthLogin from "./Components/AuthLogin.jsx";
import ErrorBoundary from "./Components/ErrorBoundary.jsx";
import "./App.css";
import { useAuth } from "./Components/context/AuthContext";
const DoctorDetailsPage = lazy(() => import("./pages/DoctorDetailsPage.jsx"));
const BookAppointmentPage = lazy(() => import("./pages/BookAppointmentPage.jsx"));
const AppointmentsPage = lazy(() => import("./pages/AppointmentsPage.jsx"));
const AppointmentDetailsPage = lazy(() => import("./pages/AppointmentDetailsPage.jsx"));
const Router = import.meta.env.VITE_ROUTER_MODE === "hash" ? HashRouter : BrowserRouter;
function LoginRoute() {
  const {
    isAuthenticated
  } = useAuth();
  const location = useLocation();
  const from = location.state?.from;
  const target = from && from.pathname !== '/login' ? from.pathname + from.search + from.hash : '/';
  return isAuthenticated ? <Navigate to={target} replace state={from?.state} /> : <AuthLogin />;
}
function PublicLayout() {
  return <>
      <Header />
      <Outlet />
      <Footer />
    </>;
}
export default function App() {
  return <ErrorBoundary>
      <AuthProvider>
        <AppointmentProvider>
          <Router>
            <Suspense fallback={<p className="router-page" role="status">Loading page…</p>}><Routes>
              <Route path="/login" element={<LoginRoute />} />

              <Route element={<ProtectedRoute />}>
                <Route element={<PublicLayout />}>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/doctors" element={<DoctorsPage />} />
                  <Route path="/doctor/:id" element={<DoctorDetailsPage />} />
                  <Route path="/book-appointment" element={<BookAppointmentPage />} />
                  <Route path="/appointments" element={<AppointmentsPage />} />
                  <Route path="/appointment/:id" element={<AppointmentDetailsPage />} />

                  <Route path="/patient" element={<PatientLayout />}>
                    <Route index element={<PatientHome />} />
                    <Route path="appointments" element={<PatientAppointments />} />
                    <Route path="upcoming" element={<PatientUpcoming />} />
                    <Route path="history" element={<PatientHistory />} />
                    <Route path="profile" element={<PatientProfilePage />} />
                  </Route>

                  <Route path="*" element={<NotFoundPage />} />
                </Route>
              </Route>

              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes></Suspense>
          </Router>
        </AppointmentProvider>
      </AuthProvider>
    </ErrorBoundary>;
}
