import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { apiGet, apiPatch, apiPost } from '../../api/api';
import {
  LEAGUE_MATCHES_API,
  normalizeLeagueMatchesList,
  buildBulkLeagueMatchesBody,
  buildCreateLeagueMatchBody,
} from '../../utils/leagueMatchApi';

export const getLeagueGames = createAsyncThunk(
  'leagueGames/getAll',
  async ({ competitionId, seasonId } = {}, thunkAPI) => {
    try {
      const response = await apiGet(LEAGUE_MATCHES_API, {
        competitionId,
        seasonId,
      });
      return normalizeLeagueMatchesList(response);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const createLeagueGame = createAsyncThunk(
  'leagueGames/create',
  async (payload, thunkAPI) => {
    try {
      const body = buildCreateLeagueMatchBody(payload);
      return await apiPost(LEAGUE_MATCHES_API, body);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const bulkCreateLeagueGames = createAsyncThunk(
  'leagueGames/bulkCreate',
  async (payload, thunkAPI) => {
    try {
      const body = buildBulkLeagueMatchesBody(payload);
      return await apiPost(`${LEAGUE_MATCHES_API}/bulk`, body);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const updateLeagueGame = createAsyncThunk(
  'leagueGames/update',
  async ({ id, data }, thunkAPI) => {
    try {
      return await apiPatch(`${LEAGUE_MATCHES_API}/${id}`, data);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  },
);

const leagueGamesSlice = createSlice({
  name: 'leagueGames',
  initialState: {
    list: [],
    loading: false,
    saving: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getLeagueGames.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getLeagueGames.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(getLeagueGames.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createLeagueGame.pending, (state) => {
        state.saving = true;
      })
      .addCase(createLeagueGame.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(createLeagueGame.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      })
      .addCase(bulkCreateLeagueGames.pending, (state) => {
        state.saving = true;
      })
      .addCase(bulkCreateLeagueGames.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(bulkCreateLeagueGames.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      })
      .addCase(updateLeagueGame.pending, (state) => {
        state.saving = true;
      })
      .addCase(updateLeagueGame.fulfilled, (state, action) => {
        state.saving = false;
        const idx = state.list.findIndex((m) => m.id === action.payload?.id);
        if (idx >= 0) state.list[idx] = action.payload;
      })
      .addCase(updateLeagueGame.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      });
  },
});

export default leagueGamesSlice.reducer;
