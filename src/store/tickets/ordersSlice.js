import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { adminPath, apiGet } from '../../api/api';
import { TICKETS_ORDERS_PATH, normalizeList } from '../../utils/ticketsApi';
import { axiosErrorToMessage } from '../../utils/apiErrorMessage';

export const getTicketOrders = createAsyncThunk(
  'ticketOrders/getAll',
  async (params = {}, thunkAPI) => {
    try {
      const response = await apiGet(adminPath(TICKETS_ORDERS_PATH), params);
      return normalizeList(response);
    } catch (error) {
      return thunkAPI.rejectWithValue(axiosErrorToMessage(error));
    }
  },
);

export const getTicketOrder = createAsyncThunk(
  'ticketOrders/getOne',
  async (id, thunkAPI) => {
    try {
      return await apiGet(adminPath(`${TICKETS_ORDERS_PATH}/${id}`));
    } catch (error) {
      return thunkAPI.rejectWithValue(axiosErrorToMessage(error));
    }
  },
);

const ordersSlice = createSlice({
  name: 'ticketOrders',
  initialState: {
    list: [],
    item: null,
    loading: false,
    detailLoading: false,
    error: null,
  },
  reducers: {
    clearTicketOrderDetail: (state) => {
      state.item = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getTicketOrders.pending, (state) => {
        state.loading = true;
      })
      .addCase(getTicketOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(getTicketOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getTicketOrder.pending, (state) => {
        state.detailLoading = true;
      })
      .addCase(getTicketOrder.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.item = action.payload;
      })
      .addCase(getTicketOrder.rejected, (state, action) => {
        state.detailLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearTicketOrderDetail } = ordersSlice.actions;
export default ordersSlice.reducer;
