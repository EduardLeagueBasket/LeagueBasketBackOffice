import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { adminPath, apiGet } from "../../api/api";

const normalizeListResponse = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  return [];
};

export const getNationalTeams = createAsyncThunk(
  'nationalTeams/getAll',
  async (params = {}, thunkAPI) => {
    try {
      const response = await apiGet(adminPath('/national-teams/teams'), params);
      return normalizeListResponse(response);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const getNationalTeamsSlice = createSlice({
  name: 'nationalTeams',
  initialState: {
    nationalTeams: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearNationalTeams: (state) => {
      state.nationalTeams = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getNationalTeams.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getNationalTeams.fulfilled, (state, action) => {
        state.loading = false;
        state.nationalTeams = action.payload || [];
        state.error = null;
      })
      .addCase(getNationalTeams.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearNationalTeams } = getNationalTeamsSlice.actions;
export default getNationalTeamsSlice.reducer; 