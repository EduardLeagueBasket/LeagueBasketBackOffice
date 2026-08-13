import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { adminPath, apiGet, apiPostFormData } from '../api/api';

const normalizeListResponse = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  return [];
};

export const getCatalogCountries = createAsyncThunk(
  'catalogCountries/getAll',
  async (_, thunkAPI) => {
    try {
      const response = await apiGet(adminPath('/countries'));
      return normalizeListResponse(response);
    } catch (error) {
      return thunkAPI.rejectWithValue(error?.response?.data || error?.message);
    }
  }
);

export const createCatalogCountry = createAsyncThunk(
  'catalogCountries/create',
  async ({ name, countryName, countryCode, file }, thunkAPI) => {
    try {
      const fd = new FormData();
      if (file) fd.append('file', file);
      fd.append('name', name);
      fd.append('countryName', countryName);
      fd.append('countryCode', countryCode);

      const response = await apiPostFormData(adminPath('/countries'), fd);
      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(error?.response?.data || error?.message);
    }
  }
);

const catalogCountriesSlice = createSlice({
  name: 'catalogCountries',
  initialState: {
    countries: [],
    loading: false,
    error: null,
    creating: false,
    createError: null,
  },
  reducers: {
    clearCatalogCountriesErrors: (state) => {
      state.error = null;
      state.createError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getCatalogCountries.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCatalogCountries.fulfilled, (state, action) => {
        state.loading = false;
        state.countries = action.payload || [];
      })
      .addCase(getCatalogCountries.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Error cargando países';
      })
      .addCase(createCatalogCountry.pending, (state) => {
        state.creating = true;
        state.createError = null;
      })
      .addCase(createCatalogCountry.fulfilled, (state, action) => {
        state.creating = false;
        // Si el backend devuelve el país creado, lo agregamos arriba
        if (action.payload?.id) state.countries = [action.payload, ...state.countries];
      })
      .addCase(createCatalogCountry.rejected, (state, action) => {
        state.creating = false;
        state.createError = action.payload || 'Error creando país';
      });
  },
});

export const { clearCatalogCountriesErrors } = catalogCountriesSlice.actions;
export default catalogCountriesSlice.reducer;
