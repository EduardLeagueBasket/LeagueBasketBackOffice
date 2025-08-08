import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiPost } from "../../api/api";

export const createNationalGame = createAsyncThunk(
  'nationalGames/create',
  async (data, thunkAPI) => {
    try {
      const response = await apiPost('/national-games', data);
      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createNationalGameSlice = createSlice({
  name: 'createNationalGame',
  initialState: {
    loading: false,
    error: null,
    success: false,
  },
  reducers: {
    resetCreateNationalGameState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createNationalGame.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createNationalGame.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(createNationalGame.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetCreateNationalGameState } = createNationalGameSlice.actions;
export default createNationalGameSlice.reducer; 