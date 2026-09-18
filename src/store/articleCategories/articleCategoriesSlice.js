import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { adminPath, apiGet, apiPost } from '../../api/api';

const ARTICLE_CATEGORIES_PATH = adminPath('/content/article-categories');

export const getArticleCategories = createAsyncThunk(
  'articleCategories/getArticleCategories',
  async (_, thunkAPI) => {
    try {
      return await apiGet(ARTICLE_CATEGORIES_PATH);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          'No se pudieron cargar las categorías',
      );
    }
  },
);

export const createArticleCategory = createAsyncThunk(
  'articleCategories/createArticleCategory',
  async ({ name, slug }, thunkAPI) => {
    try {
      return await apiPost(ARTICLE_CATEGORIES_PATH, { name, slug });
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          'No se pudo crear la categoría',
      );
    }
  },
);

const articleCategoriesSlice = createSlice({
  name: 'articleCategories',
  initialState: {
    items: [],
    loading: false,
    creating: false,
    error: null,
  },
  reducers: {
    clearArticleCategoriesError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getArticleCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getArticleCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.items = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(getArticleCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Error al listar categorías';
      })
      .addCase(createArticleCategory.pending, (state) => {
        state.creating = true;
        state.error = null;
      })
      .addCase(createArticleCategory.fulfilled, (state, action) => {
        state.creating = false;
        if (action.payload) {
          state.items = [action.payload, ...state.items];
        }
      })
      .addCase(createArticleCategory.rejected, (state, action) => {
        state.creating = false;
        state.error = action.payload || 'Error al crear categoría';
      });
  },
});

export const { clearArticleCategoriesError } = articleCategoriesSlice.actions;
export default articleCategoriesSlice.reducer;
