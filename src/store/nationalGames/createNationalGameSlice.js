import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiPost } from "../../api/api";
import {
  NATIONAL_MATCHES_API_PATH,
  buildCreateNationalMatchBody,
  normalizeNationalMatchFromApi,
} from "../../utils/nationalMatchApi";
import { axiosErrorToMessage } from "../../utils/apiErrorMessage";

export const createNationalGame = createAsyncThunk(
  'nationalGames/create',
  async (data, thunkAPI) => {
    try {
      const body = buildCreateNationalMatchBody(data);
      const response = await apiPost(NATIONAL_MATCHES_API_PATH, body);
      return normalizeNationalMatchFromApi(response);
    } catch (error) {
      return thunkAPI.rejectWithValue(axiosErrorToMessage(error));
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