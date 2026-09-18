import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { adminPath, apiDelete, apiGet, apiPostFormData } from '../../api/api';

const ARTICLES_PATH = adminPath('/content/articles');

const withPublisherParams = (entityType, entityId) => {
  const params = {};
  if (entityType) params.entityType = entityType;
  if (entityId) params.entityId = entityId;
  return params;
};

export const getMyArticles = createAsyncThunk(
  'articles/getMyArticles',
  async ({ entityType, entityId } = {}, thunkAPI) => {
    try {
      return await apiGet(ARTICLES_PATH, withPublisherParams(entityType, entityId));
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          'No se pudieron cargar los artículos',
      );
    }
  },
);

export const getArticlesFeed = createAsyncThunk(
  'articles/getArticlesFeed',
  async (countryCode, thunkAPI) => {
    try {
      return await apiGet(`${ARTICLES_PATH}/feed`, { countryCode });
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          'No se pudo cargar el feed de artículos',
      );
    }
  },
);

export const createArticle = createAsyncThunk(
  'articles/createArticle',
  async (payload, thunkAPI) => {
    try {
      const formData = new FormData();
      formData.append('title', payload.title);
      formData.append('content', payload.content);
      formData.append('categoryId', payload.categoryId);
      if (payload.summary) formData.append('summary', payload.summary);
      if (payload.file) formData.append('file', payload.file);
      if (payload.entityType) formData.append('entityType', payload.entityType);
      if (payload.entityId) formData.append('entityId', payload.entityId);
      if (payload.targetCountryCode) {
        formData.append('targetCountryCode', payload.targetCountryCode);
      }
      if (payload.isFeatured) formData.append('isFeatured', 'true');
      return await apiPostFormData(ARTICLES_PATH, formData);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          'No se pudo crear el artículo',
      );
    }
  },
);

export const deleteArticle = createAsyncThunk(
  'articles/deleteArticle',
  async ({ id, entityType, entityId }, thunkAPI) => {
    try {
      const params = new URLSearchParams(withPublisherParams(entityType, entityId));
      const qs = params.toString();
      return await apiDelete(`${ARTICLES_PATH}/${id}${qs ? `?${qs}` : ''}`);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          'No se pudo eliminar el artículo',
      );
    }
  },
);

const articlesSlice = createSlice({
  name: 'articles',
  initialState: {
    articles: [],
    publisher: null,
    feedCountry: null,
    loading: false,
    creating: false,
    error: null,
  },
  reducers: {
    clearArticlesError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getMyArticles.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.feedCountry = null;
      })
      .addCase(getMyArticles.fulfilled, (state, action) => {
        state.loading = false;
        state.articles = action.payload?.articles ?? [];
        state.publisher = action.payload?.publisher ?? null;
      })
      .addCase(getMyArticles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Error al listar artículos';
      })
      .addCase(getArticlesFeed.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getArticlesFeed.fulfilled, (state, action) => {
        state.loading = false;
        state.articles = action.payload?.articles ?? [];
        state.feedCountry = action.payload?.countryCode ?? null;
        state.publisher = null;
      })
      .addCase(getArticlesFeed.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Error al cargar el feed';
      })
      .addCase(createArticle.pending, (state) => {
        state.creating = true;
        state.error = null;
      })
      .addCase(createArticle.fulfilled, (state) => {
        state.creating = false;
      })
      .addCase(createArticle.rejected, (state, action) => {
        state.creating = false;
        state.error = action.payload || 'Error al crear artículo';
      })
      .addCase(deleteArticle.fulfilled, (state, action) => {
        const deletedId = action.meta.arg?.id;
        state.articles = state.articles.filter((item) => item.id !== deletedId);
      });
  },
});

export const { clearArticlesError } = articlesSlice.actions;
export default articlesSlice.reducer;
