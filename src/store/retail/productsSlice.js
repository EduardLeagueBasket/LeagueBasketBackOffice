import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  adminPath,
  apiDelete,
  apiGet,
  apiPatch,
  apiPatchFormData,
  apiPost,
  apiPostFormData,
} from '../../api/api';
import { RETAIL_PRODUCTS_PATH, normalizeList } from '../../utils/retailApi';
import { axiosErrorToMessage } from '../../utils/apiErrorMessage';

export const getRetailProducts = createAsyncThunk(
  'retailProducts/getAll',
  async (params = {}, thunkAPI) => {
    try {
      const response = await apiGet(adminPath(RETAIL_PRODUCTS_PATH), params);
      return normalizeList(response);
    } catch (error) {
      return thunkAPI.rejectWithValue(axiosErrorToMessage(error));
    }
  },
);

export const getRetailProduct = createAsyncThunk(
  'retailProducts/getOne',
  async (id, thunkAPI) => {
    try {
      return await apiGet(adminPath(`${RETAIL_PRODUCTS_PATH}/${id}`));
    } catch (error) {
      return thunkAPI.rejectWithValue(axiosErrorToMessage(error));
    }
  },
);

export const createRetailProduct = createAsyncThunk(
  'retailProducts/create',
  async (data, thunkAPI) => {
    try {
      const isFormData =
        typeof FormData !== 'undefined' && data instanceof FormData;
      if (isFormData) {
        return await apiPostFormData(adminPath(RETAIL_PRODUCTS_PATH), data);
      }
      return await apiPost(adminPath(RETAIL_PRODUCTS_PATH), data);
    } catch (error) {
      return thunkAPI.rejectWithValue(axiosErrorToMessage(error));
    }
  },
);

export const updateRetailProduct = createAsyncThunk(
  'retailProducts/update',
  async ({ id, data }, thunkAPI) => {
    try {
      const isFormData =
        typeof FormData !== 'undefined' && data instanceof FormData;
      if (isFormData) {
        return await apiPatchFormData(
          adminPath(`${RETAIL_PRODUCTS_PATH}/${id}`),
          data,
        );
      }
      return await apiPatch(adminPath(`${RETAIL_PRODUCTS_PATH}/${id}`), data);
    } catch (error) {
      return thunkAPI.rejectWithValue(axiosErrorToMessage(error));
    }
  },
);

export const deactivateRetailProduct = createAsyncThunk(
  'retailProducts/deactivate',
  async (id, thunkAPI) => {
    try {
      return await apiDelete(adminPath(`${RETAIL_PRODUCTS_PATH}/${id}`));
    } catch (error) {
      return thunkAPI.rejectWithValue(axiosErrorToMessage(error));
    }
  },
);

const productsSlice = createSlice({
  name: 'retailProducts',
  initialState: {
    products: [],
    product: null,
    loading: false,
    detailLoading: false,
    saving: false,
    error: null,
  },
  reducers: {
    clearRetailProductDetail: (state) => {
      state.product = null;
      state.detailLoading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getRetailProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getRetailProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload;
      })
      .addCase(getRetailProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getRetailProduct.pending, (state) => {
        state.detailLoading = true;
        state.error = null;
      })
      .addCase(getRetailProduct.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.product = action.payload;
      })
      .addCase(getRetailProduct.rejected, (state, action) => {
        state.detailLoading = false;
        state.error = action.payload;
      })
      .addCase(createRetailProduct.pending, (state) => {
        state.saving = true;
      })
      .addCase(createRetailProduct.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(createRetailProduct.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      })
      .addCase(updateRetailProduct.pending, (state) => {
        state.saving = true;
      })
      .addCase(updateRetailProduct.fulfilled, (state, action) => {
        state.saving = false;
        state.product = action.payload;
      })
      .addCase(updateRetailProduct.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      });
  },
});

export const { clearRetailProductDetail } = productsSlice.actions;
export default productsSlice.reducer;
