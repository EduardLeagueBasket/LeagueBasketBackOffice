import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiPost } from "../../api/api";

export const createTeamSlice = createSlice({
  name: 'createTeam',
  initialState: {
    loading: false,
    error: null,
    success: false,
  },
  reducers: {
    resetCreateTeamState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createTeam.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTeam.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(createTeam.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const createTeam = createAsyncThunk(
  'teams/create',
  async (data, thunkAPI) => {
    try {
      const response = await apiPost('/teams', data);
      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  });