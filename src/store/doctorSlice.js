import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchDoctors } from "../api/doctorApi";
export const loadDoctors = createAsyncThunk("doctors/load", async (params = {}, {
  rejectWithValue
}) => {
  try {
    return await fetchDoctors(params);
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Unable to load doctors");
  }
});
const doctorSlice = createSlice({
  name: "doctors",
  initialState: {
    items: [],
    loading: false,
    error: null,
    lastFetched: null
  },
  reducers: {
    clearDoctorCache(state) {
      state.lastFetched = null;
    }
  },
  extraReducers: builder => {
    builder.addCase(loadDoctors.pending, state => {
      state.loading = true;
      state.error = null;
    }).addCase(loadDoctors.fulfilled, (state, action) => {
      state.loading = false;
      state.items = Array.isArray(action.payload) ? action.payload : action.payload.doctors || [];
      state.lastFetched = Date.now();
    }).addCase(loadDoctors.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || action.error.message;
    });
  }
});
export const {
  clearDoctorCache
} = doctorSlice.actions;
export default doctorSlice.reducer;
