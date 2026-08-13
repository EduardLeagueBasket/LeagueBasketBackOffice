import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiGet } from "../../api/api";
import {
  NATIONAL_MATCHES_API_PATH,
  normalizeNationalMatchesList,
} from "../../utils/nationalMatchApi";
import { axiosErrorToMessage } from "../../utils/apiErrorMessage";

export const getNationalGames = createAsyncThunk(
  'nationalGames/getAll',
  async (params = {}, thunkAPI) => {
    try {
      const response = await apiGet(NATIONAL_MATCHES_API_PATH, params);
      return normalizeNationalMatchesList(response);
    } catch (error) {
      return thunkAPI.rejectWithValue(axiosErrorToMessage(error));
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