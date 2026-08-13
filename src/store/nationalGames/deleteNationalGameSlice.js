import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiDelete } from "../../api/api";
import { NATIONAL_MATCHES_API_PATH } from "../../utils/nationalMatchApi";
import { axiosErrorToMessage } from "../../utils/apiErrorMessage";

export const deleteNationalGame = createAsyncThunk(
  'nationalGames/delete',
  async (id, thunkAPI) => {
    try {
      const response = await apiDelete(`${NATIONAL_MATCHES_API_PATH}/${id}`);
      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(axiosErrorToMessage(error));
    }
  }
);

export const deleteNationalGameSlice = createSlice({
  name: 'deleteNationalGame',
  initialState: {
    loading: false,
    error: null,
    success: false,
  },
  reducers: {
    resetDeleteNationalGameState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(deleteNationalGame.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteNationalGame.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(deleteNationalGame.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetDeleteNationalGameState } = deleteNationalGameSlice.actions;
export default deleteNationalGameSlice.reducer; 