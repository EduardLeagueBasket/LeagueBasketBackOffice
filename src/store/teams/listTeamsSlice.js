import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { adminPath, apiGet } from '../../api/api';

export const getTeams = createAsyncThunk(
  'teamsList/getTeams',
  async (params = {}, thunkAPI) => {
    try {
      const response = await apiGet(adminPath('/teams'), params);
      return Array.isArray(response) ? response : [];
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const listTeamsSlice = createSlice({
  name: 'teamsList',
  initialState: {
    teams: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getTeams.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTeams.fulfilled, (state, action) => {
        state.loading = false;
        state.teams = action.payload;
      })
      .addCase(getTeams.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default listTeamsSlice.reducer;
