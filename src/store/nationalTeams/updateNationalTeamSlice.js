import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { adminPath, apiPatch, apiGet, apiDelete } from "../../api/api";

export const updateNationalTeam = createAsyncThunk(
  'nationalTeams/update',
  async ({ id, data }, thunkAPI) => {
    try {
      const response = await apiPatch(adminPath(`/national-teams/teams/${id}`), data);
      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const getNationalTeamById = createAsyncThunk(
  'nationalTeams/getById',
  async (id, thunkAPI) => {
    try {
      const response = await apiGet(adminPath(`/national-teams/teams/${id}`));
      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deactivateNationalTeam = createAsyncThunk(
  'nationalTeams/deactivate',
  async (id, thunkAPI) => {
    try {
      const response = await apiDelete(adminPath(`/national-teams/teams/${id}`));
      return { id, response };
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateNationalTeamSlice = createSlice({
  name: 'updateNationalTeam',
  initialState: {
    nationalTeam: null,
    loading: false,
    error: null,
    success: false,
  },
  reducers: {
    resetUpdateNationalTeamState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
    },
    clearNationalTeam: (state) => {
      state.nationalTeam = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(updateNationalTeam.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateNationalTeam.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(updateNationalTeam.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getNationalTeamById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getNationalTeamById.fulfilled, (state, action) => {
        state.loading = false;
        state.nationalTeam = action.payload;
        state.error = null;
      })
      .addCase(getNationalTeamById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deactivateNationalTeam.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deactivateNationalTeam.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(deactivateNationalTeam.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetUpdateNationalTeamState, clearNationalTeam } = updateNationalTeamSlice.actions;
export default updateNationalTeamSlice.reducer; 