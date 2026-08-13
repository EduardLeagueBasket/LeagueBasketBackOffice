import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiPatch, apiGet } from "../../api/api";
import {
  NATIONAL_MATCHES_API_PATH,
  buildUpdateNationalMatchBody,
  normalizeNationalMatchFromApi,
} from "../../utils/nationalMatchApi";
import { axiosErrorToMessage } from "../../utils/apiErrorMessage";

export const updateNationalGame = createAsyncThunk(
  'nationalGames/update',
  async ({ id, data }, thunkAPI) => {
    try {
      const body = buildUpdateNationalMatchBody(data);
      const response = await apiPatch(
        `${NATIONAL_MATCHES_API_PATH}/${id}`,
        body,
      );
      return normalizeNationalMatchFromApi(response);
    } catch (error) {
      return thunkAPI.rejectWithValue(axiosErrorToMessage(error));
    }
  }
);

export const getNationalGameById = createAsyncThunk(
  'nationalGames/getById',
  async (id, thunkAPI) => {
    try {
      const response = await apiGet(`${NATIONAL_MATCHES_API_PATH}/${id}`);
      return normalizeNationalMatchFromApi(response);
    } catch (error) {
      return thunkAPI.rejectWithValue(axiosErrorToMessage(error));
    }
  }
);

export const updateNationalGameSlice = createSlice({
  name: 'updateNationalGame',
  initialState: {
    nationalGame: null,
    loading: false,
    error: null,
    success: false,
  },
  reducers: {
    resetUpdateNationalGameState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
    },
    clearNationalGame: (state) => {
      state.nationalGame = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(updateNationalGame.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateNationalGame.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(updateNationalGame.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getNationalGameById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getNationalGameById.fulfilled, (state, action) => {
        state.loading = false;
        state.nationalGame = action.payload;
        state.error = null;
      })
      .addCase(getNationalGameById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetUpdateNationalGameState, clearNationalGame } = updateNationalGameSlice.actions;
export default updateNationalGameSlice.reducer; 