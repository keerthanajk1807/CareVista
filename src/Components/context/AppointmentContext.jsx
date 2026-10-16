import { createContext, useContext } from "react";
const AppointmentContext = createContext(null);
export function useAppointmentContext() {
  const context = useContext(AppointmentContext);
  if (context === null) {
    throw new Error("useAppointmentContext must be used inside AppointmentProvider");
  }
  return context;
}
export default AppointmentContext;
