import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { adminPath, apiDelete, apiGet, apiPostFormData } from '../../api/api';

const STORIES_PATH = adminPath('/content/stories');

const withPublisherParams = (entityType, entityId) => {
  const params = {};
  if (entityType) params.entityType = entityType;
  if (entityId) params.entityId = entityId;
  return params;
};

export const getMyStories = createAsyncThunk(
  'stories/getMyStories',
  async ({ entityType, entityId } = {}, thunkAPI) => {
    try {
      return await apiGet(STORIES_PATH, withPublisherParams(entityType, entityId));
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          'No se pudieron cargar las stories',
      );
    }
  },
);

export const createStory = createAsyncThunk(
  'stories/createStory',
  async ({ file, mediaType, entityType, entityId, targetCountryCode }, thunkAPI) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('mediaType', mediaType);
      if (entityType) formData.append('entityType', entityType);
      if (entityId) formData.append('entityId', entityId);
      if (targetCountryCode) {
        formData.append('targetCountryCode', targetCountryCode);
      }
      return await apiPostFormData(STORIES_PATH, formData);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          'No se pudo crear la story',
      );
    }
  },
);

export const deleteStory = createAsyncThunk(
  'stories/deleteStory',
  async ({ id, entityType, entityId }, thunkAPI) => {
    try {
      const params = new URLSearchParams(withPublisherParams(entityType, entityId));
      const qs = params.toString();
      return await apiDelete(`${STORIES_PATH}/${id}${qs ? `?${qs}` : ''}`);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          'No se pudo eliminar la story',
      );
    }
  },
);

const storiesSlice = createSlice({
  name: 'stories',
  initialState: {
    stories: [],
    publisher: null,
    loading: false,
    creating: false,
    error: null,
  },
  reducers: {
    clearStoriesError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getMyStories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMyStories.fulfilled, (state, action) => {
        state.loading = false;
        state.stories = action.payload?.stories ?? [];
        state.publisher = action.payload?.publisher ?? null;
      })
      .addCase(getMyStories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Error al listar stories';
      })
      .addCase(createStory.pending, (state) => {
        state.creating = true;
        state.error = null;
      })
      .addCase(createStory.fulfilled, (state) => {
        state.creating = false;
      })
      .addCase(createStory.rejected, (state, action) => {
        state.creating = false;
        state.error = action.payload || 'Error al crear story';
      })
      .addCase(deleteStory.fulfilled, (state, action) => {
        const deletedId = action.meta.arg?.id ?? action.meta.arg;
        state.stories = state.stories.filter((s) => s.id !== deletedId);
      });
  },
});

export const { clearStoriesError } = storiesSlice.actions;
export default storiesSlice.reducer;
