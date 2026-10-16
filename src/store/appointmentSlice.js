import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchAppointments, createAppointment, rescheduleAppointment, cancelAppointment, fetchAppointmentHistory } from "../api/appointmentApi.js";
const getError = error => error.response?.data?.message || error.message || "Request failed";
export const loadAppointments = createAsyncThunk("appointments/load", async (_, {
  rejectWithValue
}) => {
  try {
    return await fetchAppointments();
  } catch (error) {
    return rejectWithValue(getError(error));
  }
});
export const bookAppointment = createAsyncThunk("appointments/book", async (data, {
  rejectWithValue
}) => {
  try {
    return await createAppointment(data);
  } catch (error) {
    return rejectWithValue(getError(error));
  }
});
export const updateAppointment = createAsyncThunk("appointments/update", async ({
  id,
  data
}, {
  rejectWithValue
}) => {
  try {
    return await rescheduleAppointment(id, data);
  } catch (error) {
    return rejectWithValue(getError(error));
  }
});
export const removeAppointment = createAsyncThunk("appointments/cancel", async (id, {
  rejectWithValue
}) => {
  try {
    return await cancelAppointment(id);
  } catch (error) {
    return rejectWithValue(getError(error));
  }
});
export const loadAppointmentHistory = createAsyncThunk("appointments/history", async (_, {
  rejectWithValue
}) => {
  try {
    return await fetchAppointmentHistory();
  } catch (error) {
    return rejectWithValue(getError(error));
  }
});
const appointmentSlice = createSlice({
  name: "appointments",
  initialState: {
    items: [],
    history: [],
    draft: {},
    loading: false,
    error: null
  },
  reducers: {
    setDraft(state, action) {
      state.draft = {
        ...state.draft,
        ...action.payload
      };
    },
    clearDraft(state) {
      state.draft = {};
    }
  },
  extraReducers: builder => {
    builder.addCase(loadAppointments.fulfilled, (state, a) => {
      state.items = a.payload.appointments;
    }).addCase(loadAppointmentHistory.fulfilled, (state, a) => {
      state.history = a.payload.appointments;
    }).addCase(bookAppointment.fulfilled, (state, a) => {
      state.items.push(a.payload.appointment);
      state.draft = {};
    }).addCase(updateAppointment.fulfilled, (state, a) => {
      state.items = state.items.map(x => x.id === a.payload.appointment.id ? a.payload.appointment : x);
    }).addCase(removeAppointment.fulfilled, (state, a) => {
      state.items = state.items.map(x => x.id === a.payload.appointment.id ? a.payload.appointment : x);
    }).addMatcher(a => a.type.startsWith('appointments/') && a.type.endsWith('/pending'), state => {
      state.loading = true;
      state.error = null;
    }).addMatcher(a => a.type.startsWith('appointments/') && a.type.endsWith('/fulfilled'), state => {
      state.loading = false;
    }).addMatcher(a => a.type.startsWith('appointments/') && a.type.endsWith('/rejected'), (state, a) => {
      state.loading = false;
      state.error = a.payload || a.error.message;
    });
  }
});
export const {
  setDraft,
  clearDraft
} = appointmentSlice.actions;
export default appointmentSlice.reducer;
