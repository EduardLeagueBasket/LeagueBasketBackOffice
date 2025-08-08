import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiGet } from "../../api/api";

export const getNationalTeamPlayers = createAsyncThunk(
  'nationalTeamPlayers/getAll',
  async (params = {}, thunkAPI) => {
    try {
      const response = await apiGet('/national-team-players', params);
      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const getNationalTeamPlayersSlice = createSlice({
  name: 'nationalTeamPlayers',
  initialState: {
    players: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearNationalTeamPlayers: (state) => {
      state.players = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getNationalTeamPlayers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getNationalTeamPlayers.fulfilled, (state, action) => {
        state.loading = false;
        state.players = action.payload;
        state.error = null;
      })
      .addCase(getNationalTeamPlayers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearNationalTeamPlayers } = getNationalTeamPlayersSlice.actions;
export default getNationalTeamPlayersSlice.reducer; 