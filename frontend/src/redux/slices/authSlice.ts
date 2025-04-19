import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Auth } from "../../types/types";



const initialState: Auth = {
  user: {
    userName: null,
    email: null,
    isBlocked: null,
    role: null,
    isVerified: null
  },
  accessToken: null
}


const authSlice = createSlice({
  name: "auth",
  initialState: initialState,
  reducers: {
    setAuth: (state, action: PayloadAction<Auth>) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
    },
    setAccessToken: (state, action: PayloadAction<string>) => {
      state.accessToken = action.payload;
    },
    removeAuth: (state) => {
      state.user.userName = null;
      state.user.email = null;
      state.user.role = null;
      state.user.isBlocked = null;
      state.user.isVerified = null;
      state.accessToken = null;
    },
  }

})

export const { setAuth, setAccessToken, removeAuth } = authSlice.actions;
export default authSlice.reducer;