import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface LocationState {
  isTracking: boolean;
  userId: string | null;
}

const initialState: LocationState = {
  isTracking: false,
  userId: null,
};

const locationSlice = createSlice({
  name: "location",
  initialState,
  reducers: {
    setUserIdForTracking: (state, action: PayloadAction<{ userId: string; role: string | null }>) => {
      if (action.payload.role === "user") {
        state.userId = action.payload.userId;
      }
    },
    startTracking: (state) => {
      if (state.userId) {
        state.isTracking = true;
      }
    },
    stopTracking: (state) => {
      state.isTracking = false;
    },
    clearUserId: (state) => {
      state.userId = null;
      state.isTracking = false;
    },
  },
});

export const { setUserIdForTracking, startTracking, stopTracking, clearUserId } = locationSlice.actions;
export default locationSlice.reducer;