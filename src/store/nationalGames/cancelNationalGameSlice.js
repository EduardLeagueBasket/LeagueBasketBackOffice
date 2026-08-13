import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { apiPatch } from '../../api/api';
import {
  NATIONAL_MATCHES_API_PATH,
  normalizeNationalMatchFromApi,
} from '../../utils/nationalMatchApi';
import { axiosErrorToMessage } from '../../utils/apiErrorMessage';

export const cancelNationalGame = createAsyncThunk(
  'nationalGames/cancel',
  async (id, thunkAPI) => {
    try {
      const response = await apiPatch(
        `${NATIONAL_MATCHES_API_PATH}/${id}/cancel`,
        {},
      );
      return normalizeNationalMatchFromApi(response);
    } catch (error) {
      return thunkAPI.rejectWithValue(axiosErrorToMessage(error));
    }
  },
);

export const cancelNationalGameSlice = createSlice({
  name: 'cancelNationalGame',
  initialState: {
    loading: false,
    error: null,
    success: false,
  },
  reducers: {
    resetCancelNationalGameState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(cancelNationalGame.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelNationalGame.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(cancelNationalGame.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetCancelNationalGameState } =
  cancelNationalGameSlice.actions;
export default cancelNationalGameSlice.reducer;
