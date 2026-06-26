import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  mobileNumber: '',
  user: null
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setMobileNumber(state, action) {
      state.mobileNumber = action.payload;
    },
    setUser(state, action) {
      state.user = action.payload;
    },
    resetAuth() {
      return initialState;
    }
  }
});

export const { setMobileNumber, setUser, resetAuth } = authSlice.actions;

export default authSlice.reducer;
