import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { adminPath, apiGet, apiPatch, apiPost } from '../../api/api';
import { TICKETS_VENUES_PATH, normalizeList } from '../../utils/ticketsApi';
import { axiosErrorToMessage } from '../../utils/apiErrorMessage';

export const getTicketVenues = createAsyncThunk(
  'ticketVenues/getAll',
  async (params = {}, thunkAPI) => {
    try {
      const response = await apiGet(adminPath(TICKETS_VENUES_PATH), params);
      return normalizeList(response);
    } catch (error) {
      return thunkAPI.rejectWithValue(axiosErrorToMessage(error));
    }
  },
);

export const getTicketVenue = createAsyncThunk(
  'ticketVenues/getOne',
  async (id, thunkAPI) => {
    try {
      return await apiGet(adminPath(`${TICKETS_VENUES_PATH}/${id}`));
    } catch (error) {
      return thunkAPI.rejectWithValue(axiosErrorToMessage(error));
    }
  },
);

export const createTicketVenue = createAsyncThunk(
  'ticketVenues/create',
  async (data, thunkAPI) => {
    try {
      return await apiPost(adminPath(TICKETS_VENUES_PATH), data);
    } catch (error) {
      return thunkAPI.rejectWithValue(axiosErrorToMessage(error));
    }
  },
);

export const updateTicketVenue = createAsyncThunk(
  'ticketVenues/update',
  async ({ id, data }, thunkAPI) => {
    try {
      return await apiPatch(adminPath(`${TICKETS_VENUES_PATH}/${id}`), data);
    } catch (error) {
      return thunkAPI.rejectWithValue(axiosErrorToMessage(error));
    }
  },
);

const venuesSlice = createSlice({
  name: 'ticketVenues',
  initialState: {
    list: [],
    item: null,
    loading: false,
    detailLoading: false,
    saving: false,
    error: null,
  },
  reducers: {
    clearTicketVenueDetail: (state) => {
      state.item = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getTicketVenues.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTicketVenues.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(getTicketVenues.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getTicketVenue.pending, (state) => {
        state.detailLoading = true;
      })
      .addCase(getTicketVenue.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.item = action.payload;
      })
      .addCase(getTicketVenue.rejected, (state, action) => {
        state.detailLoading = false;
        state.error = action.payload;
      })
      .addCase(createTicketVenue.pending, (state) => {
        state.saving = true;
      })
      .addCase(createTicketVenue.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(createTicketVenue.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      })
      .addCase(updateTicketVenue.pending, (state) => {
        state.saving = true;
      })
      .addCase(updateTicketVenue.fulfilled, (state, action) => {
        state.saving = false;
        state.item = action.payload;
      })
      .addCase(updateTicketVenue.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      });
  },
});

export const { clearTicketVenueDetail } = venuesSlice.actions;
export default venuesSlice.reducer;
