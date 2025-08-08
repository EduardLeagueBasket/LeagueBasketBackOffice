import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { apiGet } from '../../api/api';

export const getManagerLeague = createAsyncThunk('league/getManagerLeague', async (params = {}, thunkAPI) => {
  try {
    const response = await apiGet('/leagues/manager', params);
    return response;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data || error.message);
  }
});

export const getLeagueSlice = createSlice({
  name: 'managerLeague',
  initialState: {
    managerLeague: {},
    loading: false,
    error: null,
  },
  reducers: {
    setManagerLeague: (state, action) => {
      state.managerLeague = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getManagerLeague.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getManagerLeague.fulfilled, (state, action) => {
        state.loading = false;
        state.managerLeague = action.payload;
        state.error = null;
      })
      .addCase(getManagerLeague.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setManagerLeague } = getLeagueSlice.actions;
export default getLeagueSlice.reducer;