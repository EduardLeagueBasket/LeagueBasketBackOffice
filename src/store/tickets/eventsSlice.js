import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { adminPath, apiGet, apiPatch, apiPost } from '../../api/api';
import { TICKETS_EVENTS_PATH, normalizeList } from '../../utils/ticketsApi';
import { axiosErrorToMessage } from '../../utils/apiErrorMessage';

export const getTicketEvents = createAsyncThunk(
  'ticketEvents/getAll',
  async (params = {}, thunkAPI) => {
    try {
      const response = await apiGet(adminPath(TICKETS_EVENTS_PATH), params);
      return normalizeList(response);
    } catch (error) {
      return thunkAPI.rejectWithValue(axiosErrorToMessage(error));
    }
  },
);

export const getTicketEvent = createAsyncThunk(
  'ticketEvents/getOne',
  async (id, thunkAPI) => {
    try {
      return await apiGet(adminPath(`${TICKETS_EVENTS_PATH}/${id}`));
    } catch (error) {
      return thunkAPI.rejectWithValue(axiosErrorToMessage(error));
    }
  },
);

export const createTicketEvent = createAsyncThunk(
  'ticketEvents/create',
  async (data, thunkAPI) => {
    try {
      return await apiPost(adminPath(TICKETS_EVENTS_PATH), data);
    } catch (error) {
      return thunkAPI.rejectWithValue(axiosErrorToMessage(error));
    }
  },
);

export const updateTicketEvent = createAsyncThunk(
  'ticketEvents/update',
  async ({ id, data }, thunkAPI) => {
    try {
      return await apiPatch(adminPath(`${TICKETS_EVENTS_PATH}/${id}`), data);
    } catch (error) {
      return thunkAPI.rejectWithValue(axiosErrorToMessage(error));
    }
  },
);

export const getEventSections = createAsyncThunk(
  'ticketEvents/getSections',
  async (eventId, thunkAPI) => {
    try {
      const response = await apiGet(
        adminPath(`${TICKETS_EVENTS_PATH}/${eventId}/sections`),
      );
      return normalizeList(response);
    } catch (error) {
      return thunkAPI.rejectWithValue(axiosErrorToMessage(error));
    }
  },
);

export const createEventSection = createAsyncThunk(
  'ticketEvents/createSection',
  async ({ eventId, data }, thunkAPI) => {
    try {
      return await apiPost(
        adminPath(`${TICKETS_EVENTS_PATH}/${eventId}/sections`),
        data,
      );
    } catch (error) {
      return thunkAPI.rejectWithValue(axiosErrorToMessage(error));
    }
  },
);

export const updateEventSection = createAsyncThunk(
  'ticketEvents/updateSection',
  async ({ id, data }, thunkAPI) => {
    try {
      return await apiPatch(
        adminPath(`${TICKETS_EVENTS_PATH}/sections/${id}`),
        data,
      );
    } catch (error) {
      return thunkAPI.rejectWithValue(axiosErrorToMessage(error));
    }
  },
);

const eventsSlice = createSlice({
  name: 'ticketEvents',
  initialState: {
    list: [],
    item: null,
    eventSections: [],
    loading: false,
    detailLoading: false,
    sectionsLoading: false,
    saving: false,
    error: null,
  },
  reducers: {
    clearTicketEventDetail: (state) => {
      state.item = null;
      state.eventSections = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getTicketEvents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTicketEvents.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(getTicketEvents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getTicketEvent.pending, (state) => {
        state.detailLoading = true;
      })
      .addCase(getTicketEvent.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.item = action.payload;
      })
      .addCase(getTicketEvent.rejected, (state, action) => {
        state.detailLoading = false;
        state.error = action.payload;
      })
      .addCase(getEventSections.pending, (state) => {
        state.sectionsLoading = true;
      })
      .addCase(getEventSections.fulfilled, (state, action) => {
        state.sectionsLoading = false;
        state.eventSections = action.payload;
      })
      .addCase(getEventSections.rejected, (state, action) => {
        state.sectionsLoading = false;
        state.error = action.payload;
      })
      .addCase(createTicketEvent.pending, (state) => {
        state.saving = true;
      })
      .addCase(createTicketEvent.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(createTicketEvent.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      })
      .addCase(updateTicketEvent.pending, (state) => {
        state.saving = true;
      })
      .addCase(updateTicketEvent.fulfilled, (state, action) => {
        state.saving = false;
        state.item = action.payload;
      })
      .addCase(updateTicketEvent.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      });
  },
});

export const { clearTicketEventDetail } = eventsSlice.actions;
export default eventsSlice.reducer;
