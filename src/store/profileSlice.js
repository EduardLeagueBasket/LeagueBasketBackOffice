// src/store/profileSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { adminPath, apiGet } from '../api/api';

// Thunk para obtener perfiles
export const getProfiles = createAsyncThunk(
  'profiles',
  async (_, thunkAPI) => {
    try {
      const response = await apiGet(adminPath('/profiles'));
      return response; // Aquí se espera que sea un array de perfiles
    } catch (error) {
      return thunkAPI.rejectWithValue('Error al obtener los perfiles');
    }
  }
);

const profileSlice = createSlice({
  name: 'profiles',
  initialState: {
    profiles: [],
    loading: false,
    error: null,
  },
  reducers: {
    // Puedes agregar reducers si necesitas manipular perfiles localmente
  },
  extraReducers: (builder) => {
    builder
      .addCase(getProfiles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProfiles.fulfilled, (state, action) => {
        state.loading = false;
        state.profiles = action.payload;
      })
      .addCase(getProfiles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default profileSlice.reducer;
