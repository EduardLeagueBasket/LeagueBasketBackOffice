import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { adminPath, apiGet } from '../api/api';

export const getUserDetail = createAsyncThunk(
  'userDetail', async (id, thunkAPI) => {
    try {
      const response = await apiGet(adminPath(`/users/${id}`));
      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue('Error al obtener el usuario');
    }
  }
);

const userDetailSlice = createSlice({
  name: 'userDetail',
  initialState: {
    user: null,
    loading: false,
    error: null,
  },
  extraReducers: (builder) => {
    builder
      .addCase(getUserDetail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserDetail.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(getUserDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
  }
});

export default userDetailSlice.reducer;