import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  apiDelete,
  apiGet,
  apiPatch,
  apiPost,
  apiPut,
} from '../../api/api';
import {
  SEASONS_API,
  buildCreateSeasonBody,
  normalizeSeasonTeams,
  normalizeSeasonsList,
} from '../../utils/seasonApi';

export const getSeasons = createAsyncThunk(
  'seasons/getByCompetition',
  async ({ competitionId }, thunkAPI) => {
    try {
      const response = await apiGet(SEASONS_API, { competitionId });
      return normalizeSeasonsList(response);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const createSeason = createAsyncThunk(
  'seasons/create',
  async (payload, thunkAPI) => {
    try {
      const body = buildCreateSeasonBody(payload);
      return await apiPost(SEASONS_API, body);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const activateSeason = createAsyncThunk(
  'seasons/activate',
  async ({ id, competitionId }, thunkAPI) => {
    try {
      return await apiPost(
        `${SEASONS_API}/${id}/activate`,
        {},
        { params: { competitionId } },
      );
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const completeSeason = createAsyncThunk(
  'seasons/complete',
  async ({ id, competitionId }, thunkAPI) => {
    try {
      return await apiPost(
        `${SEASONS_API}/${id}/complete`,
        {},
        { params: { competitionId } },
      );
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const updateSeason = createAsyncThunk(
  'seasons/update',
  async ({ id, data }, thunkAPI) => {
    try {
      return await apiPatch(`${SEASONS_API}/${id}`, data);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const getSeasonTeams = createAsyncThunk(
  'seasons/getTeams',
  async (seasonId, thunkAPI) => {
    try {
      const response = await apiGet(`${SEASONS_API}/${seasonId}/teams`);
      return normalizeSeasonTeams(response);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const setSeasonTeams = createAsyncThunk(
  'seasons/setTeams',
  async ({ seasonId, teamIds }, thunkAPI) => {
    try {
      const response = await apiPut(`${SEASONS_API}/${seasonId}/teams`, {
        teamIds,
      });
      return normalizeSeasonTeams(response);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const removeSeasonTeam = createAsyncThunk(
  'seasons/removeTeam',
  async ({ seasonId, teamId }, thunkAPI) => {
    try {
      await apiDelete(`${SEASONS_API}/${seasonId}/teams/${teamId}`);
      return { seasonId, teamId };
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  },
);

const seasonsSlice = createSlice({
  name: 'seasons',
  initialState: {
    list: [],
    seasonTeams: [],
    loading: false,
    teamsLoading: false,
    saving: false,
    error: null,
  },
  reducers: {
    clearSeasonTeams: (state) => {
      state.seasonTeams = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getSeasons.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSeasons.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(getSeasons.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createSeason.pending, (state) => {
        state.saving = true;
      })
      .addCase(createSeason.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(createSeason.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      })
      .addCase(activateSeason.fulfilled, (state, action) => {
        const activeId = action.payload?.id;
        state.list = state.list.map((s) => {
          if (s.id === activeId) {
            return { ...s, status: 'ACTIVE', isActive: true };
          }
          if (s.status === 'ACTIVE' || s.isActive) {
            return { ...s, status: 'COMPLETED', isActive: false };
          }
          return s;
        });
      })
      .addCase(completeSeason.fulfilled, (state, action) => {
        const id = action.payload?.id;
        state.list = state.list.map((s) =>
          s.id === id ? { ...s, status: 'COMPLETED', isActive: false } : s,
        );
      })
      .addCase(getSeasonTeams.pending, (state) => {
        state.teamsLoading = true;
      })
      .addCase(getSeasonTeams.fulfilled, (state, action) => {
        state.teamsLoading = false;
        state.seasonTeams = action.payload;
      })
      .addCase(getSeasonTeams.rejected, (state, action) => {
        state.teamsLoading = false;
        state.error = action.payload;
      })
      .addCase(setSeasonTeams.pending, (state) => {
        state.saving = true;
      })
      .addCase(setSeasonTeams.fulfilled, (state, action) => {
        state.saving = false;
        state.seasonTeams = action.payload;
      })
      .addCase(setSeasonTeams.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      })
      .addCase(removeSeasonTeam.fulfilled, (state, action) => {
        state.seasonTeams = state.seasonTeams.filter(
          (st) => st.teamId !== action.payload.teamId,
        );
      });
  },
});

export const { clearSeasonTeams } = seasonsSlice.actions;
export default seasonsSlice.reducer;
