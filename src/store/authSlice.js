// src/store/authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiPost, apiPut } from '../api/api';

const storedUser = localStorage.getItem('user');

// ✅ Thunk para login
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ email, password }, thunkAPI) => {
    try {
      await new Promise((res) => setTimeout(res, 1000)); // Simula delay
      const response = await apiPost('/login', { email, password });
      localStorage.setItem('user', JSON.stringify(response)); // guardamos inmediatamente
      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue('Error al iniciar sesión');
    }
  }
);

// ✅ Thunk para actualizar contraseña
export const updatePassword = createAsyncThunk(
  'auth/updatePassword',
  async ({ userId, newPassword }, thunkAPI) => {
    try {
      await apiPut(`/update-password`, { newPassword, userId });

      // Actualizar el usuario en localStorage y estado para que requiredChangePassword sea false
      const currentUser = JSON.parse(localStorage.getItem('user'));
      const updatedUser = {
        ...currentUser,
        requiredChangePassword: false,
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return updatedUser;
    } catch (error) {
      // Manejar errores de validación del backend
      if (error.response?.data?.message) {
        const errorMessages = Array.isArray(error.response.data.message)
          ? error.response.data.message
          : [error.response.data.message];
        return thunkAPI.rejectWithValue(errorMessages);
      }
      return thunkAPI.rejectWithValue(['Error actualizando contraseña']);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: storedUser ? JSON.parse(storedUser) : null,
    loading: false,
    error: null,
    success: false,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      localStorage.removeItem('user');
      state.error = null;
      state.success = false;
    },
    clearAuthState: (state) => {
      state.error = null;
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.success = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updatePassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePassword.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.success = true;
      })
      .addCase(updatePassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout, clearAuthState } = authSlice.actions;
export default authSlice.reducer;
