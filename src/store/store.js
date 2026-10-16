import { configureStore, createListenerMiddleware, combineReducers } from "@reduxjs/toolkit";
import doctorReducer from "./doctorSlice.js";
import appointmentReducer from "./appointmentSlice.js";
const listenerMiddleware = createListenerMiddleware();
listenerMiddleware.startListening({
  predicate: action => action.type.startsWith("appointments/") || action.type.startsWith("doctors/"),
  effect: async action => {
    console.log("Store action:", action.type);
  }
});
const store = configureStore({
  reducer: (state, action) => combineReducers({
    doctors: doctorReducer,
    appointments: appointmentReducer
  })(action.type === "session/clear" ? undefined : state, action),
  middleware: getDefaultMiddleware => getDefaultMiddleware().prepend(listenerMiddleware.middleware)
});
export default store;
