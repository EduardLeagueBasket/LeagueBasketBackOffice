// src/store/authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { adminPath, apiPost } from '../api/api';

const storedUser = localStorage.getItem('user');

/** Perfiles válidos para el backoffice (alineados con auth-ms `LIST_PROFILES`). USER es solo app móvil. */
const BACKOFFICE_PROFILES = new Set([
  'ADMIN',
  'SUPER_ADMIN',
  'MANAGER_LEAGUE',
  'MANAGER_TEAM',
  'PLAYER',
  'ASISTANT_TEAM',
  'ASISTANT_LEAGUE',
  'COACH',
  'MANAGER_NATIONAL_TEAM',
  'ASISTANT_NATIONAL_TEAM',
]);

const isBackofficeUser = (user) => {
  const profileName = user?.profile?.name;
  return typeof profileName === 'string' && BACKOFFICE_PROFILES.has(profileName);
};

// ✅ Thunk para login
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ email, password }, thunkAPI) => {
    try {
      const response = await apiPost('/auth/login', { email, password });
      if (!isBackofficeUser(response)) {
        return thunkAPI.rejectWithValue(
          'Acceso restringido: tu perfil no tiene permisos para el panel.',
        );
      }
      localStorage.setItem('user', JSON.stringify(response)); // guardamos inmediatamente
      return response;
    } catch (error) {
      const backendMessage = error?.response?.data?.message;
      if (backendMessage) {
        if (Array.isArray(backendMessage)) return thunkAPI.rejectWithValue(backendMessage.join(', '));
        if (typeof backendMessage === 'string') return thunkAPI.rejectWithValue(backendMessage);
      }
      return thunkAPI.rejectWithValue('Error al iniciar sesión');
    }
  }
);

// ✅ Thunk para actualizar contraseña
export const updatePassword = createAsyncThunk(
  'auth/updatePassword',
  async ({ userId, newPassword }, thunkAPI) => {
    try {
      await apiPost(adminPath('/auth/update-password'), {
        newPassword,
        userId,
      });

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
    user: (() => {
      if (!storedUser) return null;
      try {
        const parsed = JSON.parse(storedUser);
        if (!isBackofficeUser(parsed)) {
          localStorage.removeItem('user');
          return null;
        }
        return parsed;
      } catch {
        localStorage.removeItem('user');
        return null;
      }
    })(),
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
