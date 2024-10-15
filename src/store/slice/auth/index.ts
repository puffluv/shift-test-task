import { sendOtp, sendPhone } from "@/store/thunks/auth";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  phone: string;
  otp: number;
  isPhoneVerified: boolean;
  timer: number;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  user: any | null;
}

const initialState: AuthState = {
  phone: "",
  otp: 0,
  isPhoneVerified: false,
  timer: 60,
  status: "idle",
  error: null,
  user: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    resetAuthState: (state) => {
      state.phone = "";
      state.otp = 0;
      state.isPhoneVerified = false;
      state.timer = 60;
      state.status = "idle";
      state.error = null;
    },
    resetStatus: (state) => {
      state.status = "idle";
      state.error = null;
    },
    startTimer: (state) => {
      if (state.isPhoneVerified) {
        state.timer = 60;
      }
    },
    decrementTimer: (state) => {
      if (state.timer > 0) state.timer -= 1;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendPhone.pending, (state) => {
        state.status = "loading";
      })
      .addCase(sendPhone.fulfilled, (state, action: PayloadAction<string>) => {
        state.status = "succeeded";
        state.phone = action.payload;
        state.user = action.payload;
        state.isPhoneVerified = true;
      })
      .addCase(sendPhone.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
        state.error = action.error.message ?? null;
      })
      .addCase(sendOtp.pending, (state) => {
        state.status = "loading";
      })
      .addCase(sendOtp.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.phone = "";
        state.otp = 0;
        state.isPhoneVerified = false;
        state.timer = 60;
        state.error = null;
        state.user = action.payload;
      })
      .addCase(sendOtp.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });
  },
});

export const { resetAuthState, resetStatus, startTimer, decrementTimer } =
  authSlice.actions;

export default authSlice.reducer;
