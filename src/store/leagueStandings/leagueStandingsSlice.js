import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { apiGet, apiPost } from '../../api/api';
import {
  LEAGUE_STANDINGS_API,
  normalizeStandingsList,
} from '../../utils/leagueStandingsApi';

export const getLeagueStandings = createAsyncThunk(
  'leagueStandings/getAll',
  async ({ competitionId, seasonId }, thunkAPI) => {
    try {
      const response = await apiGet(LEAGUE_STANDINGS_API, {
        competitionId,
        seasonId,
      });
      return normalizeStandingsList(response);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const recalculateLeagueStandings = createAsyncThunk(
  'leagueStandings/recalculate',
  async ({ competitionId, seasonId }, thunkAPI) => {
    try {
      const response = await apiPost(`${LEAGUE_STANDINGS_API}/recalculate`, {
        competitionId,
        seasonId,
      });
      return normalizeStandingsList(response);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  },
);

const leagueStandingsSlice = createSlice({
  name: 'leagueStandings',
  initialState: {
    list: [],
    loading: false,
    recalculating: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getLeagueStandings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getLeagueStandings.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(getLeagueStandings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(recalculateLeagueStandings.pending, (state) => {
        state.recalculating = true;
        state.error = null;
      })
      .addCase(recalculateLeagueStandings.fulfilled, (state, action) => {
        state.recalculating = false;
        state.list = action.payload;
      })
      .addCase(recalculateLeagueStandings.rejected, (state, action) => {
        state.recalculating = false;
        state.error = action.payload;
      });
  },
});

export default leagueStandingsSlice.reducer;
