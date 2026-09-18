import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { adminPath, apiGet, apiPatchFormData, apiPostFormData } from '../api/api';

const normalizeListResponse = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  return [];
};

export const getCompetitions = createAsyncThunk(
  'competitions/getAll',
  async (_, thunkAPI) => {
    try {
      const response = await apiGet(adminPath('/competitions'));
      return normalizeListResponse(response);
    } catch (error) {
      return thunkAPI.rejectWithValue(error?.response?.data || error?.message);
    }
  }
);

export const createCompetition = createAsyncThunk(
  'competitions/create',
  async ({ name, type, gender, season, countryId, managerUserId, file }, thunkAPI) => {
    try {
      const fd = new FormData();
      if (file) fd.append('file', file);
      fd.append('name', name);
      fd.append('type', type);
      if (gender) fd.append('gender', gender);
      if (season) fd.append('season', season);
      fd.append('countryId', countryId);
      if (managerUserId) fd.append('managerUserId', managerUserId);

      const response = await apiPostFormData(adminPath('/competitions'), fd);
      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(error?.response?.data || error?.message);
    }
  }
);

export const getCompetitionById = createAsyncThunk(
  'competitions/getById',
  async (id, thunkAPI) => {
    try {
      const response = await apiGet(adminPath(`/competitions/${id}`));
      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(error?.response?.data || error?.message);
    }
  }
);

export const updateCompetition = createAsyncThunk(
  'competitions/update',
  async ({ id, data }, thunkAPI) => {
    try {
      const fd = new FormData();
      if (data.file) fd.append('file', data.file);
      if (data.name != null) fd.append('name', data.name);
      if (data.type != null) fd.append('type', data.type);
      if (data.gender) fd.append('gender', data.gender);
      if (data.season) fd.append('season', data.season);
      if (data.countryId != null) fd.append('countryId', data.countryId);
      if (data.managerUserId != null) fd.append('managerUserId', data.managerUserId);
      if (data.isActive !== undefined && data.isActive !== null) {
        fd.append('isActive', String(Boolean(data.isActive)));
      }

      const response = await apiPatchFormData(adminPath(`/competitions/${id}`), fd);
      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(error?.response?.data || error?.message);
    }
  }
);

export const deactivateCompetition = createAsyncThunk(
  'competitions/deactivate',
  async (id, thunkAPI) => {
    try {
      const fd = new FormData();
      fd.append('isActive', 'false');
      const response = await apiPatchFormData(adminPath(`/competitions/${id}`), fd);
      return { id, response };
    } catch (error) {
      return thunkAPI.rejectWithValue(error?.response?.data || error?.message);
    }
  }
);

const competitionsSlice = createSlice({
  name: 'competitions',
  initialState: {
    competitions: [],
    loading: false,
    error: null,
    creating: false,
    createError: null,
    competition: null,
    loadingOne: false,
    loadingOneError: null,
    updating: false,
    updateError: null,
    updateSuccess: false,
  },
  reducers: {
    clearCompetitionsErrors: (state) => {
      state.error = null;
      state.createError = null;
      state.loadingOneError = null;
      state.updateError = null;
      state.updateSuccess = false;
    },
    clearSelectedCompetition: (state) => {
      state.competition = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getCompetitions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCompetitions.fulfilled, (state, action) => {
        state.loading = false;
        state.competitions = action.payload || [];
      })
      .addCase(getCompetitions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Error cargando competencias';
      })
      .addCase(createCompetition.pending, (state) => {
        state.creating = true;
        state.createError = null;
      })
      .addCase(createCompetition.fulfilled, (state, action) => {
        state.creating = false;
        if (action.payload?.id) state.competitions = [action.payload, ...state.competitions];
      })
      .addCase(createCompetition.rejected, (state, action) => {
        state.creating = false;
        state.createError = action.payload || 'Error creando competencia';
      })
      .addCase(getCompetitionById.pending, (state) => {
        state.loadingOne = true;
        state.loadingOneError = null;
      })
      .addCase(getCompetitionById.fulfilled, (state, action) => {
        state.loadingOne = false;
        state.competition = action.payload || null;
      })
      .addCase(getCompetitionById.rejected, (state, action) => {
        state.loadingOne = false;
        state.loadingOneError = action.payload || 'Error cargando competencia';
      })
      .addCase(updateCompetition.pending, (state) => {
        state.updating = true;
        state.updateError = null;
        state.updateSuccess = false;
      })
      .addCase(updateCompetition.fulfilled, (state, action) => {
        state.updating = false;
        state.updateSuccess = true;
        state.competition = action.payload || state.competition;
        if (action.payload?.id) {
          state.competitions = state.competitions.map((c) => (c.id === action.payload.id ? action.payload : c));
        }
      })
      .addCase(updateCompetition.rejected, (state, action) => {
        state.updating = false;
        state.updateError = action.payload || 'Error actualizando competencia';
      })
      .addCase(deactivateCompetition.pending, (state) => {
        state.updating = true;
        state.updateError = null;
      })
      .addCase(deactivateCompetition.fulfilled, (state, action) => {
        state.updating = false;
        const id = action.payload?.id;
        if (id) {
          state.competitions = state.competitions.map((c) => (c.id === id ? { ...c, isActive: false } : c));
          if (state.competition?.id === id) state.competition = { ...state.competition, isActive: false };
        }
      })
      .addCase(deactivateCompetition.rejected, (state, action) => {
        state.updating = false;
        state.updateError = action.payload || 'Error desactivando competencia';
      });
  },
});

export const { clearCompetitionsErrors, clearSelectedCompetition } = competitionsSlice.actions;
export default competitionsSlice.reducer;
