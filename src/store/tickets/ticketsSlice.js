import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { adminPath, apiGet, apiPost } from '../../api/api';
import { TICKETS_PATH, normalizeList } from '../../utils/ticketsApi';
import { axiosErrorToMessage } from '../../utils/apiErrorMessage';

export const getTickets = createAsyncThunk(
  'ticketsAdmin/getAll',
  async (params = {}, thunkAPI) => {
    try {
      const response = await apiGet(adminPath(TICKETS_PATH), params);
      return normalizeList(response);
    } catch (error) {
      return thunkAPI.rejectWithValue(axiosErrorToMessage(error));
    }
  },
);

export const assignTicket = createAsyncThunk(
  'ticketsAdmin/assign',
  async (data, thunkAPI) => {
    try {
      return await apiPost(adminPath(`${TICKETS_PATH}/assign`), data);
    } catch (error) {
      return thunkAPI.rejectWithValue(axiosErrorToMessage(error));
    }
  },
);

export const registerTaquillaTicket = createAsyncThunk(
  'ticketsAdmin/taquilla',
  async (data, thunkAPI) => {
    try {
      return await apiPost(adminPath(`${TICKETS_PATH}/taquilla`), data);
    } catch (error) {
      return thunkAPI.rejectWithValue(axiosErrorToMessage(error));
    }
  },
);

const ticketsSlice = createSlice({
  name: 'ticketsAdmin',
  initialState: {
    list: [],
    loading: false,
    saving: false,
    error: null,
  },
  extraReducers: (builder) => {
    builder
      .addCase(getTickets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTickets.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(getTickets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(assignTicket.pending, (state) => {
        state.saving = true;
      })
      .addCase(assignTicket.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(assignTicket.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      })
      .addCase(registerTaquillaTicket.pending, (state) => {
        state.saving = true;
      })
      .addCase(registerTaquillaTicket.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(registerTaquillaTicket.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      });
  },
});

export default ticketsSlice.reducer;
