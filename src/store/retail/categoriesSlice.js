import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { adminPath, apiGet } from '../../api/api';
import { RETAIL_CATEGORIES_PATH, normalizeList } from '../../utils/retailApi';
import { axiosErrorToMessage } from '../../utils/apiErrorMessage';

export const getRetailCategories = createAsyncThunk(
  'retailCategories/getAll',
  async (_, thunkAPI) => {
    try {
      const response = await apiGet(adminPath(RETAIL_CATEGORIES_PATH));
      return normalizeList(response);
    } catch (error) {
      return thunkAPI.rejectWithValue(axiosErrorToMessage(error));
    }
  },
);

const categoriesSlice = createSlice({
  name: 'retailCategories',
  initialState: {
    categories: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getRetailCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getRetailCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(getRetailCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default categoriesSlice.reducer;
