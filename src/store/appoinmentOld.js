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
    loading: false,
    error: null
  },
  reducers: {
    clearAppointmentError(state) {
      state.error = null;
    }
  },
  extraReducers: builder => {
    builder.addCase(loadAppointments.pending, state => {
      state.loading = true;
      state.error = null;
    }).addCase(loadAppointments.fulfilled, (state, action) => {
      state.loading = false;
      state.items = action.payload.appointments || action.payload;
    }).addCase(loadAppointments.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    }).addCase(bookAppointment.fulfilled, (state, action) => {
      const item = action.payload.appointment || action.payload;
      state.items.push(item);
    }).addCase(bookAppointment.rejected, (state, action) => {
      state.error = action.payload;
    }).addCase(updateAppointment.fulfilled, (state, action) => {
      const updated = action.payload.appointment || action.payload;
      state.items = state.items.map(item => String(item.id) === String(updated.id) ? updated : item);
    }).addCase(updateAppointment.rejected, (state, action) => {
      state.error = action.payload;
    }).addCase(removeAppointment.fulfilled, (state, action) => {
      const updated = action.payload.appointment || action.payload;
      state.items = state.items.map(item => String(item.id) === String(action.meta.arg) ? updated : item);
    }).addCase(removeAppointment.rejected, (state, action) => {
      state.error = action.payload;
    }).addCase(loadAppointmentHistory.fulfilled, (state, action) => {
      state.history = action.payload.appointments || action.payload;
    }).addCase(loadAppointmentHistory.rejected, (state, action) => {
      state.error = action.payload;
    });
  }
});
export const {
  clearAppointmentError
} = appointmentSlice.actions;
export default appointmentSlice.reducer;
