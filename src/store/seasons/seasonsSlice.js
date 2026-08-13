import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { apiGet, apiPatch, apiPost } from '../../api/api';
import {
  SEASONS_API,
  buildCreateSeasonBody,
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
      return await apiPost(`${SEASONS_API}/${id}/activate`, {}, {
        params: { competitionId },
      });
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

const seasonsSlice = createSlice({
  name: 'seasons',
  initialState: {
    list: [],
    loading: false,
    saving: false,
    error: null,
  },
  reducers: {},
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
        state.list = state.list.map((s) => ({
          ...s,
          isActive: s.id === action.payload?.id,
        }));
      });
  },
});

export default seasonsSlice.reducer;
