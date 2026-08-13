import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { apiGet, apiPost } from '../../api/api';
import {
  MANAGER_LEAGUE_MATCHES_API,
  buildCreateLeagueMatchBody,
} from '../../utils/leagueMatchApi';

export const getManagerLeagueGames = createAsyncThunk(
  'managerLeagueGames/getAll',
  async (_, thunkAPI) => {
    try {
      const response = await apiGet(MANAGER_LEAGUE_MATCHES_API);
      return response?.data ?? response ?? [];
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const createManagerLeagueGame = createAsyncThunk(
  'managerLeagueGames/create',
  async (payload, thunkAPI) => {
    try {
      const body = buildCreateLeagueMatchBody(payload);
      return await apiPost(MANAGER_LEAGUE_MATCHES_API, body);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  },
);

const managerLeagueGamesSlice = createSlice({
  name: 'managerLeagueGames',
  initialState: {
    list: [],
    loading: false,
    saving: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getManagerLeagueGames.pending, (state) => {
        state.loading = true;
      })
      .addCase(getManagerLeagueGames.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(getManagerLeagueGames.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createManagerLeagueGame.pending, (state) => {
        state.saving = true;
      })
      .addCase(createManagerLeagueGame.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(createManagerLeagueGame.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      });
  },
});

export default managerLeagueGamesSlice.reducer;
