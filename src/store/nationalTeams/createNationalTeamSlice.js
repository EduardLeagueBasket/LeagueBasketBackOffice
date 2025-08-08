import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiPost } from "../../api/api";

export const createNationalTeam = createAsyncThunk(
  'nationalTeams/create',
  async (data, thunkAPI) => {
    try {
      const response = await apiPost('/national-teams', data);
      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createNationalTeamSlice = createSlice({
  name: 'createNationalTeam',
  initialState: {
    loading: false,
    error: null,
    success: false,
  },
  reducers: {
    resetCreateNationalTeamState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createNationalTeam.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createNationalTeam.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(createNationalTeam.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetCreateNationalTeamState } = createNationalTeamSlice.actions;
export default createNationalTeamSlice.reducer; 