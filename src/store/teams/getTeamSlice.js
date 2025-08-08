import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiGet } from "../../api/api";

export const getTeamByManager = createAsyncThunk('teams/getTeamByManager', async (params = {}, thunkAPI) => {
  try {
    const response = await apiGet('/teams/by-manager', params);
    return response;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data || error.message);
  }
});

export const getTeamSlice = createSlice({
  name: 'team',
  initialState: {
    team: {},
    loading: false,
    error: null,
  },
  reducers: {
    setTeam: (state, action) => {
      state.team = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getTeamByManager.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTeamByManager.fulfilled, (state, action) => {
        state.loading = false;
        state.team = action.payload;
        state.error = null;
      })
      .addCase(getTeamByManager.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setTeam } = getTeamSlice.actions;
export default getTeamSlice.reducer;