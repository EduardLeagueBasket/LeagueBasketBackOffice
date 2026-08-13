import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { adminPath, apiGet, apiPatch, apiPost } from '../../api/api';
import { TICKETS_PROMOTIONS_PATH, normalizeList } from '../../utils/ticketsApi';
import { axiosErrorToMessage } from '../../utils/apiErrorMessage';

export const getTicketPromotions = createAsyncThunk(
  'ticketPromotions/getAll',
  async (params = {}, thunkAPI) => {
    try {
      const response = await apiGet(adminPath(TICKETS_PROMOTIONS_PATH), params);
      return normalizeList(response);
    } catch (error) {
      return thunkAPI.rejectWithValue(axiosErrorToMessage(error));
    }
  },
);

export const getTicketPromotion = createAsyncThunk(
  'ticketPromotions/getOne',
  async (id, thunkAPI) => {
    try {
      return await apiGet(adminPath(`${TICKETS_PROMOTIONS_PATH}/${id}`));
    } catch (error) {
      return thunkAPI.rejectWithValue(axiosErrorToMessage(error));
    }
  },
);

export const createTicketPromotion = createAsyncThunk(
  'ticketPromotions/create',
  async (data, thunkAPI) => {
    try {
      return await apiPost(adminPath(TICKETS_PROMOTIONS_PATH), data);
    } catch (error) {
      return thunkAPI.rejectWithValue(axiosErrorToMessage(error));
    }
  },
);

export const updateTicketPromotion = createAsyncThunk(
  'ticketPromotions/update',
  async ({ id, data }, thunkAPI) => {
    try {
      return await apiPatch(adminPath(`${TICKETS_PROMOTIONS_PATH}/${id}`), data);
    } catch (error) {
      return thunkAPI.rejectWithValue(axiosErrorToMessage(error));
    }
  },
);

const promotionsSlice = createSlice({
  name: 'ticketPromotions',
  initialState: {
    list: [],
    item: null,
    loading: false,
    detailLoading: false,
    saving: false,
    error: null,
  },
  reducers: {
    clearTicketPromotionDetail: (state) => {
      state.item = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getTicketPromotions.pending, (state) => {
        state.loading = true;
      })
      .addCase(getTicketPromotions.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(getTicketPromotions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getTicketPromotion.fulfilled, (state, action) => {
        state.item = action.payload;
      })
      .addCase(createTicketPromotion.pending, (state) => {
        state.saving = true;
      })
      .addCase(createTicketPromotion.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(createTicketPromotion.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      })
      .addCase(updateTicketPromotion.pending, (state) => {
        state.saving = true;
      })
      .addCase(updateTicketPromotion.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(updateTicketPromotion.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      });
  },
});

export const { clearTicketPromotionDetail } = promotionsSlice.actions;
export default promotionsSlice.reducer;
