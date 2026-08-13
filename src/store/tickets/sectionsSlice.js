import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { adminPath, apiGet, apiPatch, apiPost } from '../../api/api';
import { TICKETS_SECTIONS_PATH, normalizeList } from '../../utils/ticketsApi';
import { axiosErrorToMessage } from '../../utils/apiErrorMessage';

export const getTicketSections = createAsyncThunk(
  'ticketSections/getAll',
  async (params = {}, thunkAPI) => {
    try {
      const response = await apiGet(adminPath(TICKETS_SECTIONS_PATH), params);
      return normalizeList(response);
    } catch (error) {
      return thunkAPI.rejectWithValue(axiosErrorToMessage(error));
    }
  },
);

export const createTicketSection = createAsyncThunk(
  'ticketSections/create',
  async (data, thunkAPI) => {
    try {
      return await apiPost(adminPath(TICKETS_SECTIONS_PATH), data);
    } catch (error) {
      return thunkAPI.rejectWithValue(axiosErrorToMessage(error));
    }
  },
);

export const updateTicketSection = createAsyncThunk(
  'ticketSections/update',
  async ({ id, data }, thunkAPI) => {
    try {
      return await apiPatch(adminPath(`${TICKETS_SECTIONS_PATH}/${id}`), data);
    } catch (error) {
      return thunkAPI.rejectWithValue(axiosErrorToMessage(error));
    }
  },
);

const sectionsSlice = createSlice({
  name: 'ticketSections',
  initialState: {
    list: [],
    loading: false,
    saving: false,
    error: null,
  },
  extraReducers: (builder) => {
    builder
      .addCase(getTicketSections.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTicketSections.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(getTicketSections.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createTicketSection.pending, (state) => {
        state.saving = true;
      })
      .addCase(createTicketSection.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(createTicketSection.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      })
      .addCase(updateTicketSection.pending, (state) => {
        state.saving = true;
      })
      .addCase(updateTicketSection.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(updateTicketSection.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      });
  },
});

export default sectionsSlice.reducer;
