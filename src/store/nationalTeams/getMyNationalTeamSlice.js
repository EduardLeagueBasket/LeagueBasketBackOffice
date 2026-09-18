import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { adminPath, apiGet } from "../../api/api";

export const getMyNationalTeam = createAsyncThunk(
  '/national-teams/teams/me',
  async (_,thunkAPI) => {
    try {
      const response = await apiGet(adminPath('/national-teams/teams/me'));
      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
)

export const getMyNationalTeamSlice = createSlice({
  name: 'getMyNationalTeam',
  initialState: {
    myNationalTeam: null,
    loading: false,
    error: null,
  },
  reducers: {
    setMyNationalTeam: (state, action) => {
      state.myNationalTeam = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getMyNationalTeam.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMyNationalTeam.fulfilled, (state, action) => {
        state.loading = false;
        state.myNationalTeam = action.payload;
      })
      .addCase(getMyNationalTeam.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
})

export const { setMyNationalTeam } = getMyNationalTeamSlice.actions;
export default getMyNationalTeamSlice.reducer;