import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiPost } from '../../api/api';

export const createPlayer = createAsyncThunk(
  'createPlayer',
  async (player, thunkAPI) => {
    try {
      // Determinar el endpoint basado en el tipo de equipo
      const endpoint = player.teamType === 'national' ? '/national-team-players' : '/players';

      const response = await apiPost(endpoint, player, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  }
);

const createPlayerSlice = createSlice({
  name: 'createPlayer',
  initialState: {
    player: null,
    loading: false,
    error: null,
  },
  reducers: {
    resetPlayer: (state) => {
      state.player = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(createPlayer.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(createPlayer.fulfilled, (state, action) => {
      state.player = action.payload;
    });
    builder.addCase(createPlayer.rejected, (state, action) => {
      state.error = action.payload;
    });
    /*builder.addCase(createPlayer.pending, (state) => {
      state.loading = false;
    });*/
  },
});

export const { resetPlayer } = createPlayerSlice.actions;
export default createPlayerSlice.reducer;