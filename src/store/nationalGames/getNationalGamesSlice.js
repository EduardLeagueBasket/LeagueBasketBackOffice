import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiGet } from "../../api/api";

export const getNationalGames = createAsyncThunk(
  'nationalGames/getAll',
  async (params = {}, thunkAPI) => {
    try {
      const response = await apiGet('/national-games', params);
      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const getNationalGamesSlice = createSlice({
  name: 'nationalGames',
  initialState: {
    nationalGames: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearNationalGames: (state) => {
      state.nationalGames = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getNationalGames.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getNationalGames.fulfilled, (state, action) => {
        state.loading = false;
        state.nationalGames = action.payload;
        state.error = null;
      })
      .addCase(getNationalGames.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearNationalGames } = getNationalGamesSlice.actions;
export default getNationalGamesSlice.reducer; 