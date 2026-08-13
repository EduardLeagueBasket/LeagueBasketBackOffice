import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { adminPath, apiGet, apiPostFormData } from '../../api/api';

const PUBLISHERS_PATH = adminPath('/content/publishers');

export const getPublishers = createAsyncThunk(
  'publishers/getPublishers',
  async (entityType, thunkAPI) => {
    try {
      const params = entityType ? { entityType } : {};
      return await apiGet(PUBLISHERS_PATH, params);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          'No se pudieron cargar los publishers',
      );
    }
  },
);

export const createPublisher = createAsyncThunk(
  'publishers/createPublisher',
  async ({ displayName, file, isVerified = true }, thunkAPI) => {
    try {
      const formData = new FormData();
      formData.append('displayName', displayName);
      formData.append('isVerified', String(isVerified));
      if (file) formData.append('file', file);
      return await apiPostFormData(PUBLISHERS_PATH, formData);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          'No se pudo crear el publisher',
      );
    }
  },
);

const publishersSlice = createSlice({
  name: 'publishers',
  initialState: {
    items: [],
    loading: false,
    creating: false,
    error: null,
  },
  reducers: {
    clearPublishersError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getPublishers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPublishers.fulfilled, (state, action) => {
        state.loading = false;
        state.items = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(getPublishers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Error al listar publishers';
      })
      .addCase(createPublisher.pending, (state) => {
        state.creating = true;
        state.error = null;
      })
      .addCase(createPublisher.fulfilled, (state, action) => {
        state.creating = false;
        if (action.payload) {
          state.items = [action.payload, ...state.items];
        }
      })
      .addCase(createPublisher.rejected, (state, action) => {
        state.creating = false;
        state.error = action.payload || 'Error al crear publisher';
      });
  },
});

export const { clearPublishersError } = publishersSlice.actions;
export default publishersSlice.reducer;
