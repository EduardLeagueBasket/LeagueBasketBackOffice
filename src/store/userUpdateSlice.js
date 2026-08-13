import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { adminPath, apiPatch } from '../api/api';

export const userUpdateSlice = createSlice({
  name: 'userUpdate',
  initialState: {
    userUpdate: null,
    loading: false,
    error: null,
  },
  reducers: {
    setUserUpdate: (state, action) => {
      state.userUpdate = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(userUpdate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(userUpdate.fulfilled, (state, action) => {
        state.loading = false;
        state.userUpdate = action.payload;
      })
      .addCase(userUpdate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const userUpdate = createAsyncThunk('userUpdate', async (data, thunkAPI) => {
  try {
    const { id, ...rest } = data;
    const response = await apiPatch(adminPath(`/users/${id}`), rest);
    return response;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data || error.message);
  }
});
