import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { adminPath, apiGet, apiPatch, apiPost } from '../../api/api';
import { TICKETS_RAFFLES_PATH, normalizeList } from '../../utils/ticketsApi';
import { axiosErrorToMessage } from '../../utils/apiErrorMessage';

export const getTicketRaffles = createAsyncThunk(
  'ticketRaffles/getAll',
  async (params = {}, thunkAPI) => {
    try {
      const response = await apiGet(adminPath(TICKETS_RAFFLES_PATH), params);
      return normalizeList(response);
    } catch (error) {
      return thunkAPI.rejectWithValue(axiosErrorToMessage(error));
    }
  },
);

export const getTicketRaffle = createAsyncThunk(
  'ticketRaffles/getOne',
  async (id, thunkAPI) => {
    try {
      return await apiGet(adminPath(`${TICKETS_RAFFLES_PATH}/${id}`));
    } catch (error) {
      return thunkAPI.rejectWithValue(axiosErrorToMessage(error));
    }
  },
);

export const createTicketRaffle = createAsyncThunk(
  'ticketRaffles/create',
  async (data, thunkAPI) => {
    try {
      return await apiPost(adminPath(TICKETS_RAFFLES_PATH), data);
    } catch (error) {
      return thunkAPI.rejectWithValue(axiosErrorToMessage(error));
    }
  },
);

export const updateRaffleStatus = createAsyncThunk(
  'ticketRaffles/updateStatus',
  async ({ id, status }, thunkAPI) => {
    try {
      return await apiPatch(adminPath(`${TICKETS_RAFFLES_PATH}/${id}/status`), {
        status,
      });
    } catch (error) {
      return thunkAPI.rejectWithValue(axiosErrorToMessage(error));
    }
  },
);

export const drawRaffle = createAsyncThunk(
  'ticketRaffles/draw',
  async (id, thunkAPI) => {
    try {
      return await apiPost(adminPath(`${TICKETS_RAFFLES_PATH}/${id}/draw`));
    } catch (error) {
      return thunkAPI.rejectWithValue(axiosErrorToMessage(error));
    }
  },
);

export const createRafflePrize = createAsyncThunk(
  'ticketRaffles/createPrize',
  async ({ raffleId, data }, thunkAPI) => {
    try {
      return await apiPost(
        adminPath(`${TICKETS_RAFFLES_PATH}/${raffleId}/prizes`),
        data,
      );
    } catch (error) {
      return thunkAPI.rejectWithValue(axiosErrorToMessage(error));
    }
  },
);

export const assignRafflePrize = createAsyncThunk(
  'ticketRaffles/assignPrize',
  async ({ prizeId, winnerId }, thunkAPI) => {
    try {
      return await apiPost(
        adminPath(`${TICKETS_RAFFLES_PATH}/prizes/${prizeId}/assign`),
        { winnerId },
      );
    } catch (error) {
      return thunkAPI.rejectWithValue(axiosErrorToMessage(error));
    }
  },
);

const rafflesSlice = createSlice({
  name: 'ticketRaffles',
  initialState: {
    list: [],
    item: null,
    loading: false,
    detailLoading: false,
    saving: false,
    error: null,
  },
  reducers: {
    clearTicketRaffleDetail: (state) => {
      state.item = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getTicketRaffles.pending, (state) => {
        state.loading = true;
      })
      .addCase(getTicketRaffles.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(getTicketRaffles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getTicketRaffle.fulfilled, (state, action) => {
        state.item = action.payload;
      })
      .addCase(createTicketRaffle.pending, (state) => {
        state.saving = true;
      })
      .addCase(createTicketRaffle.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(createTicketRaffle.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      });
  },
});

export const { clearTicketRaffleDetail } = rafflesSlice.actions;
export default rafflesSlice.reducer;
