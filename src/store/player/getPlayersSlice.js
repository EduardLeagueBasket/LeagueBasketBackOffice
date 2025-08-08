import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { apiGet } from '../../api/api';

export const getPlayersSlice = createSlice({
  name: 'getPlayers',
  initialState: {
    players: [],
    loading: false,
    error: null,
    pagination: {
      currentPage: 1,
      totalPages: 0,
      totalUsers: 0,
      pageSize: 10
    }
  },
  reducers: {
    setPlayers: (state, action) => {
      state.players = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getPlayers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPlayers.fulfilled, (state, action) => {
        state.loading = false;
        //state.players = action.payload.data || [];
        state.players = Array.isArray(action.payload) ? action.payload : [];
        state.pagination = {
          currentPage: action.payload.page || 1,
          totalPages: action.payload.totalPages || 0,
          totalUsers: action.payload.total || 0,
          pageSize: action.payload.pageSize || 10
        };
      })
      .addCase(getPlayers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const getPlayers = createAsyncThunk('getPlayers',
  async (params = {}, thunkAPI) => {
    try {
      const response = await apiGet('/players', params);
      return response;
    } catch (error) {
      console.error('getPlayers API error:', error);
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const { setPlayers } = getPlayersSlice.actions;
export default getPlayersSlice.reducer;