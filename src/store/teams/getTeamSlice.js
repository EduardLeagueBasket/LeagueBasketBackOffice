import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { adminPath, apiGet, apiPatchFormData } from "../../api/api";

export const getTeamByManager = createAsyncThunk('teams/getTeamByManager', async (params = {}, thunkAPI) => {
  try {
    const response = await apiGet(adminPath('/teams/by-manager'), params);
    return response;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data || error.message);
  }
});

export const updateTeam = createAsyncThunk(
  'teams/updateTeam',
  async ({ teamId, formData }, thunkAPI) => {
    try {
      const response = await apiPatchFormData(adminPath(`/teams/${teamId}`), formData);
      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  },
);

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
      })
      .addCase(updateTeam.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTeam.fulfilled, (state, action) => {
        state.loading = false;
        state.team = action.payload;
        state.error = null;
      })
      .addCase(updateTeam.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setTeam } = getTeamSlice.actions;
export default getTeamSlice.reducer;