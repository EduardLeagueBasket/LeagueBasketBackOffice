import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { adminPath, apiGet, apiPatch } from '../../api/api';
import { RETAIL_ORDERS_PATH, normalizeList } from '../../utils/retailApi';
import { axiosErrorToMessage } from '../../utils/apiErrorMessage';

export const getRetailOrders = createAsyncThunk(
  'retailOrders/getAll',
  async (params = {}, thunkAPI) => {
    try {
      const response = await apiGet(adminPath(RETAIL_ORDERS_PATH), params);
      return normalizeList(response);
    } catch (error) {
      return thunkAPI.rejectWithValue(axiosErrorToMessage(error));
    }
  },
);

export const getRetailOrder = createAsyncThunk(
  'retailOrders/getOne',
  async (id, thunkAPI) => {
    try {
      return await apiGet(adminPath(`${RETAIL_ORDERS_PATH}/${id}`));
    } catch (error) {
      return thunkAPI.rejectWithValue(axiosErrorToMessage(error));
    }
  },
);

export const updateRetailOrderStatus = createAsyncThunk(
  'retailOrders/updateStatus',
  async ({ id, estado }, thunkAPI) => {
    try {
      return await apiPatch(adminPath(`${RETAIL_ORDERS_PATH}/${id}/status`), {
        estado,
      });
    } catch (error) {
      return thunkAPI.rejectWithValue(axiosErrorToMessage(error));
    }
  },
);

const ordersSlice = createSlice({
  name: 'retailOrders',
  initialState: {
    orders: [],
    order: null,
    loading: false,
    detailLoading: false,
    saving: false,
    error: null,
  },
  reducers: {
    clearRetailOrderDetail: (state) => {
      state.order = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getRetailOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getRetailOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(getRetailOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getRetailOrder.pending, (state) => {
        state.detailLoading = true;
      })
      .addCase(getRetailOrder.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.order = action.payload;
      })
      .addCase(getRetailOrder.rejected, (state, action) => {
        state.detailLoading = false;
        state.error = action.payload;
      })
      .addCase(updateRetailOrderStatus.pending, (state) => {
        state.saving = true;
      })
      .addCase(updateRetailOrderStatus.fulfilled, (state, action) => {
        state.saving = false;
        state.order = action.payload;
      })
      .addCase(updateRetailOrderStatus.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      });
  },
});

export const { clearRetailOrderDetail } = ordersSlice.actions;
export default ordersSlice.reducer;
