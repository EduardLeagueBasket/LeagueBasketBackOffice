import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { adminPath, apiGet, apiPost } from '../../api/api';
import { TICKETS_POINTS_PATH } from '../../utils/ticketsApi';
import { axiosErrorToMessage } from '../../utils/apiErrorMessage';

export const getPointsWallet = createAsyncThunk(
  'ticketPoints/getWallet',
  async (userId, thunkAPI) => {
    try {
      return await apiGet(adminPath(`${TICKETS_POINTS_PATH}/wallet`), { userId });
    } catch (error) {
      return thunkAPI.rejectWithValue(axiosErrorToMessage(error));
    }
  },
);

export const getPointsTransactions = createAsyncThunk(
  'ticketPoints/getTransactions',
  async (userId, thunkAPI) => {
    try {
      const response = await apiGet(
        adminPath(`${TICKETS_POINTS_PATH}/transactions`),
        { userId },
      );
      return Array.isArray(response) ? response : response?.data ?? [];
    } catch (error) {
      return thunkAPI.rejectWithValue(axiosErrorToMessage(error));
    }
  },
);

export const adjustPoints = createAsyncThunk(
  'ticketPoints/adjust',
  async (data, thunkAPI) => {
    try {
      return await apiPost(adminPath(`${TICKETS_POINTS_PATH}/adjust`), data);
    } catch (error) {
      return thunkAPI.rejectWithValue(axiosErrorToMessage(error));
    }
  },
);

const pointsSlice = createSlice({
  name: 'ticketPoints',
  initialState: {
    wallet: null,
    transactions: [],
    loading: false,
    saving: false,
    error: null,
  },
  reducers: {
    clearPointsState: (state) => {
      state.wallet = null;
      state.transactions = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getPointsWallet.pending, (state) => {
        state.loading = true;
      })
      .addCase(getPointsWallet.fulfilled, (state, action) => {
        state.loading = false;
        state.wallet = action.payload;
      })
      .addCase(getPointsWallet.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getPointsTransactions.fulfilled, (state, action) => {
        state.transactions = action.payload;
      })
      .addCase(adjustPoints.pending, (state) => {
        state.saving = true;
      })
      .addCase(adjustPoints.fulfilled, (state, action) => {
        state.saving = false;
        state.wallet = action.payload;
      })
      .addCase(adjustPoints.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      });
  },
});

export const { clearPointsState } = pointsSlice.actions;
export default pointsSlice.reducer;
