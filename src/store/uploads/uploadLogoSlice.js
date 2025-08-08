import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiPost } from '../../api/api';

export const uploadLogo = createAsyncThunk(
  'logo/uploadLogo',
  async ({ file, folder = 'league-logos', referenceId, type }, thunkAPI) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('referenceId', referenceId);
      formData.append('type', type);

      const response = await apiPost(`/upload/image?folder=${folder}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          thunkAPI.dispatch(setProgress(progress));
        },
      });

      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

const uploadLogoSlice = createSlice({
  name: 'uploadLogo',
  initialState: {
    loading: false,
    error: null,
    url: '',
    progress: 0,
    processComplete: false,
  },
  reducers: {
    clearUpload: (state) => {
      state.loading = false;
      state.error = null;
      state.url = '';
      state.progress = 0;
      state.processComplete = false;
    },
    setProgress: (state, action) => {
      state.progress = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(uploadLogo.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.processComplete = false;
      })
      .addCase(uploadLogo.fulfilled, (state, action) => {
        console.log('uploadLogo.fulfilled - setting processComplete to true');
        state.processComplete = true;
        state.loading = false;
        state.url = action.payload?.url;
        state.progress = 100;
      })
      .addCase(uploadLogo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Error al subir logo';
        state.processComplete = false;
      });
  },
});

export const { clearUpload, setProgress } = uploadLogoSlice.actions;
export default uploadLogoSlice.reducer;
